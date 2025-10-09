import { useState, useCallback, useRef } from 'react';
import { Message, OllamaMessage } from '../types';
import { useOllama } from './useOllama';
import { useMCPClient } from './useMCPClient';
import { AI_SIDEBAR_CONFIG } from '@/config/ai-sidebar.config';

interface UseAIChatWithMCPOptions {
  mcpServerUrl?: string;
  spaceId?: string;
  baseId?: string;
  tableId?: string;
  onActionComplete?: () => void;
}

/**
 * 集成了标准 MCP 协议的 AI 聊天 Hook
 * 
 * 工作流程：
 * 1. 用户发送消息
 * 2. Ollama AI 分析意图
 * 3. AI 决定调用哪个 MCP 工具
 * 4. 通过标准 MCP 协议调用工具
 * 5. 返回结果给用户
 */
export const useAIChatWithMCP = (options: UseAIChatWithMCPOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const conversationHistory = useRef<OllamaMessage[]>([]);

  // Ollama 客户端
  const ollama = useOllama(AI_SIDEBAR_CONFIG.ollama);

  // MCP 客户端
  const mcp = useMCPClient({
    baseUrl: options.mcpServerUrl || 'http://localhost:3001',
    transport: 'http',
    autoConnect: true,
  });

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  /**
   * 构建 System Prompt（包含 MCP 工具信息）
   */
  const getSystemPrompt = useCallback(() => {
    const toolsDescription = mcp.tools.map(tool => 
      `- ${tool.name}: ${tool.description}\n  参数: ${JSON.stringify(tool.inputSchema.properties, null, 2)}`
    ).join('\n');

    return `你是一个数据库管理助手，帮助用户通过自然语言管理数据库。

当前上下文：
- 空间ID: ${options.spaceId || '未选择'}
- 数据库ID: ${options.baseId || '未选择'}
- 表格ID: ${options.tableId || '未选择'}

可用的 MCP 工具：
${toolsDescription || '正在加载...'}

重要规则：
1. 分析用户意图，判断需要调用哪个工具
2. 返回 JSON 格式（不要使用 markdown 代码块）：
{
  "response": "给用户的友好回复",
  "toolCall": {
    "name": "工具名称",
    "arguments": { "参数名": "参数值" }
  },
  "requiresConfirmation": true/false,
  "confirmation": "确认信息（如果需要）"
}

3. 如果只是回答问题，不需要调用工具，返回：
{
  "response": "你的回答"
}

4. **上下文ID使用规则**：
   - 创建数据库时，必须使用当前上下文中的空间ID：space_id = "${options.spaceId}"
   - 创建表格时，必须使用当前上下文中的数据库ID：base_id = "${options.baseId}"
   - 创建字段时，必须使用当前上下文中的表格ID：table_id = "${options.tableId}"
   - 创建记录时，必须使用当前上下文中的表格ID：table_id = "${options.tableId}"
   - 如果用户没有选择相应的上下文（如未选择表格），应该提示用户先选择

5. **记录创建重要规则**：
   - 当用户要求"生成X条记录"时，应该创建X条独立的记录，每条记录包含不同的数据
   - 字段值必须是正确的数据类型：字符串、数字、布尔值等
   - 不要将多个值组合成数组或JSON字符串
   - 每个字段值应该是单个值，不是数组
   - **重要**：必须使用表格的实际字段名称，如"A 文本"、"单选"、"日期"、"附件"等，不要使用"姓名"、"年龄"等假设的字段名称
   - **字段数据格式**：fields参数必须是对象格式，如{"字段名": "值"}，不能是数组格式[{"name": "字段名", "value": "值"}]

示例 1 - 需要调用工具：
用户: "创建一个员工空间"
{
  "response": "好的，我将为你创建一个名为'员工空间'的工作空间",
  "toolCall": {
    "name": "teable_space_create",
    "arguments": { "name": "员工空间" }
  },
  "requiresConfirmation": true,
  "confirmation": "确认创建工作空间'员工空间'吗？"
}

示例 2 - 创建单条记录：
用户: "添加一条员工记录，姓名张三，年龄25"
{
  "response": "好的，我将添加一条员工记录",
  "toolCall": {
    "name": "teable_record_create",
    "arguments": {
      "table_id": "${options.tableId}",
      "fields": {
        "A 文本": "张三",
        "单选": "25"
      }
    }
  },
  "requiresConfirmation": false
}
**注意**：table_id 必须使用上下文中的表格ID（${options.tableId}）

示例 3 - 创建多条记录：
用户: "生成3条记录"
{
  "response": "好的，我将生成3条记录",
  "toolCall": {
    "name": "teable_record_create_batch",
    "arguments": {
      "table_id": "当前选中的表格ID（使用上下文中的表格ID）",
      "count": 3,
      "template": {
        "A 文本": "随机数据"
      }
    }
  },
  "requiresConfirmation": true,
  "confirmation": "确认生成3条记录吗？"
}

示例 4 - 字段格式说明：
**正确格式**：
{
  "fields": {
    "A 文本": "张三",
    "单选": "25"
  }
}

**错误格式**（不要使用）：
{
  "fields": [
    {"name": "姓名", "value": "张三"},
    {"name": "年龄", "value": 25}
  ]
}

示例 5 - 仅回答问题：
用户: "什么是空间？"
{
  "response": "空间是 Teable 中的顶层组织单位，用于组织和管理多个数据库..."
}
`;
  }, [mcp.tools, options.spaceId, options.baseId, options.tableId]);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(async (userMessage: string) => {
    // 添加用户消息
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // 添加到对话历史
    conversationHistory.current.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // 构建完整的消息列表
      const systemMessage: OllamaMessage = {
        role: 'system',
        content: getSystemPrompt(),
      };

      const allMessages = [systemMessage, ...conversationHistory.current];

      // 调用 Ollama AI
      const aiResponse = await ollama.sendMessage(allMessages);

      // 添加到对话历史
      conversationHistory.current.push({
        role: 'assistant',
        content: aiResponse,
      });

      // 解析 AI 响应
      const parsed = parseAIResponse(aiResponse);

      if (!parsed) {
        addMessage({
          role: 'assistant',
          content: aiResponse || '抱歉，我无法理解你的请求',
        });
        return;
      }

      // 添加 AI 响应消息
      addMessage({
        role: 'assistant',
        content: parsed.response,
      });

      // 如果需要调用工具
      if (parsed.toolCall) {
        if (parsed.requiresConfirmation) {
          // 需要确认
          addMessage({
            role: 'assistant',
            content: parsed.confirmation || '是否执行此操作？',
            action: {
              type: 'confirmation',
              action: parsed.toolCall.name as any,
              params: parsed.toolCall.arguments,
            },
          });
        } else {
          // 直接执行
          await executeToolCall(parsed.toolCall.name, parsed.toolCall.arguments);
        }
      }
    } catch (err: any) {
      addMessage({
        role: 'assistant',
        content: `❌ 错误: ${err.message || '处理请求时出错'}`,
      });
    }
  }, [ollama, getSystemPrompt, addMessage, mcp]);

  /**
   * 解析 AI 响应
   */
  const parseAIResponse = (response: string) => {
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      // 尝试修复常见的JSON格式问题
      cleaned = fixJSONFormat(cleaned);

      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.error('[AI] 解析响应失败:', err, response);
      return null;
    }
  };

  /**
   * 修复常见的JSON格式问题
   */
  const fixJSONFormat = (jsonString: string): string => {
    let fixed = jsonString;
    
    // 1. 修复智能引号
    fixed = fixed.replace(/"/g, '"').replace(/"/g, '"');
    
    // 2. 移除末尾可能的逗号
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // 3. 修复未终止的字符串 - 更精确的检测
    // 检查是否以未闭合的引号结尾（不是以"}结尾）
    if (fixed.match(/"[^"]*$/) && !fixed.endsWith('"}')) {
      // 如果以未闭合的引号结尾，添加闭合引号
      fixed = fixed + '"';
    }
    
    // 4. 检查是否缺少最后的闭合括号
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      const missingBraces = openBraces - closeBraces;
      fixed += '}'.repeat(missingBraces);
    }
    
    // 5. 修复字符串中的控制字符（在最后处理，避免影响其他修复）
    fixed = fixed.replace(/"([^"]*?)"/g, (match, p1) => {
      const escaped = p1
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\\/g, '\\\\');
      return `"${escaped}"`;
    });
    
    return fixed;
  };

  /**
   * 执行 MCP 工具调用
   */
  const executeToolCall = useCallback(async (toolName: string, args: Record<string, any>) => {
    // 自动补全缺失的上下文ID
    const enrichedArgs = { ...args };
    
    // 根据工具名称自动补全必要的ID
    switch (toolName) {
      case 'teable_base_create':
        if (!enrichedArgs.space_id && options.spaceId) {
          enrichedArgs.space_id = options.spaceId;
          console.log('[MCP] 自动补全 space_id:', options.spaceId);
        }
        break;
      
      case 'teable_table_create':
        if (!enrichedArgs.base_id && options.baseId) {
          enrichedArgs.base_id = options.baseId;
          console.log('[MCP] 自动补全 base_id:', options.baseId);
        }
        break;
      
      case 'teable_field_create':
      case 'teable_record_create':
        if (!enrichedArgs.table_id && options.tableId) {
          enrichedArgs.table_id = options.tableId;
          console.log('[MCP] 自动补全 table_id:', options.tableId);
        }
        break;
    }
    
    const executingMessage = addMessage({
      role: 'assistant',
      content: `⏳ 正在执行：${toolName}...`,
      action: {
        type: 'pending',
        action: toolName as any,
        params: enrichedArgs,
      },
    });

    try {
      // 调用 MCP 工具
      const result = await mcp.callTool(toolName, enrichedArgs);

      // 更新为成功状态
      setMessages(prev =>
        prev.map(msg =>
          msg.id === executingMessage.id
            ? {
                ...msg,
                content: `✅ ${toolName} 执行成功`,
                action: {
                  type: 'success',
                  action: toolName as any,
                  params: args,
                  result,
                },
              }
            : msg
        )
      );

      // 通知外部
      options.onActionComplete?.();
    } catch (err: any) {
      // 更新为错误状态
      setMessages(prev =>
        prev.map(msg =>
          msg.id === executingMessage.id
            ? {
                ...msg,
                content: `❌ ${toolName} 执行失败: ${err.message}`,
                action: {
                  type: 'error',
                  action: toolName as any,
                  params: args,
                  error: err.message,
                },
              }
            : msg
        )
      );
    }
  }, [mcp, addMessage, options]);

  /**
   * 清空消息
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationHistory.current = [];
  }, []);

  return {
    // 状态
    messages,
    loading: ollama.loading || mcp.loading,
    error: ollama.error || mcp.error,
    mcpConnected: mcp.connected,
    availableTools: mcp.tools,

    // 方法
    sendMessage,
    clearMessages,
    refreshTools: mcp.listTools,

    // MCP 连接管理
    connectMCP: mcp.connect,
    disconnectMCP: mcp.disconnect,
  };
};

