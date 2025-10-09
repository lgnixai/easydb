import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  disabled = false,
  loading = false,
  placeholder = '输入消息...',
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled && !loading) {
      onSend(trimmed);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-obsidian-border bg-obsidian-surface">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="min-h-[60px] max-h-[120px] resize-none bg-obsidian-bg border-obsidian-border text-obsidian-text placeholder-obsidian-text-muted"
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || loading}
          size="icon"
          className="bg-obsidian-accent hover:bg-obsidian-accent/90 h-[60px] w-[60px]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      <div className="mt-2 text-xs text-obsidian-text-muted">
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
};

