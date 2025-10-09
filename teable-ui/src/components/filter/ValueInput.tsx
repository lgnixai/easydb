/**
 * Value Input - 值输入组件
 * 
 * 根据字段类型和操作符渲染不同的输入组件：
 * - 文本: Input
 * - 数字: Number Input  
 * - 单选: Select
 * - 多选: Multiple Select
 * - 日期: Date Picker
 * - 布尔: Checkbox
 */

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FilterOperator } from '@/lib/filter/types'

export interface ValueInputProps {
  value: any
  field: { id: string, name: string, type: string, options?: any }
  operator: FilterOperator
  onChange: (value: any) => void
}

export function ValueInput({ value, field, operator, onChange }: ValueInputProps) {
  // 文本类型
  if (field.type === 'text') {
    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入值..."
        className="h-8"
      />
    )
  }

  // 数字类型
  if (field.type === 'number' || field.type === 'rating') {
    return (
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder="输入数字..."
        className="h-8"
      />
    )
  }

  // 单选类型
  if (field.type === 'singleSelect') {
    const options = field.options?.choices || []
    
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="选择选项..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: any) => (
            <SelectItem key={option.id || option.name} value={option.name}>
              <div className="flex items-center gap-2">
                {option.color && (
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span>{option.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // 多选类型（简化版，使用逗号分隔）
  if (field.type === 'multipleSelect') {
    const options = field.options?.choices || []
    
    // 简化处理：使用文本输入，用逗号分隔多个值
    return (
      <Input
        type="text"
        value={Array.isArray(value) ? value.join(', ') : (value || '')}
        onChange={(e) => {
          const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
          onChange(values)
        }}
        placeholder="输入选项，用逗号分隔..."
        className="h-8"
      />
    )
  }

  // 日期类型（简化版）
  if (field.type === 'date') {
    return (
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-8"
      />
    )
  }

  // 布尔类型
  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center gap-2 h-8">
        <Checkbox
          checked={!!value}
          onCheckedChange={onChange}
        />
        <span className="text-sm">{value ? '选中' : '未选中'}</span>
      </div>
    )
  }

  // 默认文本输入
  return (
    <Input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="输入值..."
      className="h-8"
    />
  )
}

