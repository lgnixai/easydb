import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatHistoryPanel } from '../ChatHistoryPanel';

// Mock useChatHistory
jest.mock('../hooks/useChatHistory');

const mockUseChatHistory = require('../hooks/useChatHistory').useChatHistory as jest.MockedFunction<any>;

describe('ChatHistoryPanel', () => {
  const mockSessions = [
    {
      id: 'session_1',
      title: '测试会话1',
      messages: [],
      createdAt: new Date('2025-10-08T10:00:00Z'),
      updatedAt: new Date('2025-10-08T10:30:00Z'),
    },
    {
      id: 'session_2',
      title: '测试会话2',
      messages: [],
      createdAt: new Date('2025-10-08T11:00:00Z'),
      updatedAt: new Date('2025-10-08T11:15:00Z'),
    },
  ];

  const defaultMockReturn = {
    sessions: mockSessions,
    currentSessionId: 'session_1',
    getCurrentSession: () => mockSessions[0],
    createSession: jest.fn(),
    switchSession: jest.fn(),
    deleteSession: jest.fn(),
    renameSession: jest.fn(),
    exportSession: jest.fn(),
    importSession: jest.fn(),
    clearAllSessions: jest.fn(),
    saveMessages: jest.fn(),
    loadMessages: jest.fn(),
    storageInfo: {
      used: 1024 * 1024, // 1MB
      total: 5 * 1024 * 1024, // 5MB
      percentage: 20,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChatHistory.mockReturnValue(defaultMockReturn);
  });

  it('应该正确渲染聊天历史面板', () => {
    render(<ChatHistoryPanel />);

    expect(screen.getByText('聊天历史')).toBeInTheDocument();
    expect(screen.getByText('测试会话1')).toBeInTheDocument();
    expect(screen.getByText('测试会话2')).toBeInTheDocument();
  });

  it('应该显示会话列表', () => {
    render(<ChatHistoryPanel />);

    // 应该显示所有会话
    expect(screen.getByText('测试会话1')).toBeInTheDocument();
    expect(screen.getByText('测试会话2')).toBeInTheDocument();

    // 应该显示时间信息
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it('应该高亮当前会话', () => {
    render(<ChatHistoryPanel />);

    const currentSession = screen.getByText('测试会话1').closest('div');
    expect(currentSession).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('应该处理会话切换', () => {
    const mockSwitchSession = jest.fn();
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      switchSession: mockSwitchSession,
    });

    render(<ChatHistoryPanel />);

    const session2 = screen.getByText('测试会话2');
    fireEvent.click(session2);

    expect(mockSwitchSession).toHaveBeenCalledWith('session_2');
  });

  it('应该处理新建会话', () => {
    const mockCreateSession = jest.fn().mockReturnValue({
      id: 'session_new',
      title: '新会话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      createSession: mockCreateSession,
    });

    render(<ChatHistoryPanel />);

    const newSessionButton = screen.getByText('新建会话');
    fireEvent.click(newSessionButton);

    expect(mockCreateSession).toHaveBeenCalledWith('新会话');
  });

  it('应该处理会话重命名', async () => {
    const mockRenameSession = jest.fn();
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      renameSession: mockRenameSession,
    });

    render(<ChatHistoryPanel />);

    // 点击编辑按钮
    const editButtons = screen.getAllByTitle('重命名');
    fireEvent.click(editButtons[0]);

    // 应该显示输入框
    const input = screen.getByDisplayValue('测试会话1');
    expect(input).toBeInTheDocument();

    // 修改名称并提交
    fireEvent.change(input, { target: { value: '重命名的会话' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockRenameSession).toHaveBeenCalledWith('session_1', '重命名的会话');
  });

  it('应该取消会话重命名', async () => {
    render(<ChatHistoryPanel />);

    // 点击编辑按钮
    const editButtons = screen.getAllByTitle('重命名');
    fireEvent.click(editButtons[0]);

    // 修改名称但按 Escape 取消
    const input = screen.getByDisplayValue('测试会话1');
    fireEvent.change(input, { target: { value: '重命名的会话' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // 应该恢复到原始状态
    expect(screen.getByText('测试会话1')).toBeInTheDocument();
  });

  it('应该处理会话删除', async () => {
    const mockDeleteSession = jest.fn();
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      deleteSession: mockDeleteSession,
    });

    render(<ChatHistoryPanel />);

    // 点击删除按钮
    const deleteButtons = screen.getAllByTitle('删除');
    fireEvent.click(deleteButtons[0]);

    // 应该显示确认对话框
    expect(screen.getByText('删除会话')).toBeInTheDocument();
    expect(screen.getByText('确定要删除会话"测试会话1"吗？此操作无法撤销。')).toBeInTheDocument();

    // 确认删除
    const confirmButton = screen.getByText('确认删除');
    fireEvent.click(confirmButton);

    expect(mockDeleteSession).toHaveBeenCalledWith('session_1');
  });

  it('应该取消会话删除', async () => {
    render(<ChatHistoryPanel />);

    // 点击删除按钮
    const deleteButtons = screen.getAllByTitle('删除');
    fireEvent.click(deleteButtons[0]);

    // 取消删除
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    // 会话应该还在
    expect(screen.getByText('测试会话1')).toBeInTheDocument();
  });

  it('应该处理会话导出', () => {
    const mockExportSession = jest.fn().mockReturnValue('{"id":"session_1","title":"测试会话1"}');
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      exportSession: mockExportSession,
    });

    // Mock download function
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    render(<ChatHistoryPanel />);

    // 点击导出按钮
    const exportButtons = screen.getAllByTitle('导出');
    fireEvent.click(exportButtons[0]);

    expect(mockExportSession).toHaveBeenCalledWith('session_1');
    expect(mockLink.download).toBe('测试会话1.json');
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('应该处理会话导入', async () => {
    const mockImportSession = jest.fn();
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      importSession: mockImportSession,
    });

    render(<ChatHistoryPanel />);

    // 点击导入按钮
    const importButton = screen.getByTitle('导入会话');
    fireEvent.click(importButton);

    // 模拟文件选择
    const fileInput = screen.getByDisplayValue('');
    const file = new File(['{"id":"session_import","title":"导入的会话"}'], 'session.json', {
      type: 'application/json',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockImportSession).toHaveBeenCalledWith('{"id":"session_import","title":"导入的会话"}');
    });
  });

  it('应该显示存储使用情况', () => {
    render(<ChatHistoryPanel />);

    expect(screen.getByText('存储使用: 1.0 MB / 5.0 MB (20%)')).toBeInTheDocument();
  });

  it('应该处理清空所有会话', async () => {
    const mockClearAllSessions = jest.fn();
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      clearAllSessions: mockClearAllSessions,
    });

    render(<ChatHistoryPanel />);

    // 点击清空按钮
    const clearButton = screen.getByTitle('清空所有会话');
    fireEvent.click(clearButton);

    // 应该显示确认对话框
    expect(screen.getByText('清空所有会话')).toBeInTheDocument();
    expect(screen.getByText('确定要清空所有会话吗？此操作无法撤销。')).toBeInTheDocument();

    // 确认清空
    const confirmButton = screen.getByText('确认清空');
    fireEvent.click(confirmButton);

    expect(mockClearAllSessions).toHaveBeenCalled();
  });

  it('应该处理空会话列表', () => {
    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      sessions: [],
      currentSessionId: null,
      getCurrentSession: () => null,
    });

    render(<ChatHistoryPanel />);

    expect(screen.getByText('暂无聊天记录')).toBeInTheDocument();
    expect(screen.getByText('开始新的对话吧！')).toBeInTheDocument();
  });

  it('应该处理导入错误', async () => {
    const mockImportSession = jest.fn().mockImplementation(() => {
      throw new Error('Invalid session data');
    });

    mockUseChatHistory.mockReturnValue({
      ...defaultMockReturn,
      importSession: mockImportSession,
    });

    render(<ChatHistoryPanel />);

    // 点击导入按钮
    const importButton = screen.getByTitle('导入会话');
    fireEvent.click(importButton);

    // 模拟无效文件
    const fileInput = screen.getByDisplayValue('');
    const file = new File(['invalid json'], 'session.json', {
      type: 'application/json',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('导入失败')).toBeInTheDocument();
    });
  });

  it('应该处理键盘导航', () => {
    render(<ChatHistoryPanel />);

    // 使用键盘导航到第一个会话
    const session1 = screen.getByText('测试会话1');
    fireEvent.keyDown(session1, { key: 'Enter' });

    // 应该触发会话切换（如果有的话）
    // 这里主要测试键盘事件不会导致错误
    expect(session1).toBeInTheDocument();
  });
});
