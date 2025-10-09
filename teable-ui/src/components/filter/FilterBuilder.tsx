/**
 * FilterBuilder - 过滤器构建器
 * 
 * 主要组件，管理整个过滤器的构建和编辑
 */

import { useState, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { IFilter, IFilterSet, IFilterItem, Conjunction } from '@/types/filter'
import { createEmptyFilter, createEmptyFilterItem, isFilterItem } from '@/types/filter'
import { FilterCondition } from './FilterCondition'

export interface FilterBuilderProps {
  /** 当前过滤器 */
  value: IFilter
  
  /** 可用字段列表 */
  fields: Array<{
    id: string
    name: string
    type: string
  }>
  
  /** 过滤器变化回调 */
  onChange: (filter: IFilter) => void
  
  /** 类名 */
  className?: string
}

export function FilterBuilder({ value, fields, onChange, className }: FilterBuilderProps) {
  // 如果没有过滤器，创建一个空的
  const filter = value || createEmptyFilter()
  
  // 添加过滤条件
  const handleAddCondition = useCallback(() => {
    if (!fields || fields.length === 0) return
    
    const firstField = fields[0]
    const newItem = createEmptyFilterItem(firstField.id, firstField.type)
    
    const newFilter: IFilterSet = {
      ...filter,
      filterSet: [...filter.filterSet, newItem]
    }
    
    onChange(newFilter)
  }, [filter, fields, onChange])
  
  // 删除过滤条件
  const handleRemoveCondition = useCallback((index: number) => {
    const newFilter: IFilterSet = {
      ...filter,
      filterSet: filter.filterSet.filter((_, i) => i !== index)
    }
    
    onChange(newFilter.filterSet.length > 0 ? newFilter : null)
  }, [filter, onChange])
  
  // 更新过滤条件
  const handleUpdateCondition = useCallback((index: number, newItem: IFilterItem) => {
    const newFilter: IFilterSet = {
      ...filter,
      filterSet: filter.filterSet.map((item, i) => i === index ? newItem : item)
    }
    
    onChange(newFilter)
  }, [filter, onChange])
  
  // 切换逻辑连接符
  const handleConjunctionChange = useCallback((conjunction: Conjunction) => {
    const newFilter: IFilterSet = {
      ...filter,
      conjunction
    }
    
    onChange(newFilter)
  }, [filter, onChange])
  
  // 没有字段时显示提示
  if (!fields || fields.length === 0) {
    return (
      <Card className={className}>
        <div className="p-4 text-center text-muted-foreground">
          没有可用的字段
        </div>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <div className="p-4 space-y-3">
        {/* 头部：逻辑连接符选择 */}
        {filter.filterSet.length > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">显示满足</span>
            <Select value={filter.conjunction} onValueChange={handleConjunctionChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">全部</SelectItem>
                <SelectItem value="or">任一</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">条件的记录</span>
          </div>
        )}
        
        {/* 过滤条件列表 */}
        <div className="space-y-2">
          {filter.filterSet.map((item, index) => {
            if (!isFilterItem(item)) return null // 暂不支持嵌套
            
            return (
              <div key={index} className="flex items-start gap-2">
                {/* 条件编号 */}
                {filter.filterSet.length > 1 && (
                  <div className="flex-shrink-0 w-8 h-9 flex items-center justify-center text-xs text-muted-foreground">
                    {index + 1}
                  </div>
                )}
                
                {/* 过滤条件 */}
                <div className="flex-1">
                  <FilterCondition
                    value={item}
                    fields={fields}
                    onChange={(newItem) => handleUpdateCondition(index, newItem)}
                  />
                </div>
                
                {/* 删除按钮 */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={() => handleRemoveCondition(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
        
        {/* 添加条件按钮 */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCondition}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加条件
        </Button>
        
        {/* 空状态提示 */}
        {filter.filterSet.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            点击上方按钮添加过滤条件
          </div>
        )}
      </div>
    </Card>
  )
}

