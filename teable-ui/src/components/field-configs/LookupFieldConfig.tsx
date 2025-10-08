import { useState } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Link2 } from 'lucide-react'

/**
 * Lookup字段配置组件
 * 用于配置从关联表中查找值
 */

export interface LookupFieldConfigValue {
  linkFieldId: string
  lookupFieldId: string
  multiple?: boolean
}

interface LookupFieldConfigProps {
  value?: LookupFieldConfigValue
  onChange: (value: LookupFieldConfigValue) => void
  availableFields: Array<{ id: string; name: string; type: string }>
  linkedTableFields?: Array<{ id: string; name: string; type: string }>
}

export default function LookupFieldConfig({
  value,
  onChange,
  availableFields,
  linkedTableFields = [],
}: LookupFieldConfigProps) {
  const [config, setConfig] = useState<LookupFieldConfigValue>(
    value || {
      linkFieldId: '',
      lookupFieldId: '',
      multiple: false,
    }
  )

  const handleChange = (updates: Partial<LookupFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  // 筛选出Link类型的字段
  const linkFields = availableFields.filter((f) => f.type === 'link')

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-blue-500" />
          Lookup字段配置
        </CardTitle>
        <CardDescription>从关联表中查找并显示字段值</CardDescription>
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
            选择要从哪个Link字段查找关联表的数据
          </p>
        </div>

        {/* 选择要查找的字段 */}
        <div className="space-y-2">
          <Label htmlFor="lookupField">查找字段</Label>
          <Select
            value={config.lookupFieldId}
            onValueChange={(value) => handleChange({ lookupFieldId: value })}
            disabled={!config.linkFieldId}
          >
            <SelectTrigger id="lookupField">
              <SelectValue placeholder="选择要查找的字段" />
            </SelectTrigger>
            <SelectContent>
              {linkedTableFields.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {config.linkFieldId
                    ? '加载关联表字段...'
                    : '请先选择关联字段'}
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
          <p className="text-xs text-muted-foreground">
            选择要从关联表中查找的字段
          </p>
        </div>

        {/* 多值选项 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="multiple"
            checked={config.multiple}
            onChange={(e) => handleChange({ multiple: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="multiple" className="font-normal cursor-pointer">
            允许多个值（当关联了多条记录时）
          </Label>
        </div>

        {/* 配置预览 */}
        {config.linkFieldId && config.lookupFieldId && (
          <div className="mt-4 p-3 bg-muted rounded-md text-sm">
            <p className="font-medium mb-1">配置预览：</p>
            <p className="text-muted-foreground">
              通过 <span className="font-mono text-foreground">
                {linkFields.find((f) => f.id === config.linkFieldId)?.name}
              </span>{' '}
              字段查找关联表中的{' '}
              <span className="font-mono text-foreground">
                {linkedTableFields.find((f) => f.id === config.lookupFieldId)?.name}
              </span>{' '}
              字段值
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

