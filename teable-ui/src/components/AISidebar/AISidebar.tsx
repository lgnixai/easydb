import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { useAIChat } from './hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Trash2, Settings, History, MessageSquarePlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AISidebarProps {
  spaceId?: string;
  baseId?: string;
  tableId?: string;
  onActionComplete?: () => void;
  fields?: Array<{ id: string; name: string; type?: string }>;
}

export const AISidebar = ({
  spaceId,
  baseId,
  tableId,
  onActionComplete,
  fields,
}: AISidebarProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showHistory, setShowHistory] = useState(false);

  const {
    messages,
    pendingIntent,
    sendMessage,
    confirmAction,
    cancelAction,
    clearMessages,
    loading,
    error,
    chatHistory,
  } = useAIChat({
    spaceId,
    baseId,
    tableId,
    onActionComplete,
    enableHistory: true,
    fields,
  });

  // 处理会话切换
  const handleSessionSelect = (sessionId: string) => {
    const sessionMessages = chatHistory.switchSession(sessionId);
    // 切换后会通过 useAIChat 的 useEffect 自动加载消息
    setShowHistory(false);
  };

  // 处理新会话
  const handleNewSession = () => {
    chatHistory.createSession('新对话');
    clearMessages();
    setShowHistory(false);
  };

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <div className="h-full flex">
      {/* 主聊天界面 */}
      <div className={`${showHistory ? 'flex-1' : 'w-full'} bg-obsidian-surface border-l border-obsidian-border flex flex-col transition-all`}>
        {/* 头部 */}
        <div className="p-4 border-b border-obsidian-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-obsidian-accent" />
            <h2 className="text-sm font-medium text-obsidian-text">AI 助手</h2>
            {chatHistory.getCurrentSession() && (
              <span className="text-xs text-obsidian-text-muted">
                · {chatHistory.getCurrentSession()?.title || '当前会话'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-obsidian-text-muted hover:text-obsidian-text"
              title="新会话"
              onClick={handleNewSession}
            >
              <MessageSquarePlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${
                showHistory
                  ? 'text-obsidian-accent'
                  : 'text-obsidian-text-muted hover:text-obsidian-text'
              }`}
              title="聊天历史"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4" />
            </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-obsidian-text-muted hover:text-obsidian-text"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-obsidian-surface border-obsidian-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-obsidian-text">
                  清空聊天记录
                </AlertDialogTitle>
                <AlertDialogDescription className="text-obsidian-text-muted">
                  确定要清空所有聊天记录吗？此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-obsidian-border text-obsidian-text">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearMessages}
                  className="bg-red-500 hover:bg-red-600"
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-obsidian-text-muted hover:text-obsidian-text"
            title="设置"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 上下文信息 */}
      <div className="px-4 py-2 bg-obsidian-bg/50 border-b border-obsidian-border">
        <div className="text-xs text-obsidian-text-muted space-y-1">
          <div>空间: {spaceId ? `已选择 (${spaceId.slice(0, 8)}...)` : '未选择'}</div>
          <div>数据库: {baseId ? `已选择 (${baseId.slice(0, 8)}...)` : '未选择'}</div>
          <div>表格: {tableId ? `已选择 (${tableId.slice(0, 8)}...)` : '未选择'}</div>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Bot className="w-16 h-16 text-obsidian-text-muted mb-4" />
            <h3 className="text-sm font-medium text-obsidian-text mb-2">
              欢迎使用 AI 助手
            </h3>
            <p className="text-xs text-obsidian-text-muted mb-4">
              我可以帮你创建空间、数据库、表格、字段等
            </p>
            <div className="space-y-2 text-xs text-obsidian-text-muted text-left">
              <p>💡 示例命令：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"创建一个员工表"</li>
                <li>"添加姓名和邮箱字段"</li>
                <li>"创建一个新的空间"</li>
                <li>"列出当前数据库的所有表"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onConfirm={message.action?.type === 'confirmation' ? confirmAction : undefined}
                onCancel={message.action?.type === 'confirmation' ? cancelAction : undefined}
                showTimestamp={true}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-xs">
          ❌ {error}
        </div>
      )}

        {/* 输入区域 */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!!pendingIntent}
          loading={loading}
          placeholder={
            pendingIntent
              ? '请先确认或取消当前操作...'
              : '输入你的需求，例如："创建一个表格"'
          }
        />
      </div>

      {/* 聊天历史面板 */}
      {showHistory && (
        <div className="w-80 border-l border-obsidian-border">
          <ChatHistoryPanel
            sessions={chatHistory.sessions}
            currentSessionId={chatHistory.currentSessionId}
            onSessionSelect={handleSessionSelect}
            onSessionDelete={chatHistory.deleteSession}
            onSessionRename={chatHistory.renameSession}
            onSessionExport={chatHistory.exportSession}
            onSessionImport={chatHistory.importSession}
            onNewSession={handleNewSession}
            onClearAll={chatHistory.clearAllSessions}
            storageInfo={chatHistory.storageInfo}
          />
        </div>
      )}
    </div>
  );
};

