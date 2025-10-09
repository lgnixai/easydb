# AISidebar 组件

基于 Ollama 的 AI 助手侧边栏组件。

## 使用方法

```tsx
import { AISidebar } from '@/components/AISidebar';

function MyComponent() {
  return (
    <AISidebar
      spaceId="space_123"
      baseId="base_456"
      tableId="table_789"
      onActionComplete={() => {
        // 操作完成后的回调
        console.log('AI 操作完成');
      }}
    />
  );
}
```

## Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| spaceId | string | 否 | 当前选中的空间 ID |
| baseId | string | 否 | 当前选中的数据库 ID |
| tableId | string | 否 | 当前选中的表格 ID |
| onActionComplete | () => void | 否 | 操作完成时的回调函数 |

## 组件结构

```
AISidebar/
├── index.ts              # 导出
├── types.ts              # 类型定义
├── AISidebar.tsx         # 主组件
├── ChatMessage.tsx       # 消息组件
├── ChatInput.tsx         # 输入组件
├── ActionCard.tsx        # 操作卡片
├── hooks/
│   ├── useOllama.ts      # Ollama Hook
│   ├── useMCPActions.ts  # MCP 操作 Hook
│   └── useAIChat.ts      # 聊天管理 Hook
└── README.md             # 本文件
```

## 自定义 Hooks

### useOllama

连接 Ollama API：

```typescript
const { sendMessage, loading, error } = useOllama({
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
  temperature: 0.7
});

const response = await sendMessage([
  { role: 'user', content: '创建一个表格' }
]);
```

### useMCPActions

执行 MCP 操作：

```typescript
const { parseIntent, executeAction } = useMCPActions();

const intent = parseIntent(aiResponse);
const result = await executeAction(intent);
```

### useAIChat

管理聊天状态：

```typescript
const {
  messages,
  sendMessage,
  confirmAction,
  cancelAction,
  loading
} = useAIChat({
  spaceId,
  baseId,
  tableId,
  onActionComplete
});
```

## 主题样式

使用 Obsidian 主题变量：

- `bg-obsidian-surface` - 表面背景
- `bg-obsidian-bg` - 主背景
- `text-obsidian-text` - 主文字
- `text-obsidian-text-muted` - 次要文字
- `border-obsidian-border` - 边框
- `bg-obsidian-accent` - 强调色

## 配置

在 `src/config/ai-sidebar.config.ts` 中修改配置：

```typescript
export const AI_SIDEBAR_CONFIG = {
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.2',
    temperature: 0.7
  },
  ui: {
    maxMessages: 100,
    showTimestamp: true
  }
};
```

## 支持的操作

- ✅ 创建空间 (create_space)
- ✅ 创建数据库 (create_base)
- ✅ 创建表格 (create_table)
- ✅ 创建字段 (create_field)
- ✅ 创建记录 (create_record)
- ✅ 列出表格 (list_tables)
- ✅ 获取数据库 (get_base)
- ✅ 获取字段 (get_field)

## 示例

### 创建表格

```typescript
// 用户输入
"创建一个员工信息表"

// AI 响应
{
  "action": "create_table",
  "params": {
    "base_id": "current_base_id",
    "name": "员工信息表"
  },
  "requiresConfirmation": true,
  "response": "好的，我将创建一个'员工信息表'"
}

// 执行结果
✅ 创建表格成功
```

### 批量创建字段

```typescript
// 用户输入
"添加字段：姓名（文本）、邮箱（邮箱）、年龄（数字）"

// AI 会依次创建多个字段
```

## 调试

开启控制台查看详细日志：

```typescript
// useAIChat.ts 中
console.log('[AI Response]', aiResponse);
console.log('[Parsed Intent]', intent);
console.log('[Execute Result]', result);
```

## 测试

```bash
# 运行测试
pnpm test

# 运行特定测试
pnpm test AISidebar
```

## 常见问题

### Q: AI 无法连接

A: 检查 Ollama 是否运行：
```bash
curl http://localhost:11434/api/tags
```

### Q: 意图识别不准确

A: 优化系统提示词（`config/ai-sidebar.config.ts` 中的 `getSystemPrompt`）

### Q: 性能问题

A: 减少对话历史长度（`AI_SIDEBAR_CONFIG.ui.maxMessages`）

## 更新日志

- v1.0.0 (2025-10-08) - 初始版本

