import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Type, Hash, Calendar } from 'lucide-react'

/**
 * 基础字段配置组件
 * 用于配置文本、长文本、复选框等基础字段类型
 */

export interface BaseFieldConfigValue {
  defaultValue?: string
  placeholder?: string
  maxLength?: number
  required?: boolean
  multiline?: boolean // 用于长文本
  rows?: number // 用于长文本的行数
  pattern?: string // 正则表达式验证
  validationMessage?: string // 验证失败提示
}

interface BaseFieldConfigProps {
  value?: BaseFieldConfigValue
  onChange: (value: BaseFieldConfigValue) => void
  fieldType: 'singleLineText' | 'longText' | 'checkbox' | 'rating'
}

const getFieldIcon = (fieldType: string) => {
  switch (fieldType) {
    case 'singleLineText':
    case 'longText':
      return Type
    case 'checkbox':
      return Checkbox
    case 'rating':
      return Hash
    default:
      return Type
  }
}

const getFieldTitle = (fieldType: string) => {
  switch (fieldType) {
    case 'singleLineText':
      return '单行文本'
    case 'longText':
      return '长文本'
    case 'checkbox':
      return '复选框'
    case 'rating':
      return '评分'
    default:
      return '基础字段'
  }
}

export default function BaseFieldConfig({
  value,
  onChange,
  fieldType,
}: BaseFieldConfigProps) {
  const [config, setConfig] = useState<BaseFieldConfigValue>(
    value || {
      required: false,
      multiline: fieldType === 'longText',
      rows: fieldType === 'longText' ? 4 : undefined,
    }
  )

  const handleChange = (updates: Partial<BaseFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const Icon = getFieldIcon(fieldType)
  const fieldTitle = getFieldTitle(fieldType)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-500" />
          {fieldTitle}字段配置
        </CardTitle>
        <CardDescription>配置字段的基本属性和验证规则</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 默认值 */}
        <div className="space-y-2">
          <Label htmlFor="defaultValue">默认值</Label>
          {fieldType === 'longText' ? (
            <Textarea
              id="defaultValue"
              value={config.defaultValue || ''}
              onChange={(e) => handleChange({ defaultValue: e.target.value })}
              placeholder="输入默认值"
              rows={3}
            />
          ) : (
            <Input
              id="defaultValue"
              value={config.defaultValue || ''}
              onChange={(e) => handleChange({ defaultValue: e.target.value })}
              placeholder="输入默认值"
            />
          )}
        </div>

        {/* 占位符文本 */}
        <div className="space-y-2">
          <Label htmlFor="placeholder">占位符文本</Label>
          <Input
            id="placeholder"
            value={config.placeholder || ''}
            onChange={(e) => handleChange({ placeholder: e.target.value })}
            placeholder="输入占位符文本"
          />
          <p className="text-xs text-muted-foreground">
            用户未输入内容时显示的提示文本
          </p>
        </div>

        {/* 长文本特有配置 */}
        {fieldType === 'longText' && (
          <div className="space-y-2">
            <Label htmlFor="rows">默认行数</Label>
            <Input
              id="rows"
              type="number"
              min="2"
              max="20"
              value={config.rows || 4}
              onChange={(e) => handleChange({ rows: parseInt(e.target.value) || 4 })}
              placeholder="4"
            />
            <p className="text-xs text-muted-foreground">
              文本域的默认显示行数 (2-20)
            </p>
          </div>
        )}

        {/* 最大长度 */}
        {(fieldType === 'singleLineText' || fieldType === 'longText') && (
          <div className="space-y-2">
            <Label htmlFor="maxLength">最大长度</Label>
            <Input
              id="maxLength"
              type="number"
              min="1"
              max="10000"
              value={config.maxLength || ''}
              onChange={(e) => handleChange({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="无限制"
            />
            <p className="text-xs text-muted-foreground">
              限制用户输入的最大字符数 (1-10000)
            </p>
          </div>
        )}

        {/* 必填选项 */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={config.required}
            onCheckedChange={(checked) => handleChange({ required: !!checked })}
          />
          <Label htmlFor="required" className="font-normal cursor-pointer">
            必填字段
          </Label>
        </div>

        {/* 正则表达式验证 */}
        {(fieldType === 'singleLineText' || fieldType === 'longText') && (
          <div className="space-y-2">
            <Label htmlFor="pattern">验证规则 (正则表达式)</Label>
            <Input
              id="pattern"
              value={config.pattern || ''}
              onChange={(e) => handleChange({ pattern: e.target.value })}
              placeholder="如: ^[a-zA-Z0-9]+$ (仅字母数字)"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              可选：使用正则表达式验证输入格式
            </p>
          </div>
        )}

        {/* 验证失败提示 */}
        {config.pattern && (
          <div className="space-y-2">
            <Label htmlFor="validationMessage">验证失败提示</Label>
            <Input
              id="validationMessage"
              value={config.validationMessage || ''}
              onChange={(e) => handleChange({ validationMessage: e.target.value })}
              placeholder="输入格式不正确"
            />
            <p className="text-xs text-muted-foreground">
              当验证规则不匹配时显示的错误提示
            </p>
          </div>
        )}

        {/* 配置预览 */}
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">配置预览：</p>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">字段类型：</span>
              {fieldTitle}
            </div>
            {config.defaultValue && (
              <div className="text-sm">
                <span className="font-medium">默认值：</span>
                {config.defaultValue}
              </div>
            )}
            {config.placeholder && (
              <div className="text-sm">
                <span className="font-medium">占位符：</span>
                {config.placeholder}
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">必填：</span>
              {config.required ? '是' : '否'}
            </div>
            {config.maxLength && (
              <div className="text-sm">
                <span className="font-medium">最大长度：</span>
                {config.maxLength} 字符
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
