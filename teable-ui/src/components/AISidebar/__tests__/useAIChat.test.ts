import { renderHook, act } from '@testing-library/react';
import { useAIChat } from '../hooks/useAIChat';
import { useOllama } from '../hooks/useOllama';
import { useMCPActions } from '../hooks/useMCPActions';

// Mock dependencies
jest.mock('../hooks/useOllama');
jest.mock('../hooks/useMCPActions');
jest.mock('../hooks/useChatHistory');

const mockUseOllama = useOllama as jest.MockedFunction<typeof useOllama>;
const mockUseMCPActions = useMCPActions as jest.MockedFunction<typeof useMCPActions>;

describe('useAIChat', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseOllama.mockReturnValue(mockOllama);
    mockUseMCPActions.mockReturnValue(mockMCPActions);
  });

  it('应该正确初始化', () => {
    const { result } = renderHook(() => useAIChat({
      spaceId: 'space_123',
      baseId: 'base_456',
      tableId: 'table_789',
    }));

    expect(result.current.messages).toEqual([]);
    expect(result.current.pendingIntent).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('应该正确处理用户消息和 AI 响应', async () => {
    const mockIntent = {
      action: 'create_field' as const,
      params: { table_id: 'table_789', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    mockOllama.sendMessage.mockResolvedValue(JSON.stringify(mockIntent));
    mockMCPActions.parseIntent.mockReturnValue(mockIntent);
    mockMCPActions.getActionLabel.mockReturnValue('创建字段');

    const { result } = renderHook(() => useAIChat({
      tableId: 'table_789',
    }));

    await act(async () => {
      await result.current.sendMessage('创建一个姓名字段');
    });

    expect(mockOllama.sendMessage).toHaveBeenCalled();
    expect(mockMCPActions.parseIntent).toHaveBeenCalled();
    
    // 应该添加用户消息和 AI 响应消息
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('创建一个姓名字段');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('好的，我将创建姓名字段');
  });

  it('应该处理需要确认的操作', async () => {
    const mockIntent = {
      action: 'create_field' as const,
      params: { table_id: 'table_789', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    mockOllama.sendMessage.mockResolvedValue(JSON.stringify(mockIntent));
    mockMCPActions.parseIntent.mockReturnValue(mockIntent);
    mockMCPActions.getActionLabel.mockReturnValue('创建字段');

    const { result } = renderHook(() => useAIChat({
      tableId: 'table_789',
    }));

    await act(async () => {
      await result.current.sendMessage('创建一个姓名字段');
    });

    // 应该显示确认消息
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].role).toBe('assistant');
    expect(result.current.messages[2].content).toBe('确认创建字段？');
    expect(result.current.messages[2].action?.type).toBe('confirmation');
    
    // 应该有待确认的意图
    expect(result.current.pendingIntent).toEqual(mockIntent);
  });

  it('应该执行确认的操作', async () => {
    const mockIntent = {
      action: 'create_field' as const,
      params: { table_id: 'table_789', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    const mockResult = { id: 'fld_123', name: '姓名', type: 'text' };
    mockMCPActions.executeAction.mockResolvedValue(mockResult);
    mockMCPActions.getActionLabel.mockReturnValue('创建字段');

    const { result } = renderHook(() => useAIChat({
      tableId: 'table_789',
    }));

    // 先设置待确认的意图
    act(() => {
      result.current.pendingIntent = mockIntent;
    });

    await act(async () => {
      await result.current.confirmAction();
    });

    expect(mockMCPActions.executeAction).toHaveBeenCalledWith(mockIntent);
    expect(result.current.pendingIntent).toBeNull();
  });

  it('应该取消操作', async () => {
    const mockIntent = {
      action: 'create_field' as const,
      params: { table_id: 'table_789', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段',
      requiresConfirmation: true,
      confirmation: '确认创建字段？',
    };

    const { result } = renderHook(() => useAIChat({
      tableId: 'table_789',
    }));

    // 先设置待确认的意图
    act(() => {
      result.current.pendingIntent = mockIntent;
    });

    await act(async () => {
      result.current.cancelAction();
    });

    expect(result.current.pendingIntent).toBeNull();
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('操作已取消');
  });

  it('应该清空消息', () => {
    const { result } = renderHook(() => useAIChat({}));

    // 添加一些消息
    act(() => {
      result.current.addMessage({
        role: 'user',
        content: '测试消息',
      });
    });

    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.pendingIntent).toBeNull();
  });

  it('应该处理 AI 响应解析失败', async () => {
    mockOllama.sendMessage.mockResolvedValue('无效的响应');
    mockMCPActions.parseIntent.mockReturnValue(null);

    const { result } = renderHook(() => useAIChat({}));

    await act(async () => {
      await result.current.sendMessage('测试消息');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('无效的响应');
  });

  it('应该处理 Ollama 错误', async () => {
    const errorMessage = 'Ollama 连接失败';
    mockOllama.sendMessage.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAIChat({}));

    await act(async () => {
      await result.current.sendMessage('测试消息');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toContain(errorMessage);
  });

  it('应该处理执行操作时的错误', async () => {
    const mockIntent = {
      action: 'create_field' as const,
      params: { table_id: 'table_789', name: '姓名', type: 'text' },
      response: '好的，我将创建姓名字段',
      requiresConfirmation: false,
    };

    mockOllama.sendMessage.mockResolvedValue(JSON.stringify(mockIntent));
    mockMCPActions.parseIntent.mockReturnValue(mockIntent);
    mockMCPActions.getActionLabel.mockReturnValue('创建字段');
    mockMCPActions.executeAction.mockRejectedValue(new Error('创建字段失败'));

    const { result } = renderHook(() => useAIChat({
      tableId: 'table_789',
    }));

    await act(async () => {
      await result.current.sendMessage('创建一个姓名字段');
    });

    // 应该显示执行中的消息，然后更新为错误消息
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2].role).toBe('assistant');
    expect(result.current.messages[2].content).toContain('失败');
    expect(result.current.messages[2].action?.type).toBe('error');
  });
});
