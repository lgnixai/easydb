# AI 侧边栏优化总结

本文档总结了针对用户反馈的两个核心问题所做的优化。

## 📋 问题概述

### 问题 1：批量创建字段效果不好
**用户反馈**：AI 在创建"性别、年龄、科目、分数"等多个字段时表现不佳

**根本原因**：
- System Prompt 缺少批量操作的指导
- 没有字段类型的智能匹配规则
- 缺少批量创建字段的示例

### 问题 2：对话记录没有保存
**用户反馈**：与 AI 的对话记录刷新页面后丢失，希望有聊天管理功能

**根本原因**：
- 对话只保存在内存中（useState）
- 没有持久化存储
- 缺少会话管理功能

## ✨ 解决方案

### 方案 1：优化 System Prompt 和批量创建

#### 1.1 增强的 System Prompt

新增功能：
- ✅ 添加批量创建字段操作（`create_fields_batch`）
- ✅ 智能字段类型匹配规则
- ✅ 丰富的批量创建示例

**字段类型智能匹配**：
```typescript
"姓名" → text (文本)
"年龄" → number (数字)
"性别" → select (选择), options: ["男", "女"]
"科目" → select (选择), options: ["语文", "数学", "英语", ...]
"分数" → number (数字)
"邮箱" → email (邮箱)
"电话" → phone (电话)
```

#### 1.2 批量创建字段实现

**类型定义**（`types.ts`）：
```typescript
export type MCPAction = 
  // ...
  | 'create_fields_batch'  // 新增
```

**执行逻辑**（`useMCPActions.ts`）：
```typescript
case 'create_fields_batch': {
  const fields = intent.params.fields || [];
  const results = [];
  
  for (const field of fields) {
    const response = await teable.createField({
      table_id: intent.params.table_id,
      name: field.name,
      type: field.type,
      options: field.options,
      // ...
    });
    results.push({ success: true, field: field.name, data: response.data });
  }
  
  return {
    total: fields.length,
    succeeded: results.filter(r => r.success).length,
    results
  };
}
```

#### 1.3 使用示例

**用户输入**：
```
在当前表中创建性别、年龄、科目、分数等字段
```

**AI 响应**：
```json
{
  "action": "create_fields_batch",
  "params": {
    "table_id": "...",
    "fields": [
      {
        "name": "性别",
        "type": "select",
        "options": { "choices": ["男", "女"] }
      },
      {
        "name": "年龄",
        "type": "number"
      },
      {
        "name": "科目",
        "type": "select",
        "options": {
          "choices": ["语文", "数学", "英语", "物理", "化学", "生物"]
        }
      },
      {
        "name": "分数",
        "type": "number"
      }
    ]
  },
  "requiresConfirmation": true,
  "confirmation": "将批量创建4个字段：性别(选择)、年龄(数字)、科目(选择)、分数(数字)，是否继续？",
  "response": "好的，我将为您创建性别、年龄、科目、分数这4个字段"
}
```

---

### 方案 2：完整的聊天历史管理系统

#### 2.1 核心存储类（`chat-storage.ts`）

**功能**：
- ✅ 基于 localStorage 的持久化存储
- ✅ 会话管理（创建、保存、删除、更新）
- ✅ 自动保存机制
- ✅ 导入/导出（JSON 和 Markdown 格式）
- ✅ 存储空间监控

**主要方法**：
```typescript
class ChatStorage {
  // 会话管理
  static createSession(title, context): ChatSession
  static saveSession(session): void
  static getAllSessions(): ChatSession[]
  static getSession(sessionId): ChatSession | null
  static deleteSession(sessionId): void
  
  // 消息管理
  static saveMessages(messages, sessionId?): void
  static loadMessages(sessionId?): Message[]
  static clearMessages(sessionId?): void
  
  // 导入/导出
  static exportSession(sessionId): string
  static exportSessionAsMarkdown(sessionId): string
  static importSession(jsonData): ChatSession
  
  // 工具方法
  static autoSaveSession(sessionId, messages, context): void
  static getStorageInfo(): { used, total, percentage }
}
```

