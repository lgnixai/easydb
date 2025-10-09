import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

// Mock data factories
export const createMockMessage = (overrides = {}) => ({
  id: 'msg_1',
  role: 'user' as const,
  content: '测试消息',
  timestamp: new Date('2025-10-08T10:00:00Z'),
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: 'session_1',
  title: '测试会话',
  messages: [],
  createdAt: new Date('2025-10-08T10:00:00Z'),
  updatedAt: new Date('2025-10-08T10:00:00Z'),
  ...overrides,
});

export const createMockIntent = (overrides = {}) => ({
  action: 'create_field' as const,
  params: {
    table_id: 'tbl_123',
    name: '姓名',
    type: 'text',
  },
  response: '好的，我将创建姓名字段',
  requiresConfirmation: false,
  ...overrides,
});

export const createMockAction = (overrides = {}) => ({
  type: 'confirmation' as const,
  action: 'create_field' as const,
  params: {
    table_id: 'tbl_123',
    name: '姓名',
    type: 'text',
  },
  title: '确认创建字段',
  description: '是否要创建姓名字段？',
  confirmText: '确认创建',
  cancelText: '取消',
  ...overrides,
});

// Helper functions for testing
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const createMockFile = (content: string, filename: string, type: string = 'application/json') => {
  const file = new File([content], filename, { type });
  return file;
};

export const mockFetchResponse = (data: any, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
});

// Mock hooks
export const createMockUseAIChat = (overrides = {}) => ({
  messages: [],
  pendingIntent: null,
  sendMessage: jest.fn(),
  confirmAction: jest.fn(),
  cancelAction: jest.fn(),
  clearMessages: jest.fn(),
  loading: false,
  error: null,
  chatHistory: {
    sessions: [],
    currentSessionId: null,
    getCurrentSession: () => null,
    createSession: jest.fn(),
    switchSession: jest.fn(),
    deleteSession: jest.fn(),
    renameSession: jest.fn(),
    exportSession: jest.fn(),
    importSession: jest.fn(),
    clearAllSessions: jest.fn(),
    saveMessages: jest.fn(),
    loadMessages: jest.fn(),
    storageInfo: { used: 0, total: 0, percentage: 0 },
  },
  ...overrides,
});

export const createMockUseOllama = (overrides = {}) => ({
  sendMessage: jest.fn(),
  loading: false,
  error: null,
  ...overrides,
});

export const createMockUseMCPActions = (overrides = {}) => ({
  parseIntent: jest.fn(),
  executeAction: jest.fn(),
  getActionLabel: jest.fn(),
  ...overrides,
});

// Test data constants
export const TEST_IDS = {
  SPACE_ID: 'space_123',
  BASE_ID: 'base_456',
  TABLE_ID: 'table_789',
  FIELD_ID: 'field_123',
  USER_ID: 'user_123',
  SESSION_ID: 'session_123',
} as const;

export const TEST_MESSAGES = {
  USER: '创建一个表格',
  AI_SUCCESS: '好的，我将为您创建表格',
  AI_ERROR: '创建表格失败',
  CONFIRMATION: '确认创建表格？',
} as const;

export const TEST_FIELDS = {
  TEXT: { name: '姓名', type: 'text' },
  NUMBER: { name: '年龄', type: 'number' },
  SELECT: { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
  DATE: { name: '生日', type: 'date' },
  EMAIL: { name: '邮箱', type: 'email' },
} as const;

// Export everything
export * from '@testing-library/react';
export { customRender as render };
