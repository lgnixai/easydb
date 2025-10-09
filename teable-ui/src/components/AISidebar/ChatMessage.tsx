import { Message } from './types';
import { ActionCard } from './ActionCard';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  onConfirm?: () => void;
  onCancel?: () => void;
  showTimestamp?: boolean;
}

export const ChatMessage = ({
  message,
  onConfirm,
  onCancel,
  showTimestamp = true,
}: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 py-3 px-4', isUser && 'flex-row-reverse')}>
      {/* 头像 */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-obsidian-accent text-white'
            : 'bg-obsidian-surface border border-obsidian-border text-obsidian-text'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* 消息内容 */}
      <div className={cn('flex-1 space-y-2', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 max-w-[85%] break-words',
            isUser
              ? 'bg-obsidian-accent text-white'
              : 'bg-obsidian-surface border border-obsidian-border text-obsidian-text'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* 时间戳 */}
        {showTimestamp && (
          <span className="text-xs text-obsidian-text-muted">
            {message.timestamp.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}

        {/* 操作卡片 */}
        {message.action && (
          <ActionCard
            action={message.action}
            onConfirm={message.action.type === 'confirmation' ? onConfirm : undefined}
            onCancel={message.action.type === 'confirmation' ? onCancel : undefined}
          />
        )}
      </div>
    </div>
  );
};

