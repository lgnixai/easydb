/**
 * Field Editor Factory - 字段编辑器工厂
 * 
 * 根据字段类型渲染对应的编辑器
 */

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FieldEditorFactoryProps {
  field: { id: string, name: string, type: string, options?: any }
  value: any
  onChange: (value: any) => void
}

export function FieldEditorFactory({ field, value, onChange }: FieldEditorFactoryProps) {
  // 文本类型
  if (field.type === 'text') {
    // 如果值很长，使用 Textarea
    const isLongText = value && String(value).length > 100
    
    if (isLongText) {
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`输入 ${field.name}...`}
          rows={5}
        />
      )
    }
    
    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`输入 ${field.name}...`}
      />
    )
  }

  // 数字类型
  if (field.type === 'number') {
    return (
      <Input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder={`输入 ${field.name}...`}
      />
    )
  }

  // 单选类型
  if (field.type === 'singleSelect') {
    const options = field.options?.choices || []
    
    return (
      <Select 
        value={value || ''} 
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={`选择 ${field.name}...`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">
            <span className="text-muted-foreground">（清空）</span>
          </SelectItem>
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

  // 多选类型（简化版）
  if (field.type === 'multipleSelect') {
    const options = field.options?.choices || []
    const selectedValues = Array.isArray(value) ? value : []

    return (
      <div className="space-y-2">
        {options.map((option: any) => {
          const isSelected = selectedValues.includes(option.name)
          
          return (
            <div key={option.id || option.name} className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedValues, option.name])
                  } else {
                    onChange(selectedValues.filter(v => v !== option.name))
                  }
                }}
              />
              <div className="flex items-center gap-2">
                {option.color && (
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="text-sm">{option.name}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // 日期类型
  if (field.type === 'date') {
    // 转换日期格式为 YYYY-MM-DD
    const dateValue = value ? new Date(value).toISOString().split('T')[0] : ''
    
    return (
      <Input
        type="date"
        value={dateValue}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
      />
    )
  }

  // 布尔类型
  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          checked={!!value}
          onCheckedChange={onChange}
        />
        <span className="text-sm text-muted-foreground">
          {value ? '已选中' : '未选中'}
        </span>
      </div>
    )
  }

  // 评分类型
  if (field.type === 'rating') {
    const max = field.options?.max || 5
    const currentRating = value || 0

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`text-2xl ${i < currentRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300`}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentRating} / {max}
        </span>
      </div>
    )
  }

  // 默认文本输入
  return (
    <Input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`输入 ${field.name}...`}
    />
  )
}

