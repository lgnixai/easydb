# AI Sidebar 测试套件

## 📋 测试概述

本测试套件为 AI Sidebar 组件提供了全面的自动化测试，确保所有功能正常工作。

## 🧪 测试文件结构

```
__tests__/
├── setup.ts                 # 测试环境配置
├── jest.config.js           # Jest 配置
├── test-utils.tsx           # 测试工具函数
├── useMCPActions.test.ts    # MCP 操作测试
├── useAIChat.test.ts        # AI 聊天测试
├── AISidebar.test.tsx       # 主组件测试
├── ChatHistoryPanel.test.tsx # 聊天历史测试
├── ActionCard.test.tsx      # 操作卡片测试
├── ChatMessage.test.tsx     # 聊天消息测试
├── ChatInput.test.tsx       # 聊天输入测试
├── integration.test.tsx     # 集成测试
├── chat-storage.test.ts     # 聊天存储测试
└── mcp-client.test.ts       # MCP 客户端测试
```

## 🚀 运行测试

### 运行所有测试
```bash
npm test -- --testPathPattern="AISidebar"
```

### 运行特定测试文件
```bash
npm test useMCPActions.test.ts
npm test AISidebar.test.tsx
npm test integration.test.tsx
```

### 运行测试并生成覆盖率报告
```bash
npm test -- --coverage --testPathPattern="AISidebar"
```

### 监视模式运行测试
```bash
npm test -- --watch --testPathPattern="AISidebar"
```

## 📊 测试覆盖率

目标覆盖率：
- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%
- **语句覆盖率**: 80%

## 🔧 测试配置

### Jest 配置 (`jest.config.js`)
- **测试环境**: jsdom (模拟浏览器环境)
- **设置文件**: `setup.ts`
- **模块映射**: 支持 `@/` 路径别名
- **转换器**: TypeScript 支持
- **覆盖率**: 生成 HTML 和 LCOV 报告

### 测试环境设置 (`setup.ts`)
- Mock IntersectionObserver
- Mock ResizeObserver
- Mock matchMedia
- Mock localStorage/sessionStorage
- Mock fetch
- Mock URL.createObjectURL
- 控制台输出过滤

## 🛠️ 测试工具 (`test-utils.tsx`)

### Mock 数据工厂
```typescript
// 创建测试消息
const message = createMockMessage({
  content: '自定义内容',
  role: 'assistant'
});

// 创建测试会话
const session = createMockSession({
  title: '自定义标题'
});

// 创建测试意图
const intent = createMockIntent({
  action: 'create_fields_batch'
});
```

### Mock Hook 工厂
```typescript
// 创建 useAIChat mock
const mockUseAIChat = createMockUseAIChat({
  loading: true,
  messages: [message]
});

// 创建 useOllama mock
const mockUseOllama = createMockUseOllama({
  error: '连接失败'
});
```

### 测试常量
```typescript
import { TEST_IDS, TEST_MESSAGES, TEST_FIELDS } from './test-utils';

// 使用预定义的测试数据
const spaceId = TEST_IDS.SPACE_ID;
const userMessage = TEST_MESSAGES.USER;
const textField = TEST_FIELDS.TEXT;
```

## 📝 测试用例说明

### 1. 单元测试

#### `useMCPActions.test.ts`
- ✅ JSON 解析和修复
- ✅ 字段创建操作
- ✅ 批量字段创建
- ✅ 选项格式转换
- ✅ 错误处理

#### `useAIChat.test.ts`
- ✅ 消息发送和接收
- ✅ 确认操作流程
- ✅ 错误状态处理
- ✅ 聊天历史集成

#### `AISidebar.test.tsx`
- ✅ 组件渲染
- ✅ 用户交互
- ✅ 上下文信息显示
- ✅ 加载和错误状态

### 2. 组件测试

#### `ActionCard.test.tsx`
- ✅ 确认操作卡片
- ✅ 执行中状态
- ✅ 成功/失败结果
- ✅ 批量操作结果

#### `ChatMessage.test.tsx`
- ✅ 用户/AI 消息渲染
- ✅ 带操作的消息
- ✅ 时间戳格式化
- ✅ 特殊字符处理

#### `ChatInput.test.tsx`
- ✅ 输入和发送
- ✅ 键盘快捷键
- ✅ 禁用状态
- ✅ 自动调整高度

#### `ChatHistoryPanel.test.tsx`
- ✅ 会话列表显示
- ✅ 会话管理操作
- ✅ 导入导出功能
- ✅ 存储使用情况

### 3. 集成测试

#### `integration.test.tsx`
- ✅ 完整字段创建流程
- ✅ 批量字段创建流程
- ✅ 错误处理流程
- ✅ 确认操作流程
- ✅ 聊天历史集成

### 4. 工具测试

#### `chat-storage.test.ts`
- ✅ 会话管理
- ✅ 消息存储
- ✅ 导入导出
- ✅ 自动保存

#### `mcp-client.test.ts`
- ✅ 连接管理
- ✅ 工具调用
- ✅ 批量操作
- ✅ 错误处理

## 🐛 常见问题

### 1. Mock 不生效
```typescript
// 确保在 beforeEach 中清除 mock
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 2. 异步测试超时
```typescript
// 增加超时时间
test('async test', async () => {
  // 测试代码
}, 10000); // 10秒超时
```

### 3. 组件渲染失败
```typescript
// 检查 mock 是否正确设置
mockUseAIChat.mockReturnValue({
  ...defaultMockReturn,
  // 确保所有必需属性都有值
});
```

### 4. 覆盖率不达标
```typescript
// 添加更多测试用例覆盖边界情况
// 测试错误路径
// 测试异步操作
```

## 📈 测试最佳实践

### 1. 测试命名
```typescript
describe('组件名称', () => {
  it('应该正确处理某个功能', () => {
    // 测试代码
  });
});
```

### 2. 测试结构
```typescript
it('应该处理用户输入', async () => {
  // Arrange - 准备测试数据
  const mockOnSend = jest.fn();
  render(<ChatInput onSend={mockOnSend} />);
  
  // Act - 执行操作
  fireEvent.change(input, { target: { value: '测试' } });
  fireEvent.click(sendButton);
  
  // Assert - 验证结果
  expect(mockOnSend).toHaveBeenCalledWith('测试');
});
```

### 3. Mock 使用
```typescript
// 使用工厂函数创建 mock
const mockMessage = createMockMessage({ content: '自定义内容' });

// 使用预定义的 mock
mockUseAIChat.mockReturnValue(createMockUseAIChat({
  loading: true
}));
```

### 4. 异步测试
```typescript
it('应该处理异步操作', async () => {
  const promise = Promise.resolve('结果');
  mockFunction.mockResolvedValue(promise);
  
  // 执行操作
  await act(async () => {
    await component.someAsyncMethod();
  });
  
  // 验证结果
  await waitFor(() => {
    expect(result).toBe('结果');
  });
});
```

## 🔄 持续集成

### GitHub Actions 配置
```yaml
- name: Run AI Sidebar Tests
  run: npm test -- --testPathPattern="AISidebar" --coverage --watchAll=false
```

### 预提交钩子
```bash
# 在提交前运行测试
npm test -- --testPathPattern="AISidebar" --watchAll=false
```

## 📚 相关文档

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [React 测试最佳实践](https://react.dev/learn/testing)
- [AI Sidebar 组件文档](../README.md)

---

**维护者**: AI Sidebar 团队  
**最后更新**: 2025-10-08  
**版本**: 1.0.0
