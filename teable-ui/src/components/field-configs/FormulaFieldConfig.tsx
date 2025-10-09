import { useState } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Calculator, Edit } from 'lucide-react'
import FormulaEditorDialog from '../FormulaEditorDialog'

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
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const handleChange = (updates: Partial<FormulaFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  const handleFormulaSubmit = (formula: string) => {
    handleChange({ expression: formula })
  }


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
        {/* 公式表达式配置 */}
        <div className="space-y-2">
          <Label>公式内容</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 border rounded-md bg-muted/50">
              {config.expression ? (
                <code className="text-sm font-mono">{config.expression}</code>
              ) : (
                <span className="text-muted-foreground text-sm">未设置公式</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              编辑公式
            </Button>
          </div>
          {config.expression && (
            <p className="text-xs text-muted-foreground">
              公式预览: <code className="px-1 py-0.5 bg-muted rounded text-xs">{config.expression}</code>
            </p>
          )}
        </div>

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

        {/* 公式编辑器弹窗 */}
        <FormulaEditorDialog
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          value={config.expression}
          onChange={(formula) => handleChange({ expression: formula })}
          availableFields={availableFields}
          onSubmit={handleFormulaSubmit}
        />
      </CardContent>
    </Card>
  )
}

