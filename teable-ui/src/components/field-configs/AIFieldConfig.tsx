import { useState } from 'react'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Sparkles, Plus, Trash2 } from 'lucide-react'

/**
 * AI字段配置组件
 * 用于配置AI字段的提示词、操作类型和引用字段
 */

export interface AIFieldConfigValue {
  operation: 'generate' | 'classify' | 'extract' | 'summarize' | 'translate'
  prompt: string
  referenceFields: string[]
  model?: string
  maxTokens?: number
  temperature?: number
}

interface AIFieldConfigProps {
  value?: AIFieldConfigValue
  onChange: (value: AIFieldConfigValue) => void
  availableFields: Array<{ id: string; name: string; type: string }>
}

export default function AIFieldConfig({ value, onChange, availableFields }: AIFieldConfigProps) {
  const [config, setConfig] = useState<AIFieldConfigValue>(
    value || {
      operation: 'generate',
      prompt: '',
      referenceFields: [],
      temperature: 0.7,
      maxTokens: 500,
    }
  )

  const handleChange = (updates: Partial<AIFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const addReferenceField = (fieldId: string) => {
    if (!config.referenceFields.includes(fieldId)) {
      handleChange({ referenceFields: [...config.referenceFields, fieldId] })
    }
  }

  const removeReferenceField = (fieldId: string) => {
    handleChange({
      referenceFields: config.referenceFields.filter((id) => id !== fieldId),
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI字段配置
        </CardTitle>
        <CardDescription>配置AI模型如何处理和生成字段值</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 操作类型 */}
        <div className="space-y-2">
          <Label htmlFor="operation">AI操作类型</Label>
          <Select
            value={config.operation}
            onValueChange={(value) =>
              handleChange({ operation: value as AIFieldConfigValue['operation'] })
            }
          >
            <SelectTrigger id="operation">
              <SelectValue placeholder="选择AI操作" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generate">生成内容 (Generate)</SelectItem>
              <SelectItem value="classify">分类 (Classify)</SelectItem>
              <SelectItem value="extract">提取信息 (Extract)</SelectItem>
              <SelectItem value="summarize">总结 (Summarize)</SelectItem>
              <SelectItem value="translate">翻译 (Translate)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 提示词 */}
        <div className="space-y-2">
          <Label htmlFor="prompt">AI提示词</Label>
          <Textarea
            id="prompt"
            placeholder="输入AI提示词，使用 {field_name} 引用其他字段..."
            value={config.prompt}
            onChange={(e) => handleChange({ prompt: e.target.value })}
            rows={4}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            提示：使用 <code className="px-1 py-0.5 bg-muted rounded">{'{{field_name}}'}</code>{' '}
            引用其他字段的值
          </p>
        </div>

        {/* 引用字段 */}
        <div className="space-y-2">
          <Label>引用字段</Label>
          <div className="flex gap-2">
            <Select onValueChange={addReferenceField}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择要引用的字段" />
              </SelectTrigger>
              <SelectContent>
                {availableFields
                  .filter((field) => !config.referenceFields.includes(field.id))
                  .map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name} ({field.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* 已选择的引用字段 */}
          {config.referenceFields.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {config.referenceFields.map((fieldId) => {
                const field = availableFields.find((f) => f.id === fieldId)
                return (
                  <div
                    key={fieldId}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-sm"
                  >
                    <span>{field?.name || fieldId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeReferenceField(fieldId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 高级选项 */}
        <details className="space-y-2">
          <summary className="cursor-pointer text-sm font-medium">高级选项</summary>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => handleChange({ temperature: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">控制输出的随机性 (0-2)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokens">最大Token数</Label>
              <Input
                id="maxTokens"
                type="number"
                min="1"
                max="4000"
                step="50"
                value={config.maxTokens}
                onChange={(e) => handleChange({ maxTokens: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">限制AI响应的最大长度</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">AI模型</Label>
              <Select
                value={config.model}
                onValueChange={(value) => handleChange({ model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="默认模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}

