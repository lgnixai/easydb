import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Trophy, Copy, Check } from 'lucide-react'

/**
 * 排名公式生成器组件
 * 提供简化的界面来生成排名公式
 */

interface Field {
  id: string
  name: string
  type: string
}

interface RankFormulaGeneratorProps {
  availableFields: Field[]
  onFormulaGenerated?: (formula: string) => void
}

export default function RankFormulaGenerator({
  availableFields,
  onFormulaGenerated,
}: RankFormulaGeneratorProps) {
  const [sourceField, setSourceField] = useState('')
  const [rankType, setRankType] = useState<'asc' | 'desc'>('desc')
  const [rankMethod, setRankMethod] = useState<'rank' | 'dense_rank'>('dense_rank')
  const [copied, setCopied] = useState(false)

  // 过滤出可以用于排名的字段
  const rankableFields = availableFields.filter(field => 
    field.type === 'number' || field.type === 'singleSelect' || field.type === 'rating'
  )

  const generateFormula = () => {
    if (!sourceField) return ''
    
    const fieldName = availableFields.find(f => f.id === sourceField)?.name || '字段'
    const direction = rankType === 'desc' ? 'DESC' : 'ASC'
    
    return `${rankMethod.toUpperCase()}({${fieldName}}, ${direction})`
  }

  const handleCopy = async () => {
    const formula = generateFormula()
    if (formula) {
      await navigator.clipboard.writeText(formula)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleGenerate = () => {
    const formula = generateFormula()
    if (formula && onFormulaGenerated) {
      onFormulaGenerated(formula)
    }
  }

  const getRankMethodDescription = (method: string) => {
    switch (method) {
      case 'rank':
        return '标准排名：相同值获得相同排名，下一个不同值跳过相应数量排名'
      case 'dense_rank':
        return '密集排名：相同值获得相同排名，下一个不同值连续排名'
      default:
        return ''
    }
  }

  const getRankTypeDescription = (type: string) => {
    switch (type) {
      case 'desc':
        return '降序：数值越大排名越高（第1名、第2名...）'
      case 'asc':
        return '升序：数值越小排名越高（第1名、第2名...）'
      default:
        return ''
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          排名公式生成器
        </CardTitle>
        <CardDescription>快速生成排名公式，自动计算记录排名</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 字段选择 */}
        <div className="space-y-2">
          <Label>选择排名字段</Label>
          <Select value={sourceField} onValueChange={setSourceField}>
            <SelectTrigger>
              <SelectValue placeholder="选择用于排名的字段" />
            </SelectTrigger>
            <SelectContent>
              {rankableFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  <div className="flex items-center gap-2">
                    <span>{field.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {field.type === 'number' ? '数字' : 
                       field.type === 'singleSelect' ? '单选' : 
                       field.type === 'rating' ? '评分' : field.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 排名顺序 */}
        <div className="space-y-2">
          <Label>排名顺序</Label>
          <div className="flex gap-2">
            <Button
              variant={rankType === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRankType('desc')}
            >
              降序（高到低）
            </Button>
            <Button
              variant={rankType === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRankType('asc')}
            >
              升序（低到高）
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {getRankTypeDescription(rankType)}
          </p>
        </div>

        {/* 排名方法 */}
        <div className="space-y-2">
          <Label>排名方法</Label>
          <div className="flex gap-2">
            <Button
              variant={rankMethod === 'dense_rank' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRankMethod('dense_rank')}
            >
              密集排名
            </Button>
            <Button
              variant={rankMethod === 'rank' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRankMethod('rank')}
            >
              标准排名
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {getRankMethodDescription(rankMethod)}
          </p>
        </div>

        {/* 生成的公式 */}
        {sourceField && (
          <div className="space-y-2">
            <Label>生成的排名公式</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 border rounded-md bg-muted/50">
                <code className="text-sm font-mono">{generateFormula()}</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerate}
            disabled={!sourceField}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            生成排名公式
          </Button>
        </div>

        {/* 排名示例 */}
        <div className="space-y-2">
          <Label>排名示例</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>密集排名：</strong>100, 90, 90, 80 → 1, 2, 2, 3</p>
            <p><strong>标准排名：</strong>100, 90, 90, 80 → 1, 2, 2, 4</p>
            <p><strong>降序排名：</strong>数值越大排名越高（第1名）</p>
            <p><strong>升序排名：</strong>数值越小排名越高（第1名）</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

