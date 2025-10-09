import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AISidebar } from '../AISidebar';
import { useAIChat } from '../hooks/useAIChat';
import { useOllama } from '../hooks/useOllama';
import { useMCPActions } from '../hooks/useMCPActions';
import teable from '@/lib/teable-simple';

// Mock all dependencies
jest.mock('../hooks/useAIChat');
jest.mock('../hooks/useOllama');
jest.mock('../hooks/useMCPActions');
jest.mock('@/lib/teable-simple');

const mockUseAIChat = useAIChat as jest.MockedFunction<typeof useAIChat>;
const mockUseOllama = useOllama as jest.MockedFunction<typeof useOllama>;
const mockUseMCPActions = useMCPActions as jest.MockedFunction<typeof useMCPActions>;
const mockTeable = teable as jest.Mocked<typeof teable>;

describe('AISidebar Integration Tests', () => {
  const mockOllama = {
    sendMessage: jest.fn(),
    loading: false,
    error: null,
  };

  const mockMCPActions = {
    parseIntent: jest.fn(),
    executeAction: jest.fn(),
    getActionLabel: jest.fn(),
  };

  const defaultMockAIChat = {
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseOllama.mockReturnValue(mockOllama);
    mockUseMCPActions.mockReturnValue(mockMCPActions);
    mockUseAIChat.mockReturnValue(defaultMockAIChat);
  });

  describe('完整的字段创建流程', () => {
    it('应该完成从用户输入到字段创建的完整流程', async () => {
      const mockSendMessage = jest.fn();
      const mockParseIntent = jest.fn();
      const mockExecuteAction = jest.fn();
      const mockGetActionLabel = jest.fn();

      // 模拟 AI 返回的 JSON 响应
      const mockAIResponse = JSON.stringify({
        action: 'create_field',
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        response: '好的，我将创建姓名字段',
        requiresConfirmation: true,
        confirmation: '确认创建字段？',
      });

      const mockIntent = {
        action: 'create_field' as const,
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        response: '好的，我将创建姓名字段',
        requiresConfirmation: true,
        confirmation: '确认创建字段？',
      };

      const mockFieldResult = {
        id: 'fld_123',
        name: '姓名',
        type: 'text',
        table_id: 'tbl_123',
      };

      mockOllama.sendMessage.mockResolvedValue(mockAIResponse);
      mockParseIntent.mockReturnValue(mockIntent);
      mockGetActionLabel.mockReturnValue('创建字段');
      mockExecuteAction.mockResolvedValue(mockFieldResult);

      mockUseMCPActions.mockReturnValue({
        ...mockMCPActions,
        parseIntent: mockParseIntent,
        executeAction: mockExecuteAction,
        getActionLabel: mockGetActionLabel,
      });

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        sendMessage: mockSendMessage,
      });

      render(<AISidebar tableId="tbl_123" />);

      // 1. 用户输入消息
      const input = screen.getByPlaceholderText(/输入你的需求/);
      const sendButton = screen.getByRole('button', { name: /发送/ });

      fireEvent.change(input, { target: { value: '创建一个姓名字段' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('创建一个姓名字段');
      });
    });

    it('应该完成批量字段创建流程', async () => {
      const mockSendMessage = jest.fn();
      const mockParseIntent = jest.fn();
      const mockExecuteAction = jest.fn();

      // 模拟批量创建字段的响应
      const mockBatchResponse = JSON.stringify({
        action: 'create_fields_batch',
        params: {
          table_id: 'tbl_123',
          fields: [
            { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
            { name: '年龄', type: 'number' },
          ],
        },
        response: '好的，我将批量创建字段',
        requiresConfirmation: true,
        confirmation: '确认批量创建字段？',
      });

      const mockBatchIntent = {
        action: 'create_fields_batch' as const,
        params: {
          table_id: 'tbl_123',
          fields: [
            { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
            { name: '年龄', type: 'number' },
          ],
        },
        response: '好的，我将批量创建字段',
        requiresConfirmation: true,
        confirmation: '确认批量创建字段？',
      };

      const mockBatchResult = {
        total: 2,
        succeeded: 2,
        failed: 0,
        results: [
          { success: true, field: '性别', data: { id: 'fld_1', name: '性别', type: 'select' } },
          { success: true, field: '年龄', data: { id: 'fld_2', name: '年龄', type: 'number' } },
        ],
      };

      mockOllama.sendMessage.mockResolvedValue(mockBatchResponse);
      mockParseIntent.mockReturnValue(mockBatchIntent);
      mockExecuteAction.mockResolvedValue(mockBatchResult);

      mockUseMCPActions.mockReturnValue({
        ...mockMCPActions,
        parseIntent: mockParseIntent,
        executeAction: mockExecuteAction,
        getActionLabel: () => '批量创建字段',
      });

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        sendMessage: mockSendMessage,
      });

      render(<AISidebar tableId="tbl_123" />);

      const input = screen.getByPlaceholderText(/输入你的需求/);
      const sendButton = screen.getByRole('button', { name: /发送/ });

      fireEvent.change(input, { target: { value: '创建性别和年龄字段' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('创建性别和年龄字段');
      });
    });
  });

  describe('错误处理流程', () => {
    it('应该处理 AI 响应解析失败', async () => {
      const mockSendMessage = jest.fn();
      const mockParseIntent = jest.fn();

      // 模拟 AI 返回无效的 JSON
      mockOllama.sendMessage.mockResolvedValue('这不是一个有效的 JSON');
      mockParseIntent.mockReturnValue(null);

      mockUseMCPActions.mockReturnValue({
        ...mockMCPActions,
        parseIntent: mockParseIntent,
      });

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        sendMessage: mockSendMessage,
      });

      render(<AISidebar />);

      const input = screen.getByPlaceholderText(/输入你的需求/);
      const sendButton = screen.getByRole('button', { name: /发送/ });

      fireEvent.change(input, { target: { value: '无效的请求' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('无效的请求');
      });
    });

    it('应该处理字段创建失败', async () => {
      const mockSendMessage = jest.fn();
      const mockParseIntent = jest.fn();
      const mockExecuteAction = jest.fn();

      const mockIntent = {
        action: 'create_field' as const,
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        response: '好的，我将创建姓名字段',
        requiresConfirmation: false,
      };

      mockParseIntent.mockReturnValue(mockIntent);
      mockExecuteAction.mockRejectedValue(new Error('创建字段失败'));

      mockUseMCPActions.mockReturnValue({
        ...mockMCPActions,
        parseIntent: mockParseIntent,
        executeAction: mockExecuteAction,
        getActionLabel: () => '创建字段',
      });

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        sendMessage: mockSendMessage,
      });

      render(<AISidebar tableId="tbl_123" />);

      const input = screen.getByPlaceholderText(/输入你的需求/);
      const sendButton = screen.getByRole('button', { name: /发送/ });

      fireEvent.change(input, { target: { value: '创建一个姓名字段' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('创建一个姓名字段');
      });
    });

    it('应该处理网络连接错误', async () => {
      const mockSendMessage = jest.fn();

      mockOllama.sendMessage.mockRejectedValue(new Error('网络连接失败'));

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        sendMessage: mockSendMessage,
      });

      render(<AISidebar />);

      const input = screen.getByPlaceholderText(/输入你的需求/);
      const sendButton = screen.getByRole('button', { name: /发送/ });

      fireEvent.change(input, { target: { value: '测试消息' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('测试消息');
      });
    });
  });

  describe('确认操作流程', () => {
    it('应该处理需要确认的操作', async () => {
      const mockConfirmAction = jest.fn();
      const mockParseIntent = jest.fn();
      const mockExecuteAction = jest.fn();

      const mockIntent = {
        action: 'create_field' as const,
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        response: '好的，我将创建姓名字段',
        requiresConfirmation: true,
        confirmation: '确认创建字段？',
      };

      const mockFieldResult = {
        id: 'fld_123',
        name: '姓名',
        type: 'text',
      };

      mockParseIntent.mockReturnValue(mockIntent);
      mockExecuteAction.mockResolvedValue(mockFieldResult);

      mockUseMCPActions.mockReturnValue({
        ...mockMCPActions,
        parseIntent: mockParseIntent,
        executeAction: mockExecuteAction,
        getActionLabel: () => '创建字段',
      });

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        confirmAction: mockConfirmAction,
      });

      render(<AISidebar tableId="tbl_123" />);

      // 应该显示确认按钮
      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);

      expect(mockConfirmAction).toHaveBeenCalled();
    });

    it('应该处理取消操作', async () => {
      const mockCancelAction = jest.fn();

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        cancelAction: mockCancelAction,
      });

      render(<AISidebar />);

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(mockCancelAction).toHaveBeenCalled();
    });
  });

  describe('聊天历史集成', () => {
    it('应该显示聊天历史面板', () => {
      const mockSessions = [
        {
          id: 'session_1',
          title: '测试会话1',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        chatHistory: {
          ...defaultMockAIChat.chatHistory,
          sessions: mockSessions,
        },
      });

      render(<AISidebar />);

      const historyButton = screen.getByTitle('聊天历史');
      fireEvent.click(historyButton);

      expect(screen.getByText('聊天历史')).toBeInTheDocument();
      expect(screen.getByText('测试会话1')).toBeInTheDocument();
    });

    it('应该处理新建会话', () => {
      const mockCreateSession = jest.fn();

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        chatHistory: {
          ...defaultMockAIChat.chatHistory,
          createSession: mockCreateSession,
        },
      });

      render(<AISidebar />);

      const newSessionButton = screen.getByTitle('新建会话');
      fireEvent.click(newSessionButton);

      expect(mockCreateSession).toHaveBeenCalledWith('新会话');
    });
  });

  describe('上下文信息显示', () => {
    it('应该显示完整的上下文信息', () => {
      render(
        <AISidebar
          spaceId="space_123"
          baseId="base_456"
          tableId="table_789"
        />
      );

      expect(screen.getByText(/空间: 已选择 \(space_123\.\.\.\)/)).toBeInTheDocument();
      expect(screen.getByText(/数据库: 已选择 \(base_456\.\.\.\)/)).toBeInTheDocument();
      expect(screen.getByText(/表格: 已选择 \(table_789\.\.\.\)/)).toBeInTheDocument();
    });

    it('应该显示部分上下文信息', () => {
      render(
        <AISidebar
          spaceId="space_123"
          baseId="base_456"
        />
      );

      expect(screen.getByText(/空间: 已选择 \(space_123\.\.\.\)/)).toBeInTheDocument();
      expect(screen.getByText(/数据库: 已选择 \(base_456\.\.\.\)/)).toBeInTheDocument();
      expect(screen.getByText(/表格: 未选择/)).toBeInTheDocument();
    });
  });

  describe('加载状态处理', () => {
    it('应该显示加载状态', () => {
      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        loading: true,
      });

      render(<AISidebar />);

      const input = screen.getByPlaceholderText(/输入你的需求/);
      const sendButton = screen.getByRole('button', { name: /发送/ });

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('应该显示错误状态', () => {
      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        error: '连接失败',
      });

      render(<AISidebar />);

      expect(screen.getByText('❌ 连接失败')).toBeInTheDocument();
    });
  });

  describe('消息显示', () => {
    it('应该显示消息历史', () => {
      const mockMessages = [
        {
          id: 'msg_1',
          role: 'user' as const,
          content: '你好',
          timestamp: new Date(),
        },
        {
          id: 'msg_2',
          role: 'assistant' as const,
          content: '你好！有什么可以帮助你的吗？',
          timestamp: new Date(),
        },
      ];

      mockUseAIChat.mockReturnValue({
        ...defaultMockAIChat,
        messages: mockMessages,
      });

      render(<AISidebar />);

      expect(screen.getByText('你好')).toBeInTheDocument();
      expect(screen.getByText('你好！有什么可以帮助你的吗？')).toBeInTheDocument();
    });

    it('应该显示欢迎界面', () => {
      render(<AISidebar />);

      expect(screen.getByText('欢迎使用 AI 助手')).toBeInTheDocument();
      expect(screen.getByText('我可以帮你创建空间、数据库、表格、字段等')).toBeInTheDocument();
    });
  });
});
