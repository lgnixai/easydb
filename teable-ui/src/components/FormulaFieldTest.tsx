import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import teableClient from '@/lib/teable-simple'

export const FormulaFieldTest = () => {
  const [tableId, setTableId] = useState('tbl_b0vWEewyNyg8JdB1hSQDb')
  const [fieldName, setFieldName] = useState('总分公式')
  const [formula, setFormula] = useState('{Count}')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFormulaField = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('创建公式字段...', {
        table_id: tableId,
        name: fieldName,
        type: 'formula',
        options: JSON.stringify({
          expression: formula
        })
      })
      
      // 创建公式字段
      const response = await teableClient.createField({
        table_id: tableId,
        name: fieldName,
        type: 'formula',
        description: `公式: ${formula}`,
        options: JSON.stringify({
          expression: formula
        })
      })
      
      console.log('创建成功:', response)
      setResult(response.data)
      alert('✅ 公式字段创建成功！请查看表格中的新字段。')
    } catch (err: any) {
      console.error('创建失败:', err)
      setError(err.message)
      alert(`❌ 创建失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const updateFormulaField = async () => {
    if (!result?.id) {
      alert('请先创建字段')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('更新公式字段...', {
        field_id: result.id,
        options: {
          expression: formula
        }
      })
      
      // 更新公式字段
      const response = await teableClient.updateField(result.id, {
        name: fieldName,
        options: {
          expression: formula
        }
      })
      
      console.log('更新成功:', response)
      setResult(response.data)
      alert('✅ 公式字段更新成功！')
    } catch (err: any) {
      console.error('更新失败:', err)
      setError(err.message)
      alert(`❌ 更新失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>公式字段测试</CardTitle>
          <CardDescription>
            测试创建和更新公式字段，验证SUM等函数是否能正常工作
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tableId">表格 ID</Label>
            <Input
              id="tableId"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              placeholder="tbl_xxx"
            />
            <p className="text-xs text-muted-foreground">
              当前测试表格：SUM提漯四衡 (tbl_b0vWEewyNyg8JdB1hSQDb)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldName">字段名称</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="例如：总分"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula">公式表达式</Label>
            <Textarea
              id="formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="例如：SUM({Count}) 或 {Count} * 2"
              className="font-mono h-24"
            />
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>💡 提示：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>使用 <code>{'{字段名}'}</code> 引用字段</li>
                <li>SUM: <code>SUM({'{Count}'})</code></li>
                <li>简单引用: <code>{'{Count}'}</code></li>
                <li>计算: <code>{'{Count}'} * 2</code></li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={createFormulaField} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? '创建中...' : '创建公式字段'}
            </Button>
            
            <Button 
              onClick={updateFormulaField} 
              disabled={loading || !result?.id}
              variant="outline"
              className="flex-1"
            >
              {loading ? '更新中...' : '更新公式字段'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <Label>创建结果</Label>
              <pre className="p-4 bg-muted rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">测试步骤：</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>确保表格 ID 正确</li>
              <li>输入字段名称</li>
              <li>输入公式表达式（例如：<code>{'{Count}'}</code>）</li>
              <li>点击"创建公式字段"</li>
              <li>打开表格查看字段是否显示</li>
              <li>检查字段是否有计算结果</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

