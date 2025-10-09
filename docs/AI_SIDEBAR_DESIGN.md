# AI 侧边栏设计方案

## 概述
将现有的右侧边栏改造为基于 Ollama 的 AI 助手，通过自然语言对话实现数据库操作功能。

## 架构设计

### 1. 前端组件结构

```
AISidebar/
├── AISidebar.tsx           # 主组件
├── ChatMessage.tsx         # 消息显示组件
├── ChatInput.tsx           # 输入框组件
├── ActionCard.tsx          # 操作结果卡片
├── hooks/
│   ├── useOllama.ts       # Ollama API 调用 Hook
│   ├── useMCPActions.ts   # MCP 操作封装 Hook
│   └── useAIChat.ts       # 聊天状态管理 Hook
└── types.ts               # TypeScript 类型定义
```

### 2. 功能特性

#### 2.1 核心功能
- ✅ 与 Ollama 模型对话
- ✅ 解析用户意图（创建表、字段、记录等）
- ✅ 自动调用 MCP 函数执行操作
- ✅ 显示操作结果和确认
- ✅ 支持上下文对话
- ✅ 错误处理和重试

#### 2.2 支持的操作
- **空间管理**: 创建空间
- **数据库管理**: 创建数据库、获取数据库信息
- **表格管理**: 创建表格、列出表格
- **字段管理**: 创建字段（支持多种类型：text, number, select, date, email等）
- **记录管理**: 创建记录

#### 2.3 用户交互流程

```
用户输入: "创建一个名为'客户管理'的表"
    ↓
AI 解析意图
    ↓
确认操作: "我将创建表格'客户管理'，是否继续？"
    ↓
用户确认
    ↓
调用 MCP: teable_table_create
    ↓
显示结果: "✅ 表格'客户管理'创建成功"
```

### 3. 技术实现

#### 3.1 Ollama 集成

```typescript
// useOllama.ts
interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const useOllama = (config: OllamaConfig) => {
  const sendMessage = async (messages: Message[]) => {
    const response = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature ?? 0.7,
        stream: false
      })
    });
    return response.json();
  };
  
  return { sendMessage };
};
```

#### 3.2 意图识别与 MCP 调用

```typescript
// useMCPActions.ts
interface ParsedIntent {
  action: 'create_space' | 'create_base' | 'create_table' | 'create_field' | 'create_record';
  params: Record<string, any>;
  confirmation?: string;
}

const useMCPActions = () => {
  const parseIntent = (aiResponse: string): ParsedIntent | null => {
    // AI 返回结构化的 JSON
    try {
      return JSON.parse(aiResponse);
    } catch {
      return null;
    }
  };
  
  const executeAction = async (intent: ParsedIntent) => {
    switch (intent.action) {
      case 'create_table':
        // 调用 MCP 函数
        return await window.mcp?.invoke('teable_table_create', intent.params);
      case 'create_field':
        return await window.mcp?.invoke('teable_field_create', intent.params);
      // ... 其他操作
    }
  };
  
  return { parseIntent, executeAction };
};
```

#### 3.3 系统提示词设计

```typescript
const SYSTEM_PROMPT = `你是一个数据库管理助手，帮助用户通过自然语言创建和管理数据库。

你可以执行以下操作：
1. 创建空间 (create_space): 需要 name, description
2. 创建数据库 (create_base): 需要 space_id, name, description
3. 创建表格 (create_table): 需要 base_id, name, description
4. 创建字段 (create_field): 需要 table_id, name, type, description
   - 支持的字段类型: text, number, select, date, email, checkbox, url, phone
5. 创建记录 (create_record): 需要 table_id, fields (字段数据对象)

当前上下文：
- 选中的空间ID: {spaceId}
- 选中的数据库ID: {baseId}
- 选中的表格ID: {tableId}

请解析用户的意图，并返回以下格式的 JSON：
{
  "action": "操作类型",
  "params": { /* 参数对象 */ },
  "confirmation": "确认信息（可选）",
  "response": "给用户的回复"
}

如果用户的意图不明确，请询问更多信息。
`;
```

### 4. UI 设计

#### 4.1 布局结构

```
┌─────────────────────────┐
│  🤖 AI 助手              │
│  ─────────────────────   │
│                          │
│  💬 消息区域              │
│  ┌──────────────────┐   │
│  │ 用户: 创建一个表  │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │ AI: 好的，需要...│   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │ ✅ 操作成功       │   │
│  └──────────────────┘   │
│                          │
│  [输入框...        ] 🚀 │
└─────────────────────────┘
```

#### 4.2 样式主题

- 保持与现有 Obsidian 主题一致
- 使用 `obsidian-*` 类名
- 支持暗色/亮色主题切换

#### 4.3 交互细节

- **打字机效果**: AI 回复时显示打字动画
- **加载状态**: 显示思考中/执行中状态
- **确认弹窗**: 重要操作需要用户确认
- **快捷操作**: 常用操作显示快捷按钮
- **历史记录**: 保存最近的对话历史

