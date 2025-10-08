import { Loader2, AlertCircle, Sparkles, Calculator, Eye, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

/**
 * 虚拟字段单元格渲染器
 * 显示虚拟字段的计算结果和状态
 */

export interface VirtualFieldCellProps {
  value: any
  fieldType: 'formula' | 'lookup' | 'rollup' | 'ai'
  isPending?: boolean
  hasError?: boolean
  errorMessage?: string
  className?: string
}

export default function VirtualFieldCell({
  value,
  fieldType,
  isPending,
  hasError,
  errorMessage,
  className = '',
}: VirtualFieldCellProps) {
  // 字段类型图标和颜色
  const fieldIcons = {
    formula: { icon: Calculator, color: 'text-green-500' },
    lookup: { icon: Eye, color: 'text-blue-500' },
    rollup: { icon: TrendingUp, color: 'text-orange-500' },
    ai: { icon: Sparkles, color: 'text-purple-500' },
  }

  const { icon: FieldIcon, color } = fieldIcons[fieldType] || fieldIcons.formula

  // 格式化显示值
  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object') {
      if (Array.isArray(val)) return val.join(', ')
      return JSON.stringify(val)
    }
    return String(val)
  }

  return (
    <div className={`flex items-center gap-2 w-full h-full ${className}`}>
      {/* 字段类型图标 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <FieldIcon className={`h-3 w-3 flex-shrink-0 ${color}`} />
          </TooltipTrigger>
          <TooltipContent>
            <p className="capitalize">{fieldType} 字段</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 状态指示器 */}
      {isPending && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p>计算中...</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {hasError && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">计算错误</p>
              {errorMessage && <p className="text-xs mt-1">{errorMessage}</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* 值显示 */}
      <span
        className={`flex-1 truncate ${
          isPending ? 'text-muted-foreground italic' : ''
        } ${hasError ? 'text-destructive' : ''}`}
      >
        {isPending ? '计算中...' : hasError ? '错误' : formatValue(value)}
      </span>
    </div>
  )
}

/**
 * 虚拟字段状态标签
 * 用于在字段标题等位置显示虚拟字段状态
 */

export interface VirtualFieldBadgeProps {
  fieldType: 'formula' | 'lookup' | 'rollup' | 'ai'
  isPending?: boolean
  hasError?: boolean
}

export function VirtualFieldBadge({ fieldType, isPending, hasError }: VirtualFieldBadgeProps) {
  const fieldIcons = {
    formula: { icon: Calculator, color: 'bg-green-100 text-green-700', label: 'Formula' },
    lookup: { icon: Eye, color: 'bg-blue-100 text-blue-700', label: 'Lookup' },
    rollup: { icon: TrendingUp, color: 'bg-orange-100 text-orange-700', label: 'Rollup' },
    ai: { icon: Sparkles, color: 'bg-purple-100 text-purple-700', label: 'AI' },
  }

  const { icon: FieldIcon, color, label } = fieldIcons[fieldType] || fieldIcons.formula

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      <FieldIcon className="h-3 w-3" />
      <span>{label}</span>
      {isPending && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
      {hasError && <AlertCircle className="h-3 w-3 text-red-600 ml-1" />}
    </div>
  )
}

