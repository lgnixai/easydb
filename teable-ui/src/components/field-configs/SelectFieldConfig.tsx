import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Plus, Trash2, Palette, Type } from 'lucide-react'

/**
 * 单选/多选字段配置组件
 * 用于配置选项列表、颜色等
 */

export interface SelectOption {
  id: string
  name: string
  color?: string
}

export interface SelectFieldConfigValue {
  options: SelectOption[]
  allowOther?: boolean
  allowMultiple?: boolean // 仅用于多选字段
}

interface SelectFieldConfigProps {
  value?: SelectFieldConfigValue
  onChange: (value: SelectFieldConfigValue) => void
  fieldType: 'singleSelect' | 'multipleSelect'
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
]

export default function SelectFieldConfig({
  value,
  onChange,
  fieldType,
}: SelectFieldConfigProps) {
  const [config, setConfig] = useState<SelectFieldConfigValue>(
    value || {
      options: [
        { id: '1', name: '选项1', color: defaultColors[0] },
        { id: '2', name: '选项2', color: defaultColors[1] },
      ],
      allowOther: false,
      allowMultiple: fieldType === 'multipleSelect',
    }
  )

  const handleChange = (updates: Partial<SelectFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const addOption = () => {
    const newId = Date.now().toString()
    const newColor = defaultColors[config.options.length % defaultColors.length]
    const newConfig = {
      ...config,
      options: [...config.options, { id: newId, name: `选项${config.options.length + 1}`, color: newColor }]
    }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const updateOption = (optionId: string, updates: Partial<SelectOption>) => {
    const newConfig = {
      ...config,
      options: config.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const removeOption = (optionId: string) => {
    if (config.options.length <= 1) return // 至少保留一个选项
    
    const newConfig = {
      ...config,
      options: config.options.filter(opt => opt.id !== optionId)
    }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const isMultiple = fieldType === 'multipleSelect'

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5 text-blue-500" />
          {isMultiple ? '多选' : '单选'}字段配置
        </CardTitle>
        <CardDescription>
          {isMultiple ? '配置多选选项列表' : '配置单选选项列表'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 选项列表 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>选项列表</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              添加选项
            </Button>
          </div>

          <div className="space-y-2">
            {config.options.map((option, index) => (
              <div
                key={option.id}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {/* 颜色选择器 */}
                <div className="relative">
                  <input
                    type="color"
                    value={option.color || defaultColors[0]}
                    onChange={(e) => updateOption(option.id, { color: e.target.value })}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>

                {/* 选项名称输入 */}
                <Input
                  value={option.name}
                  onChange={(e) => updateOption(option.id, { name: e.target.value })}
                  placeholder={`选项${index + 1}`}
                  className="flex-1"
                />

                {/* 预览标签 */}
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: option.color + '20', color: option.color }}
                  className="min-w-[80px] justify-center"
                >
                  {option.name}
                </Badge>

                {/* 删除按钮 */}
                {config.options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 其他选项 */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowOther"
              checked={config.allowOther}
              onChange={(e) => handleChange({ allowOther: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="allowOther" className="font-normal cursor-pointer">
              允许用户添加自定义选项
            </Label>
          </div>

          {isMultiple && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={config.allowMultiple}
                onChange={(e) => handleChange({ allowMultiple: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="allowMultiple" className="font-normal cursor-pointer">
                允许多选
              </Label>
            </div>
          )}
        </div>

        {/* 配置预览 */}
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">预览：</p>
          <div className="flex flex-wrap gap-2">
            {config.options.map((option) => (
              <Badge
                key={option.id}
                variant="secondary"
                style={{ backgroundColor: option.color + '20', color: option.color }}
              >
                {option.name}
              </Badge>
            ))}
            {config.allowOther && (
              <Badge variant="outline" className="border-dashed">
                + 其他
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isMultiple ? '用户可以选择多个选项' : '用户只能选择一个选项'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
