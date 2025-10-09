/**
 * 聊天历史存储管理
 * 支持本地存储、导入导出等功能
 */

import { Message } from '@/components/AISidebar/types';

const STORAGE_KEY = 'teable_ai_chat_history';
const SESSIONS_KEY = 'teable_ai_chat_sessions';

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  context?: {
    spaceId?: string;
    baseId?: string;
    tableId?: string;
  };
}

/**
 * 聊天存储管理类
 */
export class ChatStorage {
  /**
   * 保存当前会话消息到 localStorage
   */
  static saveMessages(messages: Message[], sessionId?: string): void {
    try {
      const key = sessionId ? `${STORAGE_KEY}_${sessionId}` : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('[ChatStorage] 保存消息失败:', error);
    }
  }

  /**
   * 从 localStorage 加载消息
   */
  static loadMessages(sessionId?: string): Message[] {
    try {
      const key = sessionId ? `${STORAGE_KEY}_${sessionId}` : STORAGE_KEY;
      const data = localStorage.getItem(key);
      if (!data) return [];

      const messages = JSON.parse(data);
      // 转换日期字符串为 Date 对象
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('[ChatStorage] 加载消息失败:', error);
      return [];
    }
  }

  /**
   * 清空当前会话消息
   */
  static clearMessages(sessionId?: string): void {
    try {
      const key = sessionId ? `${STORAGE_KEY}_${sessionId}` : STORAGE_KEY;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[ChatStorage] 清空消息失败:', error);
    }
  }

  /**
   * 创建新会话
   */
  static createSession(
    title: string,
    context?: { spaceId?: string; baseId?: string; tableId?: string }
  ): ChatSession {
    const session: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      context,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * 保存会话
   */
  static saveSession(session: ChatSession): void {
    try {
      const sessions = this.getAllSessions();
      const index = sessions.findIndex(s => s.id === session.id);
      
      session.updatedAt = new Date();

      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      
      // 同时保存消息
      this.saveMessages(session.messages, session.id);
    } catch (error) {
      console.error('[ChatStorage] 保存会话失败:', error);
    }
  }

  /**
   * 获取所有会话
   */
  static getAllSessions(): ChatSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) return [];

      const sessions = JSON.parse(data);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: this.loadMessages(session.id),
      }));
    } catch (error) {
      console.error('[ChatStorage] 获取会话列表失败:', error);
      return [];
    }
  }

  /**
   * 获取单个会话
   */
  static getSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('[ChatStorage] 获取会话失败:', error);
      return null;
    }
  }

  /**
   * 删除会话
   */
  static deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
      
      // 删除会话消息
      this.clearMessages(sessionId);
    } catch (error) {
      console.error('[ChatStorage] 删除会话失败:', error);
    }
  }

  /**
   * 更新会话标题
   */
  static updateSessionTitle(sessionId: string, title: string): void {
    try {
      const session = this.getSession(sessionId);
      if (session) {
        session.title = title;
        this.saveSession(session);
      }
    } catch (error) {
      console.error('[ChatStorage] 更新会话标题失败:', error);
    }
  }

  /**
   * 导出会话为 JSON
   */
  static exportSession(sessionId: string): string {
    try {
      const session = this.getSession(sessionId);
      if (!session) {
        throw new Error('会话不存在');
      }
      return JSON.stringify(session, null, 2);
    } catch (error) {
      console.error('[ChatStorage] 导出会话失败:', error);
      throw error;
    }
  }

  /**
   * 导出会话为 Markdown
   */
  static exportSessionAsMarkdown(sessionId: string): string {
    try {
      const session = this.getSession(sessionId);
      if (!session) {
        throw new Error('会话不存在');
      }

      let markdown = `# ${session.title}\n\n`;
      markdown += `**创建时间**: ${session.createdAt.toLocaleString()}\n`;
      markdown += `**更新时间**: ${session.updatedAt.toLocaleString()}\n\n`;

      if (session.context) {
        markdown += `## 上下文\n\n`;
        if (session.context.spaceId) markdown += `- 空间ID: ${session.context.spaceId}\n`;
        if (session.context.baseId) markdown += `- 数据库ID: ${session.context.baseId}\n`;
        if (session.context.tableId) markdown += `- 表格ID: ${session.context.tableId}\n`;
        markdown += `\n`;
      }

      markdown += `## 对话内容\n\n`;

      session.messages.forEach((msg, index) => {
        const time = msg.timestamp.toLocaleTimeString();
        const role = msg.role === 'user' ? '👤 用户' : '🤖 AI';
        markdown += `### ${index + 1}. ${role} (${time})\n\n`;
        markdown += `${msg.content}\n\n`;

        if (msg.action) {
          markdown += `*操作*: ${msg.action.action} - ${msg.action.type}\n\n`;
        }
      });

      return markdown;
    } catch (error) {
      console.error('[ChatStorage] 导出为 Markdown 失败:', error);
      throw error;
    }
  }

  /**
   * 导入会话
   */
  static importSession(jsonData: string): ChatSession {
    try {
      const session: ChatSession = JSON.parse(jsonData);
      
      // 验证数据结构
      if (!session.id || !session.title || !Array.isArray(session.messages)) {
        throw new Error('无效的会话数据格式');
      }

      // 转换日期
      session.createdAt = new Date(session.createdAt);
      session.updatedAt = new Date(session.updatedAt);
      session.messages = session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      // 保存会话
      this.saveSession(session);
      
      return session;
    } catch (error) {
      console.error('[ChatStorage] 导入会话失败:', error);
      throw error;
    }
  }

  /**
   * 自动保存会话（防抖）
   */
  static autoSaveSession(
    sessionId: string,
    messages: Message[],
    context?: { spaceId?: string; baseId?: string; tableId?: string }
  ): void {
    try {
      let session = this.getSession(sessionId);
      
      if (!session) {
        // 自动生成标题
        const title = this.generateSessionTitle(messages);
        session = this.createSession(title, context);
        session.id = sessionId;
      }

      session.messages = messages;
      session.context = context;
      
      this.saveSession(session);
    } catch (error) {
      console.error('[ChatStorage] 自动保存失败:', error);
    }
  }

  /**
   * 根据消息内容生成会话标题
   */
  private static generateSessionTitle(messages: Message[]): string {
    // 找到第一条用户消息
    const firstUserMessage = messages.find(m => m.role === 'user');
    
    if (firstUserMessage) {
      // 取前20个字符作为标题
      const content = firstUserMessage.content.trim();
      return content.length > 20 ? content.substring(0, 20) + '...' : content;
    }

    return `会话 ${new Date().toLocaleString()}`;
  }

  /**
   * 清空所有会话
   */
  static clearAllSessions(): void {
    try {
      const sessions = this.getAllSessions();
      sessions.forEach(session => {
        this.clearMessages(session.id);
      });
      localStorage.removeItem(SESSIONS_KEY);
    } catch (error) {
      console.error('[ChatStorage] 清空所有会话失败:', error);
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (key.startsWith(STORAGE_KEY) || key === SESSIONS_KEY) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }

      // localStorage 通常限制为 5MB (5 * 1024 * 1024 字符)
      const total = 5 * 1024 * 1024;
      const percentage = (used / total) * 100;

      return { used, total, percentage };
    } catch (error) {
      console.error('[ChatStorage] 获取存储信息失败:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }
}

