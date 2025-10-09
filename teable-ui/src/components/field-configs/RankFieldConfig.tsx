import { useState } from 'react'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Trophy, ArrowUp, ArrowDown, Hash } from 'lucide-react'

/**
 * 排名字段配置组件
 * 用于配置自动排名功能
 */

export interface RankFieldConfigValue {
  sourceField: string // 用于排名的源字段ID
  rankType: 'asc' | 'desc' // 排名类型：升序或降序
  rankMethod: 'dense' | 'standard' // 排名方法：密集排名或标准排名
  showTies: boolean // 是否显示并列排名
}

interface RankFieldConfigProps {
  value?: RankFieldConfigValue
  onChange: (value: RankFieldConfigValue) => void
  availableFields: Array<{ id: string; name: string; type: string }>
}

export default function RankFieldConfig({
  value,
  onChange,
  availableFields,
}: RankFieldConfigProps) {
  const [config, setConfig] = useState<RankFieldConfigValue>(
    value || {
      sourceField: '',
      rankType: 'desc',
      rankMethod: 'dense',
      showTies: true,
    }
  )

  const handleChange = (updates: Partial<RankFieldConfigValue>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onChange(newConfig)
  }

  // 过滤出可以用于排名的字段（数字类型）
  const rankableFields = availableFields.filter(field => 
    field.type === 'number' || field.type === 'singleSelect' || field.type === 'rating'
  )

  const getRankMethodDescription = (method: string) => {
    switch (method) {
      case 'dense':
        return '密集排名：相同值获得相同排名，下一个不同值连续排名'
      case 'standard':
        return '标准排名：相同值获得相同排名，下一个不同值跳过相应数量排名'
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

  const generateRankFormula = () => {
    if (!config.sourceField) return ''
    
    const sourceFieldName = availableFields.find(f => f.id === config.sourceField)?.name || '字段'
    
    // 根据配置生成排名公式
    let formula = ''
    
    if (config.rankMethod === 'dense') {
      // 密集排名公式
      formula = `DENSE_RANK({${sourceFieldName}}, ${config.rankType === 'desc' ? 'DESC' : 'ASC'})`
    } else {
      // 标准排名公式
      formula = `RANK({${sourceFieldName}}, ${config.rankType === 'desc' ? 'DESC' : 'ASC'})`
    }
    
    return formula
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          排名字段配置
        </CardTitle>
        <CardDescription>根据指定字段自动计算排名</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 源字段选择 */}
        <div className="space-y-2">
          <Label>排名依据字段</Label>
          <Select 
            value={config.sourceField} 
            onValueChange={(value) => handleChange({ sourceField: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择用于排名的字段" />
            </SelectTrigger>
            <SelectContent>
              {rankableFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
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
          {config.sourceField && (
            <p className="text-xs text-muted-foreground">
              将根据 <strong>{availableFields.find(f => f.id === config.sourceField)?.name}</strong> 字段进行排名
            </p>
          )}
        </div>

        {/* 排名类型 */}
        <div className="space-y-2">
          <Label>排名顺序</Label>
          <div className="flex gap-2">
            <Button
              variant={config.rankType === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChange({ rankType: 'desc' })}
              className="flex items-center gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              降序（高到低）
            </Button>
            <Button
              variant={config.rankType === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChange({ rankType: 'asc' })}
              className="flex items-center gap-2"
            >
              <ArrowUp className="h-4 w-4" />
              升序（低到高）
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {getRankTypeDescription(config.rankType)}
          </p>
        </div>

        {/* 排名方法 */}
        <div className="space-y-2">
          <Label>排名方法</Label>
          <div className="flex gap-2">
            <Button
              variant={config.rankMethod === 'dense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChange({ rankMethod: 'dense' })}
            >
              密集排名
            </Button>
            <Button
              variant={config.rankMethod === 'standard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleChange({ rankMethod: 'standard' })}
            >
              标准排名
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {getRankMethodDescription(config.rankMethod)}
          </p>
        </div>

        {/* 显示并列排名选项 */}
        <div className="space-y-2">
          <Label>并列排名显示</Label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showTies"
              checked={config.showTies}
              onChange={(e) => handleChange({ showTies: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="showTies" className="text-sm">
              显示并列排名（相同分数获得相同排名）
            </Label>
          </div>
        </div>

        {/* 生成的公式预览 */}
        {config.sourceField && (
          <div className="space-y-2">
            <Label>生成的排名公式</Label>
            <div className="p-3 border rounded-md bg-muted/50">
              <code className="text-sm font-mono">{generateRankFormula()}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              此公式将自动计算每条记录的排名
            </p>
          </div>
        )}

        {/* 排名示例 */}
        <div className="space-y-2">
          <Label>排名示例</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>密集排名示例：</strong>100, 90, 90, 80 → 1, 2, 2, 3</p>
            <p><strong>标准排名示例：</strong>100, 90, 90, 80 → 1, 2, 2, 4</p>
            <p><strong>降序排名：</strong>数值越大排名越高（第1名）</p>
            <p><strong>升序排名：</strong>数值越小排名越高（第1名）</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
