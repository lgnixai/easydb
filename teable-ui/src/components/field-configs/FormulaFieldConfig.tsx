import { useState } from 'react'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Calculator } from 'lucide-react'

/**
 * Formula字段配置组件
 * 用于配置公式计算
 */

export interface FormulaFieldConfigValue {
  expression: string
  returnType?: 'text' | 'number' | 'boolean' | 'date'
}

interface FormulaFieldConfigProps {
  value?: FormulaFieldConfigValue
  onChange: (value: FormulaFieldConfigValue) => void
  availableFields: Array<{ id: string; name: string; type: string }>
}

export default function FormulaFieldConfig({
  value,
  onChange,
  availableFields,
}: FormulaFieldConfigProps) {
  const [config, setConfig] = useState<FormulaFieldConfigValue>(
    value || {
      expression: '',
      returnType: 'text',
    }
  )

  const handleChange = (updates: Partial<FormulaFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const commonFunctions = [
    { name: 'SUM', desc: '求和', example: 'SUM({field1}, {field2})' },
    { name: 'AVERAGE', desc: '平均值', example: 'AVERAGE({field1}, {field2})' },
    { name: 'IF', desc: '条件', example: 'IF({field} > 100, "大", "小")' },
    { name: 'CONCAT', desc: '连接文本', example: 'CONCAT({field1}, " - ", {field2})' },
    { name: 'TODAY', desc: '今天日期', example: 'TODAY()' },
    { name: 'NOW', desc: '当前时间', example: 'NOW()' },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-500" />
          Formula字段配置
        </CardTitle>
        <CardDescription>使用公式计算字段值</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 公式表达式 */}
        <div className="space-y-2">
          <Label htmlFor="expression">公式表达式</Label>
          <Textarea
            id="expression"
            placeholder="输入公式，例如: {field1} + {field2}"
            value={config.expression}
            onChange={(e) => handleChange({ expression: e.target.value })}
            rows={4}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            使用 <code className="px-1 py-0.5 bg-muted rounded">{'{{field_name}}'}</code> 引用字段
          </p>
        </div>

        {/* 可用字段列表 */}
        <div className="space-y-2">
          <Label>可用字段</Label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
            {availableFields.map((field) => (
              <button
                key={field.id}
                className="text-left px-2 py-1 text-sm hover:bg-muted rounded"
                onClick={() => {
                  const cursorPos = (document.getElementById('expression') as HTMLTextAreaElement)
                    ?.selectionStart || 0
                  const newExpression =
                    config.expression.slice(0, cursorPos) +
                    `{${field.name}}` +
                    config.expression.slice(cursorPos)
                  handleChange({ expression: newExpression })
                }}
              >
                <span className="font-mono text-xs">{'{' + field.name + '}'}</span>
                <span className="text-muted-foreground ml-1">({field.type})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 常用函数 */}
        <details className="space-y-2">
          <summary className="cursor-pointer text-sm font-medium">常用函数</summary>
          <div className="space-y-2 pt-2">
            {commonFunctions.map((fn) => (
              <div
                key={fn.name}
                className="p-2 border rounded-md hover:bg-muted cursor-pointer"
                onClick={() => {
                  handleChange({ expression: config.expression + fn.example })
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">{fn.name}</span>
                  <span className="text-xs text-muted-foreground">{fn.desc}</span>
                </div>
                <code className="text-xs text-muted-foreground">{fn.example}</code>
              </div>
            ))}
          </div>
        </details>

        {/* 返回类型（可选） */}
        <div className="space-y-2">
          <Label>返回类型（可选）</Label>
          <div className="flex gap-2">
            {['text', 'number', 'boolean', 'date'].map((type) => (
              <button
                key={type}
                className={`px-3 py-1 text-sm rounded-md border ${
                  config.returnType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                onClick={() =>
                  handleChange({ returnType: type as FormulaFieldConfigValue['returnType'] })
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

