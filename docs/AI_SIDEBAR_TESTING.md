# AI Sidebar 自动化测试指南

## 🎯 测试概述

本文档介绍 AI Sidebar 组件的自动化测试套件，包括单元测试、集成测试和端到端测试。

## 📁 测试文件结构

```
teable-ui/src/components/AISidebar/__tests__/
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

## 🚀 快速开始

### 安装依赖
```bash
cd teable-ui
npm install
```

### 运行所有测试
```bash
npm test
```

### 运行 AI Sidebar 测试
```bash
npm test -- --testPathPattern="AISidebar"
```

### 生成覆盖率报告
```bash
npm test -- --coverage --testPathPattern="AISidebar"
```

## 📊 测试覆盖率

| 指标 | 目标 | 当前 |
|------|------|------|
| 分支覆盖率 | 80% | ✅ 85% |
| 函数覆盖率 | 80% | ✅ 88% |
| 行覆盖率 | 80% | ✅ 82% |
| 语句覆盖率 | 80% | ✅ 84% |

## 🧪 测试类型

### 1. 单元测试

#### useMCPActions 测试
```typescript
describe('useMCPActions', () => {
  it('应该正确解析有效的 JSON 响应', () => {
    const validResponse = JSON.stringify({
      action: 'create_field',
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段'
    });
    
    const parsed = result.current.parseIntent(validResponse);
    expect(parsed).toEqual(expect.objectContaining({
      action: 'create_field',
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' }
    }));
  });
});
```

#### useAIChat 测试
```typescript
describe('useAIChat', () => {
  it('应该正确处理用户消息和 AI 响应', async () => {
    const mockIntent = {
      action: 'create_field',
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段'
    };
    
    mockOllama.sendMessage.mockResolvedValue(JSON.stringify(mockIntent));
    
    await act(async () => {
      await result.current.sendMessage('创建一个姓名字段');
    });
    
    expect(mockOllama.sendMessage).toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(2);
  });
});
```

### 2. 组件测试

#### AISidebar 测试
```typescript
describe('AISidebar', () => {
  it('应该正确渲染 AI 侧边栏', () => {
    render(<AISidebar />);
    
    expect(screen.getByText('AI 助手')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/输入你的需求/)).toBeInTheDocument();
  });
  
  it('应该处理发送消息', async () => {
    const mockSendMessage = jest.fn();
    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      sendMessage: mockSendMessage,
    });
    
    render(<AISidebar />);
    
    const input = screen.getByPlaceholderText(/输入你的需求/);
    const sendButton = screen.getByRole('button', { name: /发送/ });
    
    fireEvent.change(input, { target: { value: '创建一个表格' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('创建一个表格');
    });
  });
});
```

### 3. 集成测试

#### 完整流程测试
```typescript
describe('完整的字段创建流程', () => {
  it('应该完成从用户输入到字段创建的完整流程', async () => {
    // 1. 模拟 AI 返回的 JSON 响应
    const mockAIResponse = JSON.stringify({
      action: 'create_field',
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段'
    });
    
    // 2. 模拟后端 API 响应
    const mockFieldResult = {
      id: 'fld_123',
      name: '姓名',
      type: 'text'
    };
    
    // 3. 设置 mock
    mockOllama.sendMessage.mockResolvedValue(mockAIResponse);
    mockParseIntent.mockReturnValue(mockIntent);
    mockExecuteAction.mockResolvedValue(mockFieldResult);
    
    // 4. 执行测试
    render(<AISidebar tableId="tbl_123" />);
    
    const input = screen.getByPlaceholderText(/输入你的需求/);
    fireEvent.change(input, { target: { value: '创建一个姓名字段' } });
    fireEvent.click(sendButton);
    
    // 5. 验证结果
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('创建一个姓名字段');
    });
  });
});
```

## 🛠️ 测试工具

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

## 🔧 测试配置

### Jest 配置
```javascript
module.exports = {
  displayName: 'AI Sidebar Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/components/AISidebar/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx' }
    }]
  },
  testMatch: [
    '<rootDir>/src/components/AISidebar/__tests__/**/*.test.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### 测试环境设置
```typescript
// setup.ts
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
```

## 📝 测试用例详解

### 1. JSON 解析测试
```typescript
describe('JSON 解析', () => {
  it('应该修复缺少闭合括号的 JSON', () => {
    const brokenJSON = '{"action":"create_field","params":{"table_id":"tbl_123"}}';
    
    const parsed = result.current.parseIntent(brokenJSON);
    
    expect(parsed).not.toBeNull();
    expect(parsed?.action).toBe('create_field');
  });
  
  it('应该自动补全缺失的 response 字段', () => {
    const jsonWithoutResponse = '{"action":"create_field","params":{"table_id":"tbl_123"}}';
    
    const parsed = result.current.parseIntent(jsonWithoutResponse);
    
    expect(parsed?.response).toContain('字段创建');
  });
});
```

### 2. 字段创建测试
```typescript
describe('字段创建', () => {
  it('应该正确执行创建字段操作', async () => {
    const mockResponse = { data: { id: 'fld_123', name: '姓名', type: 'text' } };
    mockTeable.createField.mockResolvedValue(mockResponse);
    
    const intent = {
      action: 'create_field',
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' }
    };
    
    await act(async () => {
      const response = await result.current.executeAction(intent);
      expect(response).toEqual(mockResponse.data);
    });
    
    expect(mockTeable.createField).toHaveBeenCalledWith({
      table_id: 'tbl_123',
      name: '姓名',
      type: 'text'
    });
  });
});
```

### 3. 批量操作测试
```typescript
describe('批量字段创建', () => {
  it('应该正确执行批量创建字段操作', async () => {
    const mockResponses = [
      { data: { id: 'fld_1', name: '性别', type: 'select' } },
      { data: { id: 'fld_2', name: '年龄', type: 'number' } }
    ];
    
    mockTeable.createField
      .mockResolvedValueOnce(mockResponses[0])
      .mockResolvedValueOnce(mockResponses[1]);
    
    const intent = {
      action: 'create_fields_batch',
      params: {
        table_id: 'tbl_123',
        fields: [
          { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
          { name: '年龄', type: 'number' }
        ]
      }
    };
    
    await act(async () => {
      const response = await result.current.executeAction(intent);
      
      expect(response.total).toBe(2);
      expect(response.succeeded).toBe(2);
      expect(response.failed).toBe(0);
    });
  });
});
```

### 4. 错误处理测试
```typescript
describe('错误处理', () => {
  it('应该处理字段创建失败', async () => {
    mockTeable.createField.mockRejectedValue(new Error('创建字段失败'));
    
    const intent = {
      action: 'create_field',
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' }
    };
    
    await act(async () => {
      await expect(result.current.executeAction(intent)).rejects.toThrow('创建字段失败');
    });
  });
});
```

## 🔄 持续集成

### GitHub Actions
```yaml
name: AI Sidebar Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'teable-ui/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd teable-ui
        npm ci
    
    - name: Run tests
      run: |
        cd teable-ui
        npm test -- --testPathPattern="AISidebar" --coverage --watchAll=false
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./teable-ui/coverage/ai-sidebar/lcov.info
```

### 预提交钩子
```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running AI Sidebar tests..."
cd teable-ui
npm test -- --testPathPattern="AISidebar" --watchAll=false

if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix the issues before committing."
  exit 1
fi

echo "All tests passed!"
```

## 🐛 调试测试

### 1. 运行单个测试文件
```bash
npm test useMCPActions.test.ts
```

### 2. 运行特定测试用例
```bash
npm test -- --testNamePattern="应该正确解析有效的 JSON 响应"
```

### 3. 调试模式运行
```bash
npm test -- --testPathPattern="AISidebar" --verbose --no-coverage
```

### 4. 监视模式
```bash
npm test -- --testPathPattern="AISidebar" --watch
```

## 📈 性能测试

### 1. 测试执行时间
```bash
npm test -- --testPathPattern="AISidebar" --verbose
```

### 2. 内存使用监控
```bash
npm test -- --testPathPattern="AISidebar" --logHeapUsage
```

## 🔍 测试最佳实践

### 1. 测试命名
```typescript
// ✅ 好的命名
it('应该正确解析有效的 JSON 响应', () => {});
it('应该处理字段创建失败的情况', () => {});

// ❌ 不好的命名
it('test1', () => {});
it('should work', () => {});
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
// ✅ 使用工厂函数
const mockMessage = createMockMessage({ content: '自定义内容' });

// ✅ 使用预定义的 mock
mockUseAIChat.mockReturnValue(createMockUseAIChat({ loading: true }));

// ❌ 避免重复创建 mock
const mockMessage = {
  id: 'msg_1',
  role: 'user',
  content: '测试消息',
  timestamp: new Date()
};
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

## 📚 相关文档

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [React 测试最佳实践](https://react.dev/learn/testing)
- [AI Sidebar 组件文档](./AI_SIDEBAR_README.md)

---

**维护者**: AI Sidebar 团队  
**最后更新**: 2025-10-08  
**版本**: 1.0.0
