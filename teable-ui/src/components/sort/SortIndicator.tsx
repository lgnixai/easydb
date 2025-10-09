/**
 * Sort Indicator - 排序指示器
 * 
 * 显示在列头，指示当前列的排序状态
 */

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortOrder } from '@/lib/sort/types'

export interface SortIndicatorProps {
  isSorted: boolean
  order: SortOrder | null
  index?: number  // 排序优先级（从 0 开始）
  className?: string
}

export function SortIndicator({ isSorted, order, index, className }: SortIndicatorProps) {
  if (!isSorted || !order) {
    return (
      <ArrowUpDown className={cn("h-3 w-3 opacity-0 group-hover:opacity-30", className)} />
    )
  }

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {order === 'asc' ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {typeof index === 'number' && index >= 0 && (
        <span className="text-[10px] font-medium">{index + 1}</span>
      )}
    </div>
  )
}