### 5. 配置管理

#### 5.1 Ollama 配置

```typescript
// config.ts
export const OLLAMA_CONFIG = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2', // 或其他模型
  temperature: 0.7,
  maxTokens: 2000
};
```

#### 5.2 设置界面

在侧边栏添加设置按钮，允许用户配置：
- Ollama 服务地址
- 使用的模型名称
- Temperature 参数
- 是否自动执行（无需确认）

### 6. 数据流

```
用户输入
  ↓
前端验证
  ↓
发送到 Ollama (带上下文)
  ↓
解析 AI 响应
  ↓
提取操作意图和参数
  ↓
(可选) 用户确认
  ↓
调用 MCP 函数
  ↓
显示执行结果
  ↓
更新 UI (刷新列表等)
```

### 7. 错误处理

#### 7.1 常见错误
- Ollama 服务未启动
- 模型不存在
- MCP 调用失败
- 参数验证失败

#### 7.2 处理策略
- 友好的错误提示
- 提供重试选项
- 记录错误日志
- 回退到手动输入

### 8. 优化建议

#### 8.1 性能优化
- 使用流式响应 (stream: true)
- 缓存常用操作
- 防抖输入
- 虚拟滚动消息列表

#### 8.2 用户体验
- 提供示例提示
- 智能补全
- 语音输入（可选）
- 导出对话历史

### 9. 安全考虑

- **输入验证**: 严格验证所有参数
- **操作确认**: 危险操作必须确认
- **权限检查**: 验证用户权限
- **日志记录**: 记录所有操作

### 10. 扩展性

#### 10.1 插件系统
- 支持自定义 MCP 函数
- 允许添加自定义意图识别
- 支持第三方模型集成

#### 10.2 模板系统
- 预设常用操作模板
- 用户自定义模板
- 导入导出模板

## 实现步骤

### Phase 1: 基础框架 (1-2天)
1. ✅ 创建 AISidebar 组件
2. ✅ 实现 Ollama API 调用
3. ✅ 基础 UI 和消息展示

### Phase 2: MCP 集成 (2-3天)
1. ✅ 封装 MCP 函数调用
2. ✅ 实现意图识别
3. ✅ 添加操作确认流程

### Phase 3: 优化和完善 (2-3天)
1. ✅ 添加错误处理
2. ✅ 实现设置界面
3. ✅ 优化用户体验
4. ✅ 编写文档和测试

## 示例对话

### 示例 1: 创建表格

```
用户: 帮我创建一个"员工信息"表
AI: 好的，我将在当前数据库中创建"员工信息"表。是否需要添加默认字段？
用户: 是的
AI: 我会添加以下字段：
   - 姓名 (文本)
   - 邮箱 (邮箱)
   - 电话 (电话)
   - 入职日期 (日期)
   确认创建吗？
用户: 确认
AI: ✅ 已创建表格"员工信息"，包含4个字段
```

### 示例 2: 批量创建字段

```
用户: 给当前表添加以下字段：年龄(数字)、部门(单选)、状态(复选框)
AI: 我将添加3个字段：
   1. 年龄 - 数字类型
   2. 部门 - 单选类型
   3. 状态 - 复选框类型
   确认吗？
用户: 确认
AI: ✅ 已成功添加3个字段
```

### 示例 3: 创建记录

```
用户: 添加一个员工：张三，邮箱zhang@example.com
AI: 我将创建新记录：
   - 姓名: 张三
   - 邮箱: zhang@example.com
   确认吗？
用户: 确认
AI: ✅ 已添加新员工记录
```

## 依赖项

```json
{
  "dependencies": {
    // 已有依赖保持不变
  },
  "newDependencies": {
    // 可能需要的新依赖
    "marked": "^11.0.0",  // Markdown 渲染（如果需要）
    "prismjs": "^1.29.0"  // 代码高亮（如果需要）
  }
}
```

## 配置文件

```typescript
// src/config/ai-sidebar.config.ts
export const AI_SIDEBAR_CONFIG = {
  ollama: {
    baseUrl: process.env.VITE_OLLAMA_URL || 'http://localhost:11434',
    model: process.env.VITE_OLLAMA_MODEL || 'llama3.2',
    temperature: 0.7
  },
  ui: {
    maxMessages: 100,
    showTimestamp: true,
    enableTypingEffect: true
  },
  features: {
    autoExecute: false,
    voiceInput: false,
    exportHistory: true
  }
};
```

## 环境变量

```bash
# .env
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
VITE_ENABLE_AI_SIDEBAR=true
```

## 总结

这个设计提供了一个完整的 AI 侧边栏解决方案，具有以下优势：

1. **易用性**: 自然语言交互，降低使用门槛
2. **灵活性**: 支持多种操作和自定义配置
3. **安全性**: 重要操作需要确认
4. **扩展性**: 易于添加新功能
5. **一致性**: 与现有 UI 风格保持一致

下一步可以开始实现 Phase 1 的基础框架。

