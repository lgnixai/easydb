import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useAIChatWithMCP } from './hooks/useAIChatWithMCP';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Trash2, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface AISidebarWithMCPProps {
  mcpServerUrl?: string;
  spaceId?: string;
  baseId?: string;
  tableId?: string;
  onActionComplete?: () => void;
}

/**
 * 使用标准 MCP 协议的 AI 侧边栏组件
 * 
 * 特性：
 * - 通过标准 MCP 协议与后端通信
 * - 支持 HTTP、SSE、WebSocket 传输
 * - 显示 MCP 连接状态
 * - 显示可用工具列表
 */
export const AISidebarWithMCP = ({
  mcpServerUrl = 'http://localhost:3001',
  spaceId,
  baseId,
  tableId,
  onActionComplete,
}: AISidebarWithMCPProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    error,
    mcpConnected,
    availableTools,
    sendMessage,
    clearMessages,
    refreshTools,
    connectMCP,
    disconnectMCP,
  } = useAIChatWithMCP({
    mcpServerUrl,
    spaceId,
    baseId,
    tableId,
    onActionComplete,
  });

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <div className="h-full bg-obsidian-surface border-l border-obsidian-border flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-obsidian-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-obsidian-accent" />
            <h2 className="text-sm font-medium text-obsidian-text">AI 助手 (MCP)</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-obsidian-text-muted hover:text-obsidian-text"
              title="刷新工具列表"
              onClick={refreshTools}
            >
              <RefreshCw className="w-4 h-4" />
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

        {/* MCP 连接状态 */}
        <div className="flex items-center gap-2">
          {mcpConnected ? (
            <Badge variant="outline" className="text-green-500 border-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              MCP 已连接
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-500 border-red-500">
              <WifiOff className="w-3 h-3 mr-1" />
              MCP 未连接
            </Badge>
          )}
          <span className="text-xs text-obsidian-text-muted">
            {availableTools.length} 个工具可用
          </span>
        </div>
      </div>

      {/* 上下文信息 */}
      <div className="px-4 py-2 bg-obsidian-bg/50 border-b border-obsidian-border">
        <div className="text-xs text-obsidian-text-muted space-y-1">
          <div>MCP 服务器: {mcpServerUrl}</div>
          <div>空间: {spaceId ? `${spaceId.slice(0, 8)}...` : '未选择'}</div>
          <div>数据库: {baseId ? `${baseId.slice(0, 8)}...` : '未选择'}</div>
          <div>表格: {tableId ? `${tableId.slice(0, 8)}...` : '未选择'}</div>
        </div>
      </div>

      {/* 可用工具列表 */}
      {availableTools.length > 0 && (
        <details className="px-4 py-2 border-b border-obsidian-border">
          <summary className="text-xs font-medium text-obsidian-text cursor-pointer">
            可用 MCP 工具 ({availableTools.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {availableTools.map((tool) => (
              <div key={tool.name} className="text-xs text-obsidian-text-muted">
                <span className="font-mono text-obsidian-accent">{tool.name}</span>
                <p className="ml-2 text-obsidian-text-muted/70">{tool.description}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 消息区域 */}
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Bot className="w-16 h-16 text-obsidian-text-muted mb-4" />
            <h3 className="text-sm font-medium text-obsidian-text mb-2">
              欢迎使用 MCP AI 助手
            </h3>
            <p className="text-xs text-obsidian-text-muted mb-4">
              我使用标准 MCP 协议与后端通信
            </p>
            <div className="space-y-2 text-xs text-obsidian-text-muted text-left">
              <p>💡 示例命令：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>"创建一个员工空间"</li>
                <li>"在当前数据库创建一个表格"</li>
                <li>"添加姓名和邮箱字段"</li>
                <li>"列出所有可用工具"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
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
        disabled={!mcpConnected}
        loading={loading}
        placeholder={
          mcpConnected
            ? '输入你的需求，例如："创建一个空间"'
            : 'MCP 服务器未连接，请检查配置...'
        }
      />
    </div>
  );
};

