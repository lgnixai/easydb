import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AISidebar } from '../AISidebar';
import { useAIChat } from '../hooks/useAIChat';

// Mock useAIChat
jest.mock('../hooks/useAIChat');

const mockUseAIChat = useAIChat as jest.MockedFunction<typeof useAIChat>;

describe('AISidebar', () => {
  const defaultMockReturn = {
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
    mockUseAIChat.mockReturnValue(defaultMockReturn);
  });

  it('应该正确渲染 AI 侧边栏', () => {
    render(<AISidebar />);

    expect(screen.getByText('AI 助手')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/输入你的需求/)).toBeInTheDocument();
  });

  it('应该显示上下文信息', () => {
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

  it('应该显示未选择的上下文', () => {
    render(<AISidebar />);

    expect(screen.getByText(/空间: 未选择/)).toBeInTheDocument();
    expect(screen.getByText(/数据库: 未选择/)).toBeInTheDocument();
    expect(screen.getByText(/表格: 未选择/)).toBeInTheDocument();
  });

  it('应该显示欢迎界面当没有消息时', () => {
    render(<AISidebar />);

    expect(screen.getByText('欢迎使用 AI 助手')).toBeInTheDocument();
    expect(screen.getByText('我可以帮你创建空间、数据库、表格、字段等')).toBeInTheDocument();
    expect(screen.getByText('💡 示例命令：')).toBeInTheDocument();
  });

  it('应该显示消息列表', () => {
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
      ...defaultMockReturn,
      messages: mockMessages,
    });

    render(<AISidebar />);

    expect(screen.getByText('你好')).toBeInTheDocument();
    expect(screen.getByText('你好！有什么可以帮助你的吗？')).toBeInTheDocument();
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

  it('应该处理确认操作', () => {
    const mockConfirmAction = jest.fn();
    const mockPendingIntent = {
      action: 'create_field' as const,
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
      response: '好的',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    const mockMessages = [
      {
        id: 'msg_1',
        role: 'user' as const,
        content: '创建字段',
        timestamp: new Date(),
      },
      {
        id: 'msg_2',
        role: 'assistant' as const,
        content: '确认创建字段？',
        timestamp: new Date(),
        action: {
          type: 'confirmation' as const,
          action: 'create_field',
          params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
        },
      },
    ];

    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      messages: mockMessages,
      pendingIntent: mockPendingIntent,
      confirmAction: mockConfirmAction,
    });

    render(<AISidebar />);

    const confirmButton = screen.getByText('确认');
    fireEvent.click(confirmButton);

    expect(mockConfirmAction).toHaveBeenCalled();
  });

  it('应该处理取消操作', () => {
    const mockCancelAction = jest.fn();
    const mockPendingIntent = {
      action: 'create_field' as const,
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
      response: '好的',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    const mockMessages = [
      {
        id: 'msg_1',
        role: 'user' as const,
        content: '创建字段',
        timestamp: new Date(),
      },
      {
        id: 'msg_2',
        role: 'assistant' as const,
        content: '确认创建字段？',
        timestamp: new Date(),
        action: {
          type: 'confirmation' as const,
          action: 'create_field',
          params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
        },
      },
    ];

    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      messages: mockMessages,
      pendingIntent: mockPendingIntent,
      cancelAction: mockCancelAction,
    });

    render(<AISidebar />);

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(mockCancelAction).toHaveBeenCalled();
  });

  it('应该显示错误信息', () => {
    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      error: '连接失败',
    });

    render(<AISidebar />);

    expect(screen.getByText('❌ 连接失败')).toBeInTheDocument();
  });

  it('应该显示加载状态', () => {
    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      loading: true,
    });

    render(<AISidebar />);

    const input = screen.getByPlaceholderText(/输入你的需求/);
    expect(input).toBeDisabled();
  });

  it('应该禁用输入当有待确认的意图时', () => {
    const mockPendingIntent = {
      action: 'create_field' as const,
      params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
      response: '好的',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      pendingIntent: mockPendingIntent,
    });

    render(<AISidebar />);

    const input = screen.getByPlaceholderText(/请先确认或取消当前操作/);
    expect(input).toBeDisabled();
  });

  it('应该处理清空消息', () => {
    const mockClearMessages = jest.fn();
    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      clearMessages: mockClearMessages,
    });

    render(<AISidebar />);

    const clearButton = screen.getByTitle('清空聊天记录');
    fireEvent.click(clearButton);

    // 应该显示确认对话框
    expect(screen.getByText('清空聊天记录')).toBeInTheDocument();
    expect(screen.getByText('确定要清空所有聊天记录吗？此操作无法撤销。')).toBeInTheDocument();

    const confirmButton = screen.getByText('确认清空');
    fireEvent.click(confirmButton);

    expect(mockClearMessages).toHaveBeenCalled();
  });

  it('应该切换历史面板', () => {
    render(<AISidebar />);

    const historyButton = screen.getByTitle('聊天历史');
    fireEvent.click(historyButton);

    // 历史面板应该显示
    expect(screen.getByText('聊天历史')).toBeInTheDocument();
  });

  it('应该显示当前会话信息', () => {
    const mockGetCurrentSession = jest.fn().mockReturnValue({
      id: 'session_123',
      title: '当前会话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUseAIChat.mockReturnValue({
      ...defaultMockReturn,
      chatHistory: {
        ...defaultMockReturn.chatHistory,
        getCurrentSession: mockGetCurrentSession,
      },
    });

    render(<AISidebar />);

    expect(screen.getByText(/· 当前会话/)).toBeInTheDocument();
  });
});
