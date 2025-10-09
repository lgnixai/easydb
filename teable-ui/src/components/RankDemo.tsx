import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Trophy, User, Hash, TrendingUp, TrendingDown } from 'lucide-react'
import RankFormulaGenerator from './RankFormulaGenerator'

/**
 * 排名功能演示组件
 * 展示如何使用排名功能
 */

interface DemoRecord {
  id: string
  name: string
  score: number
  rank?: number
  denseRank?: number
}

export default function RankDemo() {
  const [records, setRecords] = useState<DemoRecord[]>([
    { id: '1', name: '张三', score: 100 },
    { id: '2', name: '李四', score: 90 },
    { id: '3', name: '王五', score: 90 },
    { id: '4', name: '赵六', score: 80 },
    { id: '5', name: '钱七', score: 85 },
  ])

  const [showRanking, setShowRanking] = useState(false)

  // 计算排名
  const calculateRankings = () => {
    // 按分数降序排序
    const sortedRecords = [...records].sort((a, b) => b.score - a.score)
    
    // 计算标准排名和密集排名
    const rankedRecords = sortedRecords.map((record, index) => {
      // 标准排名：相同分数获得相同排名，下一个不同分数跳过相应数量排名
      let standardRank = index + 1
      if (index > 0 && record.score === sortedRecords[index - 1].score) {
        standardRank = sortedRecords.findIndex(r => r.id === record.id) + 1
      }
      
      // 密集排名：相同分数获得相同排名，下一个不同分数连续排名
      let denseRank = 1
      for (let i = 0; i < index; i++) {
        if (sortedRecords[i].score !== record.score) {
          denseRank++
        }
      }
      
      return {
        ...record,
        rank: standardRank,
        denseRank: denseRank
      }
    })
    
    setRecords(rankedRecords)
    setShowRanking(true)
  }

  const resetRanking = () => {
    const resetRecords = records.map(record => ({
      ...record,
      rank: undefined,
      denseRank: undefined
    }))
    setRecords(resetRecords)
    setShowRanking(false)
  }

  const availableFields = [
    { id: 'score', name: '分数', type: 'number' }
  ]

  const handleFormulaGenerated = (formula: string) => {
    console.log('生成的排名公式:', formula)
    // 这里可以进一步处理生成的公式
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          排名功能演示
        </h2>
        <p className="text-muted-foreground mt-2">
          演示如何根据分数字段自动计算排名
        </p>
      </div>

      {/* 排名公式生成器 */}
      <RankFormulaGenerator
        availableFields={availableFields}
        onFormulaGenerated={handleFormulaGenerated}
      />

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            员工成绩排名表
          </CardTitle>
          <CardDescription>
            展示根据分数自动计算的排名结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button
                onClick={calculateRankings}
                disabled={showRanking}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                计算排名
              </Button>
              <Button
                variant="outline"
                onClick={resetRanking}
                disabled={!showRanking}
                className="flex items-center gap-2"
              >
                <TrendingDown className="h-4 w-4" />
                重置排名
              </Button>
            </div>

            {/* 表格 */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  员工姓名
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  分数
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  标准排名
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  密集排名
                </div>
                <div>排名说明</div>
              </div>
              
              {records.map((record, index) => (
                <div key={record.id} className="grid grid-cols-5 gap-4 p-4 border-t">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {record.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">{record.score}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    {record.rank ? (
                      <Badge variant="default" className="bg-blue-500">
                        第{record.rank}名
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    {record.denseRank ? (
                      <Badge variant="default" className="bg-green-500">
                        第{record.denseRank}名
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {record.rank && record.denseRank && (
                      <>
                        {record.rank === record.denseRank ? (
                          <span>排名一致</span>
                        ) : (
                          <span>标准排名跳过重复</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 排名说明 */}
            {showRanking && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">排名说明：</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>标准排名：</strong>相同分数获得相同排名，下一个不同分数会跳过相应数量的排名位置</li>
                  <li>• <strong>密集排名：</strong>相同分数获得相同排名，下一个不同分数连续排名，不跳过位置</li>
                  <li>• 例如：100分(第1名), 90分(第2名), 90分(第2名), 80分(第4名标准排名/第3名密集排名)</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>如何设置自动排名</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">方法一：使用公式字段</h4>
              <p className="text-sm text-muted-foreground">
                1. 创建公式字段，选择"排名字段"类型<br/>
                2. 选择用于排名的源字段（如：分数字段）<br/>
                3. 选择排名顺序（升序/降序）和排名方法（标准/密集）<br/>
                4. 系统会自动生成排名公式并计算排名
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">方法二：手动编写公式</h4>
              <p className="text-sm text-muted-foreground">
                1. 创建公式字段，选择"公式"类型<br/>
                2. 使用公式编辑器编写排名公式<br/>
                3. 常用公式：<code>RANK({'{分数}'}, DESC)</code> 或 <code>DENSE_RANK({'{分数}'}, DESC)</code><br/>
                4. 保存后系统会自动计算排名
              </p>
            </div>

            <div>
              <h4 className="font-medium">公式说明</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• <code>RANK({'{字段}'}, DESC)</code> - 标准排名，降序</p>
                <p>• <code>RANK({'{字段}'}, ASC)</code> - 标准排名，升序</p>
                <p>• <code>DENSE_RANK({'{字段}'}, DESC)</code> - 密集排名，降序</p>
                <p>• <code>DENSE_RANK({'{字段}'}, ASC)</code> - 密集排名，升序</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
