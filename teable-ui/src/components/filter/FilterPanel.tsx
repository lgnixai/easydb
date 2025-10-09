/**
 * Filter Panel - 过滤器面板
 * 
 * 支持：
 * - 添加/删除过滤条件
 * - 切换 AND/OR 连接符
 * - 导入导出过滤配置
 */

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FilterCondition } from './FilterCondition'
import type { IFilter, IFilterItem } from '@/lib/filter/types'
import { FilterConjunction, FilterOperator } from '@/lib/filter/types'
import { createFilterItem, createEmptyFilter } from '@/lib/filter/utils'

export interface FilterPanelProps {
  filter: IFilter | null
  fields: Array<{ id: string, name: string, type: string }>
  onChange: (filter: IFilter | null) => void
  onClose?: () => void
}

export function FilterPanel({ filter, fields, onChange, onClose }: FilterPanelProps) {
  const [localFilter, setLocalFilter] = useState<IFilter>(
    filter || createEmptyFilter()
  )

  const handleConjunctionChange = (value: string) => {
    const newFilter = {
      ...localFilter,
      conjunction: value as FilterConjunction
    }
    setLocalFilter(newFilter)
    onChange(newFilter)
  }

  const handleAddCondition = () => {
    const firstField = fields[0]
    if (!firstField) return

    const newItem = createFilterItem(
      firstField.id,
      FilterOperator.Is,
      null
    )

    const newFilter = {
      ...localFilter,
      filterSet: [...localFilter.filterSet, newItem]
    }
    setLocalFilter(newFilter)
    onChange(newFilter)
  }

  const handleUpdateCondition = (index: number, item: IFilterItem) => {
    const newFilterSet = [...localFilter.filterSet]
    newFilterSet[index] = item

    const newFilter = {
      ...localFilter,
      filterSet: newFilterSet
    }
    setLocalFilter(newFilter)
    onChange(newFilter)
  }

  const handleDeleteCondition = (index: number) => {
    const newFilterSet = localFilter.filterSet.filter((_, i) => i !== index)
    
    if (newFilterSet.length === 0) {
      // 如果没有条件了，清空过滤器
      onChange(null)
      onClose?.()
    } else {
      const newFilter = {
        ...localFilter,
        filterSet: newFilterSet
      }
      setLocalFilter(newFilter)
      onChange(newFilter)
    }
  }

  const handleClearAll = () => {
    onChange(null)
    onClose?.()
  }

  return (
    <Card className="w-full max-w-2xl p-4 space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">过滤条件</span>
          {localFilter.filterSet.length > 1 && (
            <Select 
              value={localFilter.conjunction} 
              onValueChange={handleConjunctionChange}
            >
              <SelectTrigger className="w-[100px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FilterConjunction.And}>并且 (AND)</SelectItem>
                <SelectItem value={FilterConjunction.Or}>或者 (OR)</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearAll}
            disabled={localFilter.filterSet.length === 0}
          >
            清空
          </Button>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 过滤条件列表 */}
      <div className="space-y-2">
        {localFilter.filterSet.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            暂无过滤条件，点击下方按钮添加
          </div>
        ) : (
          localFilter.filterSet.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              {index > 0 && (
                <div className="text-xs text-muted-foreground mt-2 w-12 text-center">
                  {localFilter.conjunction === FilterConjunction.And ? 'AND' : 'OR'}
                </div>
              )}
              <div className="flex-1">
                <FilterCondition
                  item={item}
                  fields={fields}
                  onChange={(newItem) => handleUpdateCondition(index, newItem)}
                  onDelete={() => handleDeleteCondition(index)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加条件按钮 */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddCondition}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        添加条件
      </Button>

      {/* 说明文本 */}
      {localFilter.filterSet.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {localFilter.filterSet.length} 个过滤条件
          {localFilter.filterSet.length > 1 && (
            <span>
              {' '}({localFilter.conjunction === FilterConjunction.And ? '全部满足' : '任一满足'})
            </span>
          )}
        </div>
      )}
    </Card>
  )
}

