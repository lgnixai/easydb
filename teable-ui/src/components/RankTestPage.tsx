import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Trophy, Plus, Trash2, User, Hash } from 'lucide-react'
import RankFormulaGenerator from './RankFormulaGenerator'

interface TestRecord {
  id: string
  name: string
  score: number
  rank?: number
  denseRank?: number
}

export default function RankTestPage() {
  const [records, setRecords] = useState<TestRecord[]>([
    { id: '1', name: '张三', score: 100 },
    { id: '2', name: '李四', score: 90 },
    { id: '3', name: '王五', score: 90 },
    { id: '4', name: '赵六', score: 80 },
  ])

  const [newName, setNewName] = useState('')
  const [newScore, setNewScore] = useState('')

  const addRecord = () => {
    if (newName && newScore) {
      const newRecord: TestRecord = {
        id: Date.now().toString(),
        name: newName,
        score: Number(newScore),
      }
      setRecords([...records, newRecord])
      setNewName('')
      setNewScore('')
    }
  }

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id))
  }

  const calculateRankings = () => {
    // 按分数降序排序
    const sortedRecords = [...records].sort((a, b) => b.score - a.score)
    
    // 计算标准排名和密集排名
    const rankedRecords = sortedRecords.map((record, index) => {
      // 标准排名
      let standardRank = index + 1
      if (index > 0 && record.score === sortedRecords[index - 1].score) {
        // 找到相同分数的第一个记录的排名
        const firstSameScoreIndex = sortedRecords.findIndex(r => r.score === record.score)
        standardRank = firstSameScoreIndex + 1
      }
      
      // 密集排名
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
    
    // 按原始顺序重新排列
    const finalRecords = records.map(record => {
      const rankedRecord = rankedRecords.find(r => r.id === record.id)
      return rankedRecord || record
    })
    
    setRecords(finalRecords)
  }

  const availableFields = [
    { id: 'score', name: '分数', type: 'number' }
  ]

  const handleFormulaGenerated = (formula: string) => {
    console.log('生成的排名公式:', formula)
    alert(`生成的排名公式：\n${formula}\n\n您可以复制此公式并在公式字段中使用。`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            排名功能测试页面
          </h1>
          <p className="text-gray-600">
            测试和演示自动排名功能
          </p>
        </div>

        {/* 排名公式生成器 */}
        <RankFormulaGenerator
          availableFields={availableFields}
          onFormulaGenerated={handleFormulaGenerated}
        />

        {/* 添加记录 */}
        <Card>
          <CardHeader>
            <CardTitle>添加测试记录</CardTitle>
            <CardDescription>添加员工记录来测试排名功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="name">员工姓名</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入员工姓名"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="score">分数</Label>
                <Input
                  id="score"
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="请输入分数"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addRecord} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  添加记录
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 记录列表和排名 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                员工记录列表
              </div>
              <Button onClick={calculateRankings} className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                计算排名
              </Button>
            </CardTitle>
            <CardDescription>
              点击"计算排名"按钮来为所有记录计算排名
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* 表头 */}
              <div className="grid grid-cols-6 gap-4 p-3 bg-gray-100 rounded-md font-medium text-sm">
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
                <div>操作</div>
              </div>
              
              {/* 记录行 */}
              {records.map((record) => (
                <div key={record.id} className="grid grid-cols-6 gap-4 p-3 border rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {record.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <Badge variant="secondary">{record.score}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-500" />
                    {record.rank ? (
                      <Badge variant="default" className="bg-blue-500">
                        第{record.rank}名
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-500" />
                    {record.denseRank ? (
                      <Badge variant="default" className="bg-green-500">
                        第{record.denseRank}名
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
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
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRecord(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {records.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无记录，请添加一些员工记录来测试排名功能
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">排名方法说明：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>标准排名：</strong>相同分数获得相同排名，下一个不同分数会跳过相应数量的排名位置</li>
                <li>• <strong>密集排名：</strong>相同分数获得相同排名，下一个不同分数连续排名，不跳过位置</li>
                <li>• 例如：100分(第1名), 90分(第2名), 90分(第2名), 80分(第4名标准排名/第3名密集排名)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">如何在您的应用中使用：</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. 使用上面的排名公式生成器生成公式</li>
                <li>2. 在您的表格中创建公式字段</li>
                <li>3. 将生成的公式粘贴到公式字段中</li>
                <li>4. 保存后系统会自动计算排名</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
