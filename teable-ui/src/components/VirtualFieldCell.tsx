import { Loader2, AlertCircle, Sparkles, Calculator, Eye, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

/**
 * 虚拟字段单元格渲染器
 * 显示虚拟字段的计算结果和状态
 */

export interface VirtualFieldCellProps {
  value: any
  fieldType: 'formula' | 'lookup' | 'rollup' | 'ai' | 'virtual_formula' | 'virtual_lookup' | 'virtual_rollup' | 'virtual_ai'
  isPending?: boolean
  hasError?: boolean
  errorMessage?: string
  className?: string
  // 新增：虚拟字段元数据
  metadata?: {
    sourceFieldType?: string
    isMultiple?: boolean
    aggregationFunction?: string
  }
}

export default function VirtualFieldCell({
  value,
  fieldType,
  isPending,
  hasError,
  errorMessage,
  className = '',
  metadata,
}: VirtualFieldCellProps) {
  // 标准化字段类型（处理 virtual_ 前缀）
  const normalizedFieldType = fieldType.replace('virtual_', '') as 'formula' | 'lookup' | 'rollup' | 'ai'
  
  // 字段类型图标和颜色
  const fieldIcons = {
    formula: { icon: Calculator, color: 'text-green-500' },
    lookup: { icon: Eye, color: 'text-blue-500' },
    rollup: { icon: TrendingUp, color: 'text-orange-500' },
    ai: { icon: Sparkles, color: 'text-purple-500' },
  }

  const { icon: FieldIcon, color } = fieldIcons[normalizedFieldType] || fieldIcons.formula

  // 格式化显示值（增强版，支持虚拟字段的特殊格式）
  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return ''
    
    // 如果是数组，根据元数据决定如何显示
    if (Array.isArray(val)) {
      if (metadata?.isMultiple) {
        // 多值字段，显示为逗号分隔
        return val.map(v => formatSingleValue(v)).join(', ')
      }
      // 单值数组，取第一个元素
      return val.length > 0 ? formatSingleValue(val[0]) : ''
    }
    
    return formatSingleValue(val)
  }

  // 格式化单个值
  const formatSingleValue = (val: any): string => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'object') {
      // 链接字段值格式：{ id, title }
      if ('title' in val) return val.title || val.id || ''
      return JSON.stringify(val)
    }
    if (typeof val === 'number') {
      // 根据聚合函数格式化数字
      if (metadata?.aggregationFunction === 'count' || metadata?.aggregationFunction === 'countall') {
        return Math.floor(val).toString()
      }
      // 默认保留2位小数
      return Number.isInteger(val) ? val.toString() : val.toFixed(2)
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
  fieldType: 'formula' | 'lookup' | 'rollup' | 'ai' | 'virtual_formula' | 'virtual_lookup' | 'virtual_rollup' | 'virtual_ai'
  isPending?: boolean
  hasError?: boolean
}

export function VirtualFieldBadge({ fieldType, isPending, hasError }: VirtualFieldBadgeProps) {
  // 标准化字段类型（处理 virtual_ 前缀）
  const normalizedFieldType = fieldType.replace('virtual_', '') as 'formula' | 'lookup' | 'rollup' | 'ai'
  
  const fieldIcons = {
    formula: { icon: Calculator, color: 'bg-green-100 text-green-700', label: 'Formula' },
    lookup: { icon: Eye, color: 'bg-blue-100 text-blue-700', label: 'Lookup' },
    rollup: { icon: TrendingUp, color: 'bg-orange-100 text-orange-700', label: 'Rollup' },
    ai: { icon: Sparkles, color: 'bg-purple-100 text-purple-700', label: 'AI' },
  }

  const { icon: FieldIcon, color, label } = fieldIcons[normalizedFieldType] || fieldIcons.formula

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

