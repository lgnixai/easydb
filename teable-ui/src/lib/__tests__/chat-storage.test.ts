import { ChatStorage, ChatSession } from '../chat-storage';

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

describe('ChatStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('会话管理', () => {
    it('应该创建新会话', () => {
      const session = ChatStorage.createSession('测试会话', {
        spaceId: 'space_123',
        baseId: 'base_456',
      });

      expect(session.title).toBe('测试会话');
      expect(session.context?.spaceId).toBe('space_123');
      expect(session.context?.baseId).toBe('base_456');
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it('应该保存和加载会话', () => {
      const session: ChatSession = {
        id: 'session_123',
        title: '测试会话',
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: '你好',
            timestamp: new Date('2025-10-08T10:00:00Z'),
          },
          {
            id: 'msg_2',
            role: 'assistant',
            content: '你好！有什么可以帮助你的吗？',
            timestamp: new Date('2025-10-08T10:01:00Z'),
          },
        ],
        createdAt: new Date('2025-10-08T10:00:00Z'),
        updatedAt: new Date('2025-10-08T10:01:00Z'),
        context: {
          spaceId: 'space_123',
        },
      };

      ChatStorage.saveSession(session);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'teable_ai_chat_sessions',
        JSON.stringify([session])
      );

      // 模拟加载
      localStorageMock.getItem.mockReturnValue(JSON.stringify([session]));

      const loadedSessions = ChatStorage.getAllSessions();
      expect(loadedSessions).toHaveLength(1);
      expect(loadedSessions[0]).toEqual(session);
    });

    it('应该获取单个会话', () => {
      const session: ChatSession = {
        id: 'session_123',
        title: '测试会话',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([session]));

      const loadedSession = ChatStorage.getSession('session_123');
      expect(loadedSession).toEqual(session);

      const notFoundSession = ChatStorage.getSession('session_999');
      expect(notFoundSession).toBeNull();
    });

    it('应该删除会话', () => {
      const sessions = [
        {
          id: 'session_1',
          title: '会话1',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'session_2',
          title: '会话2',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessions));

      ChatStorage.deleteSession('session_1');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'teable_ai_chat_sessions',
        JSON.stringify([sessions[1]])
      );
    });

    it('应该更新会话标题', () => {
      const session: ChatSession = {
        id: 'session_123',
        title: '旧标题',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([session]));

      ChatStorage.updateSessionTitle('session_123', '新标题');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'teable_ai_chat_sessions',
        expect.stringContaining('新标题')
      );
    });
  });

  describe('消息管理', () => {
    it('应该保存和加载消息', () => {
      const messages = [
        {
          id: 'msg_1',
          role: 'user' as const,
          content: '你好',
          timestamp: new Date('2025-10-08T10:00:00Z'),
        },
        {
          id: 'msg_2',
          role: 'assistant' as const,
          content: '你好！',
          timestamp: new Date('2025-10-08T10:01:00Z'),
        },
      ];

      ChatStorage.saveMessages(messages, 'session_123');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'teable_ai_chat_history_session_123',
        JSON.stringify(messages)
      );

      // 模拟加载
      localStorageMock.getItem.mockReturnValue(JSON.stringify(messages));

      const loadedMessages = ChatStorage.loadMessages('session_123');
      expect(loadedMessages).toHaveLength(2);
      expect(loadedMessages[0].timestamp).toBeInstanceOf(Date);
    });

    it('应该清空消息', () => {
      ChatStorage.clearMessages('session_123');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'teable_ai_chat_history_session_123'
      );
    });
  });

  describe('导入导出', () => {
    it('应该导出会话为 JSON', () => {
      const session: ChatSession = {
        id: 'session_123',
        title: '测试会话',
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: '你好',
            timestamp: new Date('2025-10-08T10:00:00Z'),
          },
        ],
        createdAt: new Date('2025-10-08T10:00:00Z'),
        updatedAt: new Date('2025-10-08T10:00:00Z'),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([session]));

      const exported = ChatStorage.exportSession('session_123');
      const parsed = JSON.parse(exported);

      expect(parsed.id).toBe('session_123');
      expect(parsed.title).toBe('测试会话');
      expect(parsed.messages).toHaveLength(1);
    });

    it('应该导出会话为 Markdown', () => {
      const session: ChatSession = {
        id: 'session_123',
        title: '测试会话',
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: '你好',
            timestamp: new Date('2025-10-08T10:00:00Z'),
          },
          {
            id: 'msg_2',
            role: 'assistant',
            content: '你好！有什么可以帮助你的吗？',
            timestamp: new Date('2025-10-08T10:01:00Z'),
          },
        ],
        createdAt: new Date('2025-10-08T10:00:00Z'),
        updatedAt: new Date('2025-10-08T10:01:00Z'),
        context: {
          spaceId: 'space_123',
        },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify([session]));

      const markdown = ChatStorage.exportSessionAsMarkdown('session_123');

      expect(markdown).toContain('# 测试会话');
      expect(markdown).toContain('空间ID: space_123');
      expect(markdown).toContain('👤 用户');
      expect(markdown).toContain('🤖 AI');
      expect(markdown).toContain('你好');
      expect(markdown).toContain('你好！有什么可以帮助你的吗？');
    });

    it('应该导入会话', () => {
      const sessionData = JSON.stringify({
        id: 'session_imported',
        title: '导入的会话',
        messages: [
          {
            id: 'msg_1',
            role: 'user',
            content: '导入的消息',
            timestamp: '2025-10-08T10:00:00Z',
          },
        ],
        createdAt: '2025-10-08T10:00:00Z',
        updatedAt: '2025-10-08T10:00:00Z',
      });

      const importedSession = ChatStorage.importSession(sessionData);

      expect(importedSession.id).toBe('session_imported');
      expect(importedSession.title).toBe('导入的会话');
      expect(importedSession.messages).toHaveLength(1);
      expect(importedSession.createdAt).toBeInstanceOf(Date);
      expect(importedSession.updatedAt).toBeInstanceOf(Date);
    });

    it('应该拒绝导入无效的会话数据', () => {
      const invalidData = '{"invalid": "data"}';

      expect(() => {
        ChatStorage.importSession(invalidData);
      }).toThrow('无效的会话数据格式');
    });
  });

  describe('自动保存', () => {
    it('应该自动保存会话', () => {
      const messages = [
        {
          id: 'msg_1',
          role: 'user' as const,
          content: '测试消息',
          timestamp: new Date(),
        },
      ];

      const context = {
        spaceId: 'space_123',
        baseId: 'base_456',
      };

      ChatStorage.autoSaveSession('session_123', messages, context);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'teable_ai_chat_history_session_123',
        JSON.stringify(messages)
      );
    });

    it('应该为新会话自动生成标题', () => {
      const messages = [
        {
          id: 'msg_1',
          role: 'user' as const,
          content: '创建一个新的表格',
          timestamp: new Date(),
        },
      ];

      ChatStorage.autoSaveSession('new_session', messages);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'teable_ai_chat_sessions',
        expect.stringContaining('创建一个新的表格')
      );
    });
  });

  describe('存储信息', () => {
    it('应该获取存储使用情况', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('{"data": "some data"}') // sessions
        .mockReturnValueOnce('{"data": "more data"}'); // messages

      const storageInfo = ChatStorage.getStorageInfo();

      expect(storageInfo.used).toBeGreaterThan(0);
      expect(storageInfo.total).toBe(5 * 1024 * 1024); // 5MB
      expect(storageInfo.percentage).toBeGreaterThanOrEqual(0);
    });

    it('应该清空所有会话', () => {
      const sessions = [
        {
          id: 'session_1',
          title: '会话1',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(sessions));

      ChatStorage.clearAllSessions();

      expect(localStorageMock.removeItem).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'teable_ai_chat_sessions'
      );
    });
  });
});
