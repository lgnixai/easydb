/**
 * Filter Condition - 单个过滤条件
 * 
 * 包含：
 * - 字段选择器
 * - 操作符选择器
 * - 值输入器
 * - 删除按钮
 */

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { IFilterItem, FilterOperator } from '@/lib/filter/types'
import { OPERATOR_LABELS } from '@/lib/filter/types'
import { getOperatorsForFieldType, operatorNeedsValue } from '@/lib/filter/utils'
import { ValueInput } from './ValueInput'

export interface FilterConditionProps {
  item: IFilterItem
  fields: Array<{ id: string, name: string, type: string }>
  onChange: (item: IFilterItem) => void
  onDelete: () => void
}

export function FilterCondition({ item, fields, onChange, onDelete }: FilterConditionProps) {
  const currentField = fields.find(f => f.id === item.fieldId)
  const availableOperators = currentField 
    ? getOperatorsForFieldType(currentField.type)
    : []

  const handleFieldChange = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId)
    if (!field) return

    const operators = getOperatorsForFieldType(field.type)
    const newOperator = operators[0]

    onChange({
      fieldId,
      operator: newOperator,
      value: null
    })
  }

  const handleOperatorChange = (operator: string) => {
    onChange({
      ...item,
      operator: operator as FilterOperator,
      value: operatorNeedsValue(operator as FilterOperator) ? item.value : null
    })
  }

  const handleValueChange = (value: any) => {
    onChange({
      ...item,
      value
    })
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-md border bg-background">
      {/* 字段选择 */}
      <Select value={item.fieldId} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue placeholder="选择字段" />
        </SelectTrigger>
        <SelectContent>
          {fields.map(field => (
            <SelectItem key={field.id} value={field.id}>
              {field.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 操作符选择 */}
      <Select value={item.operator} onValueChange={handleOperatorChange}>
        <SelectTrigger className="w-[120px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map(op => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 值输入 */}
      {operatorNeedsValue(item.operator) && currentField && (
        <div className="flex-1">
          <ValueInput
            value={item.value}
            field={currentField}
            operator={item.operator}
            onChange={handleValueChange}
          />
        </div>
      )}

      {/* 删除按钮 */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