#### 2.2 React Hook（`useChatHistory.ts`）

**功能**：
- ✅ React 友好的 API
- ✅ 自动状态管理
- ✅ 会话切换
- ✅ 文件导入/导出

**使用示例**：
```typescript
const chatHistory = useChatHistory({
  autoSave: true,
  context: { spaceId, baseId, tableId }
});

// 创建新会话
chatHistory.createSession('新对话');

// 切换会话
chatHistory.switchSession(sessionId);

// 保存消息
chatHistory.saveMessages(messages);

// 导出会话
chatHistory.exportSession(sessionId, 'markdown');
```

#### 2.3 历史管理 UI（`ChatHistoryPanel.tsx`）

**功能**：
- ✅ 会话列表展示
- ✅ 实时编辑会话标题
- ✅ 一键导出（JSON/Markdown）
- ✅ 拖拽导入会话
- ✅ 存储空间显示
- ✅ 美观的 Obsidian 风格 UI

**界面特性**：
```typescript
<ChatHistoryPanel
  sessions={sessions}              // 会话列表
  currentSessionId={id}             // 当前会话
  onSessionSelect={handleSelect}    // 切换会话
  onSessionDelete={handleDelete}    // 删除会话
  onSessionRename={handleRename}    // 重命名
  onSessionExport={handleExport}    // 导出
  onSessionImport={handleImport}    // 导入
  onNewSession={handleNew}          // 新建
  onClearAll={handleClear}          // 清空所有
  storageInfo={info}                // 存储信息
/>
```

#### 2.4 集成到 useAIChat

**自动保存**：
```typescript
export const useAIChat = (options: UseAIChatOptions) => {
  const chatHistory = useChatHistory({
    autoSave: options.enableHistory ?? true,
    context: { spaceId, baseId, tableId },
  });

  // 初始化时加载历史
  useEffect(() => {
    const loadedMessages = chatHistory.loadMessages();
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages);
    }
  }, [chatHistory.currentSessionId]);

  // 自动保存消息
  useEffect(() => {
    if (messages.length > 0) {
      chatHistory.saveMessages(messages);
    }
  }, [messages]);
  
  return {
    messages,
    // ...
    chatHistory,  // 暴露历史管理方法
  };
};
```

#### 2.5 UI 集成

**新增按钮**：
- 🆕 **新会话**按钮（`MessageSquarePlus`）
- 📜 **历史记录**按钮（`History`）

**侧边栏布局**：
```
┌─────────────────────────────────────────┐
│  AI 助手  · 当前会话标题                 │
│  [新会话] [历史] [清空] [设置]           │
├─────────────────────────────────────────┤
│                                          │
│  聊天消息区域                             │
│                                          │
├─────────────────────────────────────────┤
│  输入框                                   │
└─────────────────────────────────────────┘

点击 [历史] 后：
┌──────────────────┬─────────────────────┐
│  聊天界面         │  聊天历史            │
│  (自适应宽度)     │  (固定 320px)        │
│                  │  ┌─────────────────┐│
│                  │  │ 会话 1 (今天)    ││
│                  │  │ 12 条消息        ││
│                  │  ├─────────────────┤│
│                  │  │ 会话 2 (昨天)    ││
│                  │  │ 8 条消息         ││
│                  │  └─────────────────┘│
└──────────────────┴─────────────────────┘
```

## 📊 改进效果

### 批量创建字段

**改进前**：
```
用户: 创建性别、年龄、科目、分数字段
AI: 好的，我将创建性别字段
✅ 创建性别字段成功

(只创建了一个字段，用户需要重复说 3 次)
```

**改进后**：
```
用户: 创建性别、年龄、科目、分数字段
AI: 好的，我将为您创建4个字段，并智能匹配了类型：
- 性别 (选择: 男/女)
- 年龄 (数字)
- 科目 (选择: 语文/数学/...)
- 分数 (数字)

✅ 批量创建4个字段成功 (4/4 成功)
```

