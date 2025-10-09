import { useState } from 'react';
import { ChatSession } from '@/lib/chat-storage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Trash2,
  Download,
  Upload,
  Edit,
  Check,
  X,
  FileJson,
  FileText,
  Plus,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ChatHistoryPanelProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionRename: (sessionId: string, newTitle: string) => void;
  onSessionExport: (sessionId: string, format: 'json' | 'markdown') => void;
  onSessionImport: (file: File) => Promise<void>;
  onNewSession: () => void;
  onClearAll: () => void;
  storageInfo?: { used: number; total: number; percentage: number };
}

export const ChatHistoryPanel = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionRename,
  onSessionExport,
  onSessionImport,
  onNewSession,
  onClearAll,
  storageInfo,
}: ChatHistoryPanelProps) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { toast } = useToast();

  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = () => {
    if (editingSessionId && editTitle.trim()) {
      onSessionRename(editingSessionId, editTitle.trim());
      setEditingSessionId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await onSessionImport(file);
          toast({
            title: '导入成功',
            description: `会话已成功导入`,
          });
        } catch (error: any) {
          toast({
            title: '导入失败',
            description: error.message || '导入会话时出错',
            variant: 'destructive',
          });
        }
      }
    };
    input.click();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="h-full flex flex-col bg-obsidian-surface border-l border-obsidian-border">
      {/* 头部 */}
      <div className="p-4 border-b border-obsidian-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-obsidian-accent" />
            <h2 className="text-sm font-medium text-obsidian-text">聊天历史</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewSession}
            className="text-obsidian-accent hover:text-obsidian-accent/80"
          >
            <Plus className="w-4 h-4 mr-1" />
            新会话
          </Button>
        </div>

        {/* 存储信息 */}
        {storageInfo && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-obsidian-text-muted">
              <span>存储使用</span>
              <span>{storageInfo.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-obsidian-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-obsidian-accent transition-all"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-obsidian-text-muted">
              {formatStorageSize(storageInfo.used)} / {formatStorageSize(storageInfo.total)}
            </div>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="p-3 border-b border-obsidian-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleImport}
          className="flex-1 text-xs"
        >
          <Upload className="w-3 h-3 mr-1" />
          导入
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              <Trash2 className="w-3 h-3 mr-1" />
              清空
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-obsidian-surface border-obsidian-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-obsidian-text">
                清空所有会话
              </AlertDialogTitle>
              <AlertDialogDescription className="text-obsidian-text-muted">
                确定要删除所有聊天记录吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-obsidian-border text-obsidian-text">
                取消
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onClearAll}
                className="bg-red-500 hover:bg-red-600"
              >
                确认清空
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* 会话列表 */}
      <ScrollArea className="flex-1">
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-obsidian-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm text-obsidian-text-muted">暂无聊天记录</p>
            <p className="text-xs text-obsidian-text-muted mt-1">
              开始新对话后会自动保存
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`
                  group rounded-lg p-3 transition-colors cursor-pointer
                  ${
                    currentSessionId === session.id
                      ? 'bg-obsidian-accent/10 border border-obsidian-accent/30'
                      : 'hover:bg-obsidian-bg/50 border border-transparent'
                  }
                `}
                onClick={() => onSessionSelect(session.id)}
              >
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="h-6 text-xs flex-1 bg-obsidian-surface border-obsidian-border"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={handleSaveEdit}
                    >
                      <Check className="w-3 h-3 text-green-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium text-obsidian-text line-clamp-2 flex-1">
                        {session.title}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(session);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionExport(session.id, 'json');
                          }}
                        >
                          <FileJson className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionExport(session.id, 'markdown');
                          }}
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-red-500 hover:text-red-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-obsidian-surface border-obsidian-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-obsidian-text">
                                删除会话
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-obsidian-text-muted">
                                确定要删除会话"{session.title}"吗？此操作无法撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-obsidian-border text-obsidian-text">
                                取消
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onSessionDelete(session.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-obsidian-text-muted">
                      <span>{session.messages.length} 条消息</span>
                      <span>{formatDate(session.updatedAt)}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

