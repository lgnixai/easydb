import { useState, useCallback, useEffect } from 'react';
import { ChatStorage, ChatSession } from '@/lib/chat-storage';
import { Message } from '../types';

export interface UseChatHistoryOptions {
  autoSave?: boolean;
  sessionId?: string;
  context?: {
    spaceId?: string;
    baseId?: string;
    tableId?: string;
  };
}

/**
 * 聊天历史管理 Hook
 */
export const useChatHistory = (options: UseChatHistoryOptions = {}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    options.sessionId || null
  );
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });

  // 加载所有会话
  const loadSessions = useCallback(() => {
    const allSessions = ChatStorage.getAllSessions();
    setSessions(allSessions);
    setStorageInfo(ChatStorage.getStorageInfo());
  }, []);

  // 初始化时加载会话列表
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * 创建新会话
   */
  const createSession = useCallback(
    (title: string) => {
      const session = ChatStorage.createSession(title, options.context);
      setCurrentSessionId(session.id);
      loadSessions();
      return session;
    },
    [options.context, loadSessions]
  );

  /**
   * 切换会话
   */
  const switchSession = useCallback(
    (sessionId: string) => {
      const session = ChatStorage.getSession(sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        return session.messages;
      }
      return [];
    },
    []
  );

  /**
   * 删除会话
   */
  const deleteSession = useCallback(
    (sessionId: string) => {
      ChatStorage.deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      loadSessions();
    },
    [currentSessionId, loadSessions]
  );

  /**
   * 重命名会话
   */
  const renameSession = useCallback(
    (sessionId: string, newTitle: string) => {
      ChatStorage.updateSessionTitle(sessionId, newTitle);
      loadSessions();
    },
    [loadSessions]
  );

  /**
   * 保存消息到当前会话
   */
  const saveMessages = useCallback(
    (messages: Message[]) => {
      if (!currentSessionId) {
        // 如果没有当前会话，创建新会话
        const title = messages.find(m => m.role === 'user')?.content.substring(0, 20) || '新会话';
        const session = createSession(title);
        ChatStorage.autoSaveSession(session.id, messages, options.context);
        loadSessions();
        return;
      }

      ChatStorage.autoSaveSession(currentSessionId, messages, options.context);
      loadSessions();
    },
    [currentSessionId, options.context, createSession, loadSessions]
  );

  /**
   * 加载当前会话的消息
   */
  const loadMessages = useCallback((): Message[] => {
    if (!currentSessionId) return [];
    const session = ChatStorage.getSession(currentSessionId);
    return session?.messages || [];
  }, [currentSessionId]);

  /**
   * 导出会话
   */
  const exportSession = useCallback(
    (sessionId: string, format: 'json' | 'markdown' = 'json') => {
      try {
        const data =
          format === 'json'
            ? ChatStorage.exportSession(sessionId)
            : ChatStorage.exportSessionAsMarkdown(sessionId);

        const blob = new Blob([data], {
          type: format === 'json' ? 'application/json' : 'text/markdown',
        });

        const session = ChatStorage.getSession(sessionId);
        const filename = `${session?.title || '会话'}_${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'md'}`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('[useChatHistory] 导出会话失败:', error);
        throw error;
      }
    },
    []
  );

  /**
   * 导入会话
   */
  const importSession = useCallback(
    (file: File) => {
      return new Promise<ChatSession>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            const session = ChatStorage.importSession(data);
            loadSessions();
            resolve(session);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
    },
    [loadSessions]
  );

  /**
   * 清空所有会话
   */
  const clearAllSessions = useCallback(() => {
    ChatStorage.clearAllSessions();
    setCurrentSessionId(null);
    loadSessions();
  }, [loadSessions]);

  /**
   * 获取当前会话
   */
  const getCurrentSession = useCallback((): ChatSession | null => {
    if (!currentSessionId) return null;
    return ChatStorage.getSession(currentSessionId);
  }, [currentSessionId]);

  return {
    // 状态
    sessions,
    currentSessionId,
    storageInfo,

    // 方法
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    saveMessages,
    loadMessages,
    exportSession,
    importSession,
    clearAllSessions,
    getCurrentSession,
    refreshSessions: loadSessions,
  };
};

