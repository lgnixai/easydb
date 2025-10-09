import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

/**
 * 虚拟字段同步状态指示器
 * 
 * 显示虚拟字段的计算状态和刷新按钮
 */

export interface VirtualFieldSyncIndicatorProps {
  status: 'idle' | 'calculating' | 'cached' | 'error'
  lastUpdated?: string
  error?: string
  onRefresh?: () => void
  showRefreshButton?: boolean
  className?: string
}

export default function VirtualFieldSyncIndicator({
  status,
  lastUpdated,
  error,
  onRefresh,
  showRefreshButton = true,
  className = '',
}: VirtualFieldSyncIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'calculating':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case 'cached':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'calculating':
        return '计算中...'
      case 'cached':
        return lastUpdated ? `已缓存 (${formatTime(lastUpdated)})` : '已缓存'
      case 'error':
        return error || '计算错误'
      default:
        return '未计算'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'calculating':
        return 'text-blue-600'
      case 'cached':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className={`text-xs ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">虚拟字段状态</p>
              <p className="text-xs">状态: {getStatusText()}</p>
              {lastUpdated && (
                <p className="text-xs">更新时间: {new Date(lastUpdated).toLocaleString()}</p>
              )}
              {error && (
                <p className="text-xs text-red-500">错误: {error}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showRefreshButton && onRefresh && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={status === 'calculating'}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${status === 'calculating' ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>刷新虚拟字段</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// Helper function
function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}天前`
}

/**
 * 虚拟字段批量刷新按钮
 */

export interface VirtualFieldBatchRefreshProps {
  onRefresh: () => Promise<void>
  isRefreshing?: boolean
  count?: number
}

export function VirtualFieldBatchRefresh({
  onRefresh,
  isRefreshing = false,
  count = 0,
}: VirtualFieldBatchRefreshProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>刷新虚拟字段</span>
            {count > 0 && <span className="text-xs text-muted-foreground">({count})</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>批量刷新所有虚拟字段</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

