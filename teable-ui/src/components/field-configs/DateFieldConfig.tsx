import { useState } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Calendar } from 'lucide-react'

/**
 * 日期字段配置组件
 * 用于配置日期格式、时间范围等
 */

export interface DateFieldConfigValue {
  format?: 'date' | 'datetime' | 'time' | 'custom'
  customFormat?: string
  timezone?: string
  includeTime?: boolean
  minDate?: string // ISO日期字符串
  maxDate?: string // ISO日期字符串
  defaultToNow?: boolean
}

interface DateFieldConfigProps {
  value?: DateFieldConfigValue
  onChange: (value: DateFieldConfigValue) => void
}

const dateFormats = [
  { value: 'date', label: '日期 (YYYY-MM-DD)', example: '2024-01-15' },
  { value: 'datetime', label: '日期时间 (YYYY-MM-DD HH:mm:ss)', example: '2024-01-15 14:30:00' },
  { value: 'time', label: '时间 (HH:mm:ss)', example: '14:30:00' },
  { value: 'custom', label: '自定义格式', example: 'MM/DD/YYYY' },
]

const customFormatExamples = [
  { format: 'YYYY-MM-DD', example: '2024-01-15' },
  { format: 'MM/DD/YYYY', example: '01/15/2024' },
  { format: 'DD/MM/YYYY', example: '15/01/2024' },
  { format: 'YYYY年MM月DD日', example: '2024年01月15日' },
  { format: 'MM-DD HH:mm', example: '01-15 14:30' },
]

const timezones = [
  { value: 'local', label: '本地时间' },
  { value: 'UTC', label: 'UTC' },
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
  { value: 'America/New_York', label: '纽约时间 (UTC-5)' },
  { value: 'Europe/London', label: '伦敦时间 (UTC+0)' },
  { value: 'Asia/Tokyo', label: '东京时间 (UTC+9)' },
]

export default function DateFieldConfig({
  value,
  onChange,
}: DateFieldConfigProps) {
  const [config, setConfig] = useState<DateFieldConfigValue>(
    value || {
      format: 'date',
      includeTime: false,
      timezone: 'local',
    }
  )

  const handleChange = (updates: Partial<DateFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const getPreviewValue = () => {
    const now = new Date()
    const format = config.format || 'date'
    
    if (format === 'custom' && config.customFormat) {
      // 简单的自定义格式处理
      return now.toLocaleDateString('zh-CN')
    }
    
    switch (format) {
      case 'date':
        return now.toLocaleDateString('zh-CN')
      case 'datetime':
        return now.toLocaleString('zh-CN')
      case 'time':
        return now.toLocaleTimeString('zh-CN')
      default:
        return now.toLocaleDateString('zh-CN')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          日期字段配置
        </CardTitle>
        <CardDescription>配置日期格式、时间范围和显示选项</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 日期格式 */}
        <div className="space-y-2">
          <Label htmlFor="format">日期格式</Label>
          <Select
            value={config.format}
            onValueChange={(value) => handleChange({ format: value as DateFieldConfigValue['format'] })}
          >
            <SelectTrigger id="format">
              <SelectValue placeholder="选择日期格式" />
            </SelectTrigger>
            <SelectContent>
              {dateFormats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div>
                    <div>{format.label}</div>
                    <div className="text-xs text-muted-foreground">{format.example}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 自定义格式 */}
        {config.format === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="customFormat">自定义格式</Label>
            <Input
              id="customFormat"
              value={config.customFormat || ''}
              onChange={(e) => handleChange({ customFormat: e.target.value })}
              placeholder="如: YYYY-MM-DD"
            />
            <div className="text-xs text-muted-foreground">
              <p>格式符号说明：</p>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {customFormatExamples.map((example, index) => (
                  <div key={index} className="text-xs">
                    <code>{example.format}</code> → {example.example}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 时间选项 */}
        {config.format !== 'time' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeTime"
              checked={config.includeTime}
              onChange={(e) => handleChange({ includeTime: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="includeTime" className="font-normal cursor-pointer">
              包含时间信息
            </Label>
          </div>
        )}

        {/* 时区设置 */}
        <div className="space-y-2">
          <Label htmlFor="timezone">时区</Label>
          <Select
            value={config.timezone}
            onValueChange={(value) => handleChange({ timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="选择时区" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 日期范围 */}
        <div className="space-y-3">
          <Label>日期范围限制</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minDate">最早日期</Label>
              <Input
                id="minDate"
                type="date"
                value={config.minDate || ''}
                onChange={(e) => handleChange({ minDate: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDate">最晚日期</Label>
              <Input
                id="maxDate"
                type="date"
                value={config.maxDate || ''}
                onChange={(e) => handleChange({ maxDate: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>

        {/* 默认值选项 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="defaultToNow"
            checked={config.defaultToNow}
            onChange={(e) => handleChange({ defaultToNow: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="defaultToNow" className="font-normal cursor-pointer">
            默认值为当前时间
          </Label>
        </div>

        {/* 格式预览 */}
        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-2">格式预览：</p>
          <div className="text-lg font-mono">
            {getPreviewValue()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            当前配置: {config.format} | 时区: {config.timezone} | 包含时间: {config.includeTime ? '是' : '否'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
