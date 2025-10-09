import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Hash } from 'lucide-react'

/**
 * 数字字段配置组件
 * 用于配置数字格式、精度、范围等
 */

export interface NumberFieldConfigValue {
  precision?: number // 小数位数
  format?: 'number' | 'currency' | 'percentage' | 'scientific'
  currency?: string // 货币符号
  min?: number // 最小值
  max?: number // 最大值
  showThousandSeparator?: boolean // 显示千位分隔符
  prefix?: string // 前缀
  suffix?: string // 后缀
}

interface NumberFieldConfigProps {
  value?: NumberFieldConfigValue
  onChange: (value: NumberFieldConfigValue) => void
}

const currencyOptions = [
  { value: 'CNY', label: '¥ 人民币' },
  { value: 'USD', label: '$ 美元' },
  { value: 'EUR', label: '€ 欧元' },
  { value: 'GBP', label: '£ 英镑' },
  { value: 'JPY', label: '¥ 日元' },
]

export default function NumberFieldConfig({
  value,
  onChange,
}: NumberFieldConfigProps) {
  const [config, setConfig] = useState<NumberFieldConfigValue>(
    value || {
      precision: 2,
      format: 'number',
      showThousandSeparator: true,
    }
  )

  const handleChange = (updates: Partial<NumberFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const formatPreview = () => {
    const sampleValue = 1234.567
    let formatted = sampleValue.toString()

    // 应用精度
    if (config.precision !== undefined) {
      formatted = sampleValue.toFixed(config.precision)
    }

    // 应用千位分隔符
    if (config.showThousandSeparator && config.format !== 'scientific') {
      const parts = formatted.split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      formatted = parts.join('.')
    }

    // 应用格式
    switch (config.format) {
      case 'currency':
        const currency = config.currency || 'CNY'
        const currencySymbol = currencyOptions.find(c => c.value === currency)?.label.split(' ')[0] || '$'
        formatted = `${currencySymbol} ${formatted}`
        break
      case 'percentage':
        formatted = `${formatted}%`
        break
      case 'scientific':
        formatted = sampleValue.toExponential(config.precision)
        break
    }

    // 应用前缀后缀
    if (config.prefix) {
      formatted = `${config.prefix}${formatted}`
    }
    if (config.suffix) {
      formatted = `${formatted}${config.suffix}`
    }

    return formatted
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-green-500" />
          数字字段配置
        </CardTitle>
        <CardDescription>配置数字格式、精度和显示选项</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 数字格式 */}
        <div className="space-y-2">
          <Label htmlFor="format">数字格式</Label>
          <Select
            value={config.format}
            onValueChange={(value) => handleChange({ format: value as NumberFieldConfigValue['format'] })}
          >
            <SelectTrigger id="format">
              <SelectValue placeholder="选择数字格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">普通数字</SelectItem>
              <SelectItem value="currency">货币</SelectItem>
              <SelectItem value="percentage">百分比</SelectItem>
              <SelectItem value="scientific">科学计数法</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 货币设置 */}
        {config.format === 'currency' && (
          <div className="space-y-2">
            <Label htmlFor="currency">货币类型</Label>
            <Select
              value={config.currency || 'CNY'}
              onValueChange={(value) => handleChange({ currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="选择货币" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 小数位数 */}
        <div className="space-y-2">
          <Label htmlFor="precision">小数位数</Label>
          <Input
            id="precision"
            type="number"
            min="0"
            max="10"
            value={config.precision || 0}
            onChange={(e) => handleChange({ precision: parseInt(e.target.value) || 0 })}
            placeholder="小数位数"
          />
          <p className="text-xs text-muted-foreground">
            设置小数点后显示的位数 (0-10)
          </p>
        </div>

        {/* 数值范围 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min">最小值</Label>
            <Input
              id="min"
              type="number"
              value={config.min || ''}
              onChange={(e) => handleChange({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="无限制"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max">最大值</Label>
            <Input
              id="max"
              type="number"
              value={config.max || ''}
              onChange={(e) => handleChange({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="无限制"
            />
          </div>
        </div>

        {/* 显示选项 */}
        <div className="space-y-3">
          <Label>显示选项</Label>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showThousandSeparator"
              checked={config.showThousandSeparator}
              onChange={(e) => handleChange({ showThousandSeparator: e.target.checked })}
              className="h-4 w-4"
              disabled={config.format === 'scientific'}
            />
            <Label htmlFor="showThousandSeparator" className="font-normal cursor-pointer">
              显示千位分隔符 (1,234.56)
            </Label>
          </div>
        </div>

        {/* 自定义前缀后缀 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prefix">前缀</Label>
            <Input
              id="prefix"
              value={config.prefix || ''}
              onChange={(e) => handleChange({ prefix: e.target.value })}
              placeholder="如: $, ¥"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suffix">后缀</Label>
            <Input
              id="suffix"
              value={config.suffix || ''}
              onChange={(e) => handleChange({ suffix: e.target.value })}
              placeholder="如: 元, 个"
            />
          </div>
        </div>

        {/* 格式预览 */}
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">格式预览：</p>
          <div className="text-lg font-mono">
            示例值: 1234.567 → {formatPreview()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            当前配置: {config.format} | 小数位: {config.precision} | 千位分隔符: {config.showThousandSeparator ? '开启' : '关闭'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
