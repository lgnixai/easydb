/**
 * Sort Panel - 排序面板
 * 
 * 支持：
 * - 添加/删除排序条件
 * - 拖拽调整排序优先级
 * - 切换升序/降序
 */

import { useState } from 'react'
import { Plus, X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ISort, ISortItem, SortOrder } from '@/lib/sort/types'
import { SORT_ORDER_LABELS } from '@/lib/sort/types'
import { createSortItem, createEmptySort } from '@/lib/sort/utils'

export interface SortPanelProps {
  sort: ISort | null
  fields: Array<{ id: string, name: string, type: string }>
  onChange: (sort: ISort | null) => void
  onClose?: () => void
}

export function SortPanel({ sort, fields, onChange, onClose }: SortPanelProps) {
  const [localSort, setLocalSort] = useState<ISort>(
    sort || createEmptySort()
  )

  const handleAddSort = () => {
    // 找到第一个未排序的字段
    const usedFieldIds = new Set(localSort.sorts.map(s => s.fieldId))
    const availableField = fields.find(f => !usedFieldIds.has(f.id))
    
    if (!availableField) return

    const newItem = createSortItem(availableField.id, 'asc')

    const newSort = {
      ...localSort,
      sorts: [...localSort.sorts, newItem]
    }
    setLocalSort(newSort)
    onChange(newSort)
  }

  const handleUpdateSort = (index: number, item: ISortItem) => {
    const newSorts = [...localSort.sorts]
    newSorts[index] = item

    const newSort = {
      ...localSort,
      sorts: newSorts
    }
    setLocalSort(newSort)
    onChange(newSort)
  }

  const handleDeleteSort = (index: number) => {
    const newSorts = localSort.sorts.filter((_, i) => i !== index)
    
    if (newSorts.length === 0) {
      onChange(null)
      onClose?.()
    } else {
      const newSort = {
        ...localSort,
        sorts: newSorts
      }
      setLocalSort(newSort)
      onChange(newSort)
    }
  }

  const handleMoveSort = (index: number, direction: 'up' | 'down') => {
    const newSorts = [...localSort.sorts]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newSorts.length) return

    // 交换位置
    [newSorts[index], newSorts[targetIndex]] = [newSorts[targetIndex], newSorts[index]]

    const newSort = {
      ...localSort,
      sorts: newSorts
    }
    setLocalSort(newSort)
    onChange(newSort)
  }

  const handleClearAll = () => {
    onChange(null)
    onClose?.()
  }

  const handleFieldChange = (index: number, fieldId: string) => {
    const newItem = createSortItem(fieldId, localSort.sorts[index].order)
    handleUpdateSort(index, newItem)
  }

  const handleOrderChange = (index: number, order: string) => {
    const newItem = {
      ...localSort.sorts[index],
      order: order as SortOrder
    }
    handleUpdateSort(index, newItem)
  }

  // 可用字段（排除已选择的）
  const getAvailableFields = (currentFieldId: string) => {
    const usedFieldIds = new Set(localSort.sorts.map(s => s.fieldId))
    usedFieldIds.delete(currentFieldId)  // 当前字段可选
    return fields.filter(f => !usedFieldIds.has(f.id))
  }

  return (
    <Card className="w-full max-w-2xl p-4 space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">排序条件</span>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearAll}
            disabled={localSort.sorts.length === 0}
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

      {/* 排序条件列表 */}
      <div className="space-y-2">
        {localSort.sorts.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            暂无排序条件，点击下方按钮添加
          </div>
        ) : (
          localSort.sorts.map((item, index) => {
            const field = fields.find(f => f.id === item.fieldId)
            const availableFields = getAvailableFields(item.fieldId)

            return (
              <div key={index} className="flex items-center gap-2 p-2 rounded-md border bg-background">
                {/* 优先级指示 */}
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSort(index, 'up')}
                    disabled={index === 0}
                    className="h-4 w-4 p-0"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground text-center">{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSort(index, 'down')}
                    disabled={index === localSort.sorts.length - 1}
                    className="h-4 w-4 p-0"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                {/* 拖拽手柄 */}
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />

                {/* 字段选择 */}
                <Select value={item.fieldId} onValueChange={(value) => handleFieldChange(index, value)}>
                  <SelectTrigger className="flex-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 排序方向 */}
                <Select value={item.order} onValueChange={(value) => handleOrderChange(index, value)}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">{SORT_ORDER_LABELS.asc}</SelectItem>
                    <SelectItem value="desc">{SORT_ORDER_LABELS.desc}</SelectItem>
                  </SelectContent>
                </Select>

                {/* 删除按钮 */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteSort(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })
        )}
      </div>

      {/* 添加排序按钮 */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddSort}
        className="w-full"
        disabled={localSort.sorts.length >= fields.length}
      >
        <Plus className="h-4 w-4 mr-2" />
        添加排序
      </Button>

      {/* 说明文本 */}
      {localSort.sorts.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {localSort.sorts.length} 个排序条件（数字越小优先级越高）
        </div>
      )}
    </Card>
  )
}

