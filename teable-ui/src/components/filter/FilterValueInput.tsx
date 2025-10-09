/**
 * FilterValueInput - 过滤值输入
 * 
 * 根据字段类型和操作符显示不同的输入组件
 */

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FilterOperator, FilterValue } from '@/types/filter'
import { operatorNeedsMultipleValues } from '@/types/filter'

export interface FilterValueInputProps {
  /** 字段信息 */
  field: {
    id: string
    name: string
    type: string
    options?: {
      choices?: Array<{
        name: string
        color?: string
      }>
      max?: number
    }
  }
  
  /** 操作符 */
  operator: FilterOperator
  
  /** 当前值 */
  value: FilterValue
  
  /** 值变化回调 */
  onChange: (value: FilterValue) => void
}

export function FilterValueInput({ field, operator, value, onChange }: FilterValueInputProps) {
  const needsMultiple = operatorNeedsMultipleValues(operator)
  
  // 根据字段类型渲染不同的输入组件
  switch (field.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入文本..."
        />
      )
    
    case 'number':
      return (
        <Input
          type="number"
          value={(value as number) || ''}
          onChange={(e) => onChange(e.target.valueAsNumber || null)}
          placeholder="输入数字..."
        />
      )
    
    case 'checkbox':
      return (
        <div className="flex items-center h-9 px-3">
          <Checkbox
            checked={value as boolean}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <span className="ml-2 text-sm">{value ? '已选中' : '未选中'}</span>
        </div>
      )
    
    case 'singleSelect':
    case 'multipleSelect': {
      const choices = field.options?.choices || []
      
      // 多选模式
      if (needsMultiple) {
        return (
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(choice.name)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (checked) {
                      onChange([...currentValues, choice.name])
                    } else {
                      onChange(currentValues.filter(v => v !== choice.name))
                    }
                  }}
                />
                <span className="ml-2 text-sm">{choice.name}</span>
              </div>
            ))}
          </div>
        )
      }
      
      // 单选模式
      return (
        <Select value={value as string || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="选择选项..." />
          </SelectTrigger>
          <SelectContent>
            {choices.map((choice, index) => (
              <SelectItem key={index} value={choice.name}>
                {choice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
    
    case 'rating': {
      const max = field.options?.max || 5
      return (
        <Input
          type="number"
          min={0}
          max={max}
          value={(value as number) || ''}
          onChange={(e) => onChange(e.target.valueAsNumber || null)}
          placeholder={`0-${max}`}
        />
      )
    }
    
    case 'date':
      return (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    
    default:
      return (
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入值..."
        />
      )
  }
}

