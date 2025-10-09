/**
 * FilterButton - 过滤按钮
 * 
 * 工具栏上的过滤按钮，点击打开过滤器面板
 */

import { useState } from 'react'
import { Filter as FilterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { IFilter } from '@/types/filter'
import { FilterBuilder } from './FilterBuilder'

export interface FilterButtonProps {
  /** 当前过滤器 */
  filter: IFilter
  
  /** 可用字段 */
  fields: Array<{
    id: string
    name: string
    type: string
    options?: any
  }>
  
  /** 过滤器变化回调 */
  onChange: (filter: IFilter) => void
  
  /** 是否禁用 */
  disabled?: boolean
}

export function FilterButton({ filter, fields, onChange, disabled }: FilterButtonProps) {
  const [open, setOpen] = useState(false)
  
  // 检查是否有激活的过滤条件
  const isActive = filter && filter.filterSet && filter.filterSet.length > 0
  
  // 统计过滤条件数
  const filterCount = filter?.filterSet?.length || 0
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className="gap-2"
        >
          <FilterIcon className="h-4 w-4" />
          <span className="hidden sm:inline">过滤</span>
          {filterCount > 0 && (
            <span className="ml-1 rounded-full bg-primary-foreground px-1.5 py-0.5 text-xs text-primary">
              {filterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent
        className="w-[600px] p-0"
        align="start"
        side="bottom"
      >
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm">过滤记录</h3>
          <p className="text-xs text-muted-foreground mt-1">
            添加过滤条件来筛选符合条件的记录
          </p>
        </div>
        
        <div className="p-3">
          <FilterBuilder
            value={filter}
            fields={fields}
            onChange={onChange}
          />
        </div>
        
        {isActive && (
          <div className="p-3 border-t flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(null)}
            >
              清除过滤
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
            >
              完成
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