### 聊天历史管理

**改进前**：
- ❌ 刷新页面丢失所有对话
- ❌ 无法查看历史记录
- ❌ 无法导出对话

**改进后**：
- ✅ 自动保存到 localStorage
- ✅ 支持多会话管理
- ✅ 点击历史按钮查看所有会话
- ✅ 导出为 JSON 或 Markdown
- ✅ 导入历史会话
- ✅ 实时显示存储空间使用情况

## 🎯 使用指南

### 批量创建字段

**示例 1 - 学生信息表**：
```
用户: 创建学生的姓名、年龄、性别、邮箱、电话字段

AI 会自动创建：
- 姓名 (text, 必填)
- 年龄 (number)
- 性别 (select: 男/女)
- 邮箱 (email)
- 电话 (phone)
```

**示例 2 - 成绩管理表**：
```
用户: 添加科目、分数、等级字段

AI 会自动创建：
- 科目 (select: 语文/数学/英语/...)
- 分数 (number)
- 等级 (text)
```

### 聊天历史管理

**创建新会话**：
1. 点击顶部的 **新会话** 按钮
2. 开始新对话，系统自动创建会话

**查看历史**：
1. 点击顶部的 **历史记录** 按钮
2. 右侧滑出历史面板
3. 点击任意会话切换

**导出会话**：
1. 在历史面板中找到要导出的会话
2. 悬停查看操作按钮
3. 点击 📄 导出为 JSON 或 📝 导出为 Markdown

**导入会话**：
1. 点击历史面板顶部的 **导入** 按钮
2. 选择之前导出的 JSON 文件
3. 会话自动导入并显示在列表中

## 📁 新增文件

| 文件路径 | 说明 | 行数 |
|---------|------|------|
| `lib/chat-storage.ts` | 聊天存储核心类 | ~340 |
| `hooks/useChatHistory.ts` | 聊天历史 Hook | ~160 |
| `ChatHistoryPanel.tsx` | 历史管理 UI 组件 | ~320 |

## 🔄 修改文件

| 文件路径 | 修改内容 |
|---------|---------|
| `config/ai-sidebar.config.ts` | 优化 System Prompt，添加批量创建和智能匹配 |
| `types.ts` | 添加 `create_fields_batch` 类型 |
| `hooks/useMCPActions.ts` | 实现批量创建字段逻辑 |
| `hooks/useAIChat.ts` | 集成聊天历史自动保存 |
| `AISidebar.tsx` | 添加历史按钮和面板切换 |

## 🎨 设计亮点

### 智能字段类型推断
- 基于中文语义的智能匹配
- 常见字段类型的预设选项
- 减少用户手动配置

### 无缝持久化
- 自动保存，无需手动操作
- localStorage 存储，跨页面保持
- 存储空间实时监控

### 用户友好的 UI
- Obsidian 风格一致性
- 流畅的动画过渡
- 直观的操作按钮
- 清晰的状态提示

## 💡 最佳实践

### 使用批量创建
✅ **推荐**：
```
"创建姓名、年龄、性别、邮箱、电话字段"
```

❌ **不推荐**：
```
"创建一个姓名字段"
"创建一个年龄字段"  
"创建一个性别字段"
...（重复多次）
```

### 管理会话
- 💡 及时重命名会话，便于查找
- 💡 定期导出重要对话作为备份
- 💡 清理不需要的会话释放空间
- 💡 使用 Markdown 导出便于分享

## 🔮 未来可能的改进

- [ ] 会话搜索功能
- [ ] 会话标签分类
- [ ] 云端同步（IndexedDB）
- [ ] 会话分享链接
- [ ] 批量操作（批量删除、导出）
- [ ] 更多字段类型的智能识别
- [ ] 支持自定义字段类型映射规则

---

**最后更新**: 2025-10-08
**版本**: 2.0.0
**维护者**: Teable Team

