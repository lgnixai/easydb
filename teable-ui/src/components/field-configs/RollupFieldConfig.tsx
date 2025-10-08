import { useState } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp } from 'lucide-react'

/**
 * Rollup字段配置组件
 * 用于配置汇总计算（从关联记录中汇总数据）
 */

export interface RollupFieldConfigValue {
  linkFieldId: string
  rollupFieldId: string
  aggregation: 'count' | 'sum' | 'average' | 'min' | 'max' | 'concatenate'
}

interface RollupFieldConfigProps {
  value?: RollupFieldConfigValue
  onChange: (value: RollupFieldConfigValue) => void
  availableFields: Array<{ id: string; name: string; type: string }>
  linkedTableFields?: Array<{ id: string; name: string; type: string }>
}

export default function RollupFieldConfig({
  value,
  onChange,
  availableFields,
  linkedTableFields = [],
}: RollupFieldConfigProps) {
  const [config, setConfig] = useState<RollupFieldConfigValue>(
    value || {
      linkFieldId: '',
      rollupFieldId: '',
      aggregation: 'count',
    }
  )

  const handleChange = (updates: Partial<RollupFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  // 筛选出Link类型的字段
  const linkFields = availableFields.filter((f) => f.type === 'link')

  const aggregationOptions = [
    { value: 'count', label: '计数 (COUNT)', desc: '统计关联记录数量' },
    { value: 'sum', label: '求和 (SUM)', desc: '对数值字段求和' },
    { value: 'average', label: '平均值 (AVERAGE)', desc: '计算数值字段平均值' },
    { value: 'min', label: '最小值 (MIN)', desc: '找出最小值' },
    { value: 'max', label: '最大值 (MAX)', desc: '找出最大值' },
    { value: 'concatenate', label: '连接 (CONCATENATE)', desc: '将文本连接起来' },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Rollup字段配置
        </CardTitle>
        <CardDescription>对关联记录的字段进行汇总计算</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 选择关联字段 */}
        <div className="space-y-2">
          <Label htmlFor="linkField">关联字段</Label>
          <Select
            value={config.linkFieldId}
            onValueChange={(value) => handleChange({ linkFieldId: value })}
          >
            <SelectTrigger id="linkField">
              <SelectValue placeholder="选择Link字段" />
            </SelectTrigger>
            <SelectContent>
              {linkFields.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  当前表没有Link字段
                </div>
              ) : (
                linkFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            选择要从哪个Link字段汇总关联表的数据
          </p>
        </div>

        {/* 选择要汇总的字段 */}
        <div className="space-y-2">
          <Label htmlFor="rollupField">汇总字段</Label>
          <Select
            value={config.rollupFieldId}
            onValueChange={(value) => handleChange({ rollupFieldId: value })}
            disabled={!config.linkFieldId}
          >
            <SelectTrigger id="rollupField">
              <SelectValue placeholder="选择要汇总的字段" />
            </SelectTrigger>
            <SelectContent>
              {linkedTableFields.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {config.linkFieldId ? '加载关联表字段...' : '请先选择关联字段'}
                </div>
              ) : (
                linkedTableFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.name} ({field.type})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">选择要汇总的字段</p>
        </div>

        {/* 选择汇总方式 */}
        <div className="space-y-2">
          <Label htmlFor="aggregation">汇总方式</Label>
          <Select
            value={config.aggregation}
            onValueChange={(value) =>
              handleChange({ aggregation: value as RollupFieldConfigValue['aggregation'] })
            }
          >
            <SelectTrigger id="aggregation">
              <SelectValue placeholder="选择汇总方式" />
            </SelectTrigger>
            <SelectContent>
              {aggregationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 配置预览 */}
        {config.linkFieldId && config.rollupFieldId && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-medium mb-1">配置预览：</p>
            <p className="text-muted-foreground">
              对通过{' '}
              <span className="font-mono text-foreground">
                {linkFields.find((f) => f.id === config.linkFieldId)?.name}
              </span>{' '}
              关联的记录的{' '}
              <span className="font-mono text-foreground">
                {linkedTableFields.find((f) => f.id === config.rollupFieldId)?.name}
              </span>{' '}
              字段进行{' '}
              <span className="font-mono text-foreground">
                {aggregationOptions.find((o) => o.value === config.aggregation)?.label}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

