import { ActionResult } from './types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  action: ActionResult;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ActionCard = ({ action, onConfirm, onCancel }: ActionCardProps) => {
  const getIcon = () => {
    switch (action.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'confirmation':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (action.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'pending':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'confirmation':
        return 'bg-yellow-500/10 border-yellow-500/30';
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-3 max-w-[85%]',
        getBackgroundColor()
      )}
    >
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1 space-y-2">
          {/* 参数展示 */}
          {Object.keys(action.params).length > 0 && (
            <div className="space-y-1">
              {Object.entries(action.params).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-obsidian-text-muted">{key}: </span>
                  <span className="text-obsidian-text font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 结果展示 */}
          {action.result && action.type === 'success' && (
            <div className="text-xs text-obsidian-text-muted">
              <pre className="bg-obsidian-bg/50 rounded p-2 overflow-x-auto">
                {JSON.stringify(action.result, null, 2)}
              </pre>
            </div>
          )}

          {/* 错误信息 */}
          {action.error && action.type === 'error' && (
            <div className="text-xs text-red-400">
              {action.error}
            </div>
          )}

          {/* 确认按钮 */}
          {action.type === 'confirmation' && onConfirm && onCancel && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={onConfirm}
                className="bg-obsidian-accent hover:bg-obsidian-accent/90"
              >
                确认
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="border-obsidian-border"
              >
                取消
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

