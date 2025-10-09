import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, ParsedIntent, OllamaMessage } from '../types';
import { useOllama } from './useOllama';
import { useMCPActions } from './useMCPActions';
import { useChatHistory } from './useChatHistory';
import { AI_SIDEBAR_CONFIG, getSystemPrompt } from '@/config/ai-sidebar.config';

interface UseAIChatOptions {
  spaceId?: string;
  baseId?: string;
  tableId?: string;
  onActionComplete?: () => void;
  enableHistory?: boolean; // 是否启用历史记录
  sessionId?: string; // 指定会话 ID
  fields?: Array<{ id: string; name: string; type?: string }>; // 当前表格的字段列表
}

export const useAIChat = (options: UseAIChatOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingIntent, setPendingIntent] = useState<ParsedIntent | null>(null);
  const conversationHistory = useRef<OllamaMessage[]>([]);

  // 聊天历史管理
  const chatHistory = useChatHistory({
    autoSave: options.enableHistory ?? true,
    sessionId: options.sessionId,
    context: {
      spaceId: options.spaceId,
      baseId: options.baseId,
      tableId: options.tableId,
    },
  });

  // 初始化时加载历史消息
  useEffect(() => {
    if (options.enableHistory !== false && chatHistory.currentSessionId) {
      const loadedMessages = chatHistory.loadMessages();
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
        // 重建对话历史
        conversationHistory.current = loadedMessages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
      }
    }
  }, [chatHistory.currentSessionId]);

  // 自动保存消息
  useEffect(() => {
    if (options.enableHistory !== false && messages.length > 0) {
      chatHistory.saveMessages(messages);
    }
  }, [messages, options.enableHistory]);

  const ollama = useOllama(AI_SIDEBAR_CONFIG.ollama);
  const { parseIntent, executeAction, getActionLabel } = useMCPActions();

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

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
        content: getSystemPrompt({
          spaceId: options.spaceId,
          baseId: options.baseId,
          tableId: options.tableId,
          fields: options.fields,
        }),
      };

      const allMessages = [systemMessage, ...conversationHistory.current];

      // 调用 Ollama
      const aiResponse = await ollama.sendMessage(allMessages);

      // 添加到对话历史
      conversationHistory.current.push({
        role: 'assistant',
        content: aiResponse,
      });

      // 解析意图
      const intent = parseIntent(aiResponse);

      if (!intent) {
        // 解析失败，显示原始响应
        addMessage({
          role: 'assistant',
          content: aiResponse || '抱歉，我无法理解你的请求',
        });
        return;
      }

      // 添加 AI 响应消息
      const assistantMessage = addMessage({
        role: 'assistant',
        content: intent.response,
      });

      // 如果有操作意图
      if (intent.action) {
        if (intent.requiresConfirmation) {
          // 需要确认，保存意图
          setPendingIntent(intent);
          addMessage({
            role: 'assistant',
            content: intent.confirmation || '是否执行此操作？',
            action: {
              type: 'confirmation',
              action: intent.action,
              params: intent.params,
            },
          });
        } else {
          // 不需要确认，直接执行
          await executeIntent(intent);
        }
      }
    } catch (err: any) {
      addMessage({
        role: 'assistant',
        content: `❌ 错误: ${err.message || '处理请求时出错'}`,
      });
    }
  }, [options, ollama, parseIntent, addMessage]);

  const executeIntent = useCallback(async (intent: ParsedIntent) => {
    // 添加执行中消息
    const executingMessage = addMessage({
      role: 'assistant',
      content: `⏳ 正在执行：${getActionLabel(intent.action)}...`,
      action: {
        type: 'pending',
        action: intent.action,
        params: intent.params,
      },
    });

    try {
      // 执行操作
      const result = await executeAction(intent);

      // 更新消息为成功状态
      setMessages(prev =>
        prev.map(msg =>
          msg.id === executingMessage.id
            ? {
                ...msg,
                content: `✅ ${getActionLabel(intent.action)}成功`,
                action: {
                  type: 'success',
                  action: intent.action,
                  params: intent.params,
                  result,
                },
              }
            : msg
        )
      );

      // 通知外部更新
      options.onActionComplete?.();
    } catch (err: any) {
      // 更新消息为错误状态
      setMessages(prev =>
        prev.map(msg =>
          msg.id === executingMessage.id
            ? {
                ...msg,
                content: `❌ ${getActionLabel(intent.action)}失败: ${err.message}`,
                action: {
                  type: 'error',
                  action: intent.action,
                  params: intent.params,
                  error: err.message,
                },
              }
            : msg
        )
      );
    }
  }, [addMessage, executeAction, getActionLabel, options]);

  const confirmAction = useCallback(async () => {
    if (!pendingIntent) return;

    await executeIntent(pendingIntent);
    setPendingIntent(null);
  }, [pendingIntent, executeIntent]);

  const cancelAction = useCallback(() => {
    addMessage({
      role: 'assistant',
      content: '操作已取消',
    });
    setPendingIntent(null);
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationHistory.current = [];
    setPendingIntent(null);
  }, []);

  return {
    messages,
    pendingIntent,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
    loading: ollama.loading,
    error: ollama.error,
    
    // 聊天历史管理
    chatHistory,
  };
};

