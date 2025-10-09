import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Calculator, 
  X, 
  Wand2, 
  HelpCircle, 
  Type, 
  Hash, 
  Calendar, 
  Paperclip,
  MapPin,
  Plus
} from 'lucide-react'

/**
 * 公式编辑器弹窗组件
 * 提供完整的公式编辑界面，包括字段引用、函数帮助等功能
 */

interface Field {
  id: string
  name: string
  type: string
  description?: string
}

interface FormulaEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string
  onChange: (value: string) => void
  availableFields: Field[]
  onSubmit?: (formula: string) => void
}

export default function FormulaEditorDialog({
  open,
  onOpenChange,
  value = '',
  onChange,
  availableFields,
  onSubmit,
}: FormulaEditorDialogProps) {
  const [formula, setFormula] = useState(value)
  const [selectedField, setSelectedField] = useState<Field | null>(null)
  const [activeTab, setActiveTab] = useState<'edit' | 'ai'>('edit')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 当对话框打开时，同步外部value到内部state
  useEffect(() => {
    if (open) {
      setFormula(value)
    }
  }, [open, value])

  const handleFormulaChange = (newFormula: string) => {
    setFormula(newFormula)
    onChange(newFormula)
  }

  const validateFormula = (formula: string): { isValid: boolean; error?: string } => {
    // 检查RANK和DENSE_RANK函数语法
    const rankPattern = /(RANK|DENSE_RANK)\s*\(\s*\{[^}]+\}\s*,\s*(ASC|DESC)\s*\)/g
    const incompleteRankPattern = /(RANK|DENSE_RANK)\s*\(\s*\{[^}]+\}\s*\)/g
    
    if (incompleteRankPattern.test(formula)) {
      return {
        isValid: false,
        error: 'RANK和DENSE_RANK函数必须包含排序参数（ASC或DESC），例如：RANK({分数}, DESC)'
      }
    }
    
    return { isValid: true }
  }

  const handleSubmit = () => {
    const validation = validateFormula(formula)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }
    
    onSubmit?.(formula)
    onOpenChange(false)
  }

  const insertField = (fieldName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const fieldReference = `{${fieldName}}`
      
      const newFormula = formula.slice(0, start) + fieldReference + formula.slice(end)
      handleFormulaChange(newFormula)
      
      // 设置光标位置
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + fieldReference.length, start + fieldReference.length)
      }, 0)
    }
  }

  const insertFunction = (functionName: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      // 为排名函数提供完整的语法模板
      let functionTemplate = functionName + '()'
      if (functionName === 'RANK' || functionName === 'DENSE_RANK') {
        functionTemplate = functionName + '({字段名}, DESC)'
      }
      
      const newFormula = formula.slice(0, start) + functionTemplate + formula.slice(end)
      handleFormulaChange(newFormula)
      
      // 设置光标位置在括号内
      setTimeout(() => {
        textarea.focus()
        const cursorPos = start + functionName.length + 2 // 跳过函数名和开括号
        textarea.setSelectionRange(cursorPos, cursorPos + 3) // 选中"字段名"部分
      }, 0)
    }
  }

  const formatFormula = () => {
    // 简单的格式化逻辑，可以扩展
    const formatted = formula
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s*-\s*/g, ' - ')
      .replace(/\s*\*\s*/g, ' * ')
      .replace(/\s*\/\s*/g, ' / ')
      .replace(/\s*=\s*/g, ' = ')
    handleFormulaChange(formatted)
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'singleLineText':
      case 'longText':
        return <Type className="h-4 w-4" />
      case 'number':
        return <Hash className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'attachment':
        return <Paperclip className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const getFieldTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'text': '文本',
      'singleLineText': '文本',
      'longText': '长文本',
      'number': '数字',
      'singleSelect': '单选',
      'multipleSelect': '多选',
      'date': '日期',
      'attachment': '附件',
      'checkbox': '复选框',
      'rating': '评分',
    }
    return typeMap[type] || type
  }

  const commonFunctions = [
    { name: 'SUM', desc: '求和', example: 'SUM({字段1}, {字段2})' },
    { name: 'AVERAGE', desc: '平均值', example: 'AVERAGE({字段1}, {字段2})' },
    { name: 'IF', desc: '条件判断', example: 'IF({字段} > 100, "大", "小")' },
    { name: 'CONCAT', desc: '文本连接', example: 'CONCAT({字段1}, " - ", {字段2})' },
    { name: 'TODAY', desc: '今天日期', example: 'TODAY()' },
    { name: 'NOW', desc: '当前时间', example: 'NOW()' },
    { name: 'MAX', desc: '最大值', example: 'MAX({字段1}, {字段2})' },
    { name: 'MIN', desc: '最小值', example: 'MIN({字段1}, {字段2})' },
    { name: 'COUNT', desc: '计数', example: 'COUNT({字段1}, {字段2})' },
    { name: 'LEN', desc: '长度', example: 'LEN({文本字段})' },
    { name: 'RANK', desc: '标准排名', example: 'RANK({分数}, DESC)' },
    { name: 'DENSE_RANK', desc: '密集排名', example: 'DENSE_RANK({分数}, DESC)' },
    { name: 'ROW_NUMBER', desc: '行号', example: 'ROW_NUMBER()' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">公式编辑器</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={formatFormula}
                className="text-sm"
              >
                格式优化
              </Button>
              <Button variant="ghost" size="sm" className="text-sm">
                <HelpCircle className="h-4 w-4 mr-1" />
                帮助中心
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* 公式输入区域 */}
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="formula-input">请输入公式</Label>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                id="formula-input"
                placeholder="请输入公式，例如: {字段A} + {字段B}"
                value={formula}
                onChange={(e) => handleFormulaChange(e.target.value)}
                className="h-[120px] font-mono text-sm resize-none"
              />
              <div className="absolute right-2 bottom-2">
                <Button size="sm" onClick={handleSubmit}>
                  确认
                </Button>
              </div>
            </div>
          </div>

          {/* 标签页 */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'ai')} className="flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="edit">编辑公式</TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                AI生成公式
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-4 flex-1 min-h-0 mt-4">
              {/* 左侧面板 - 字段引用 */}
              <div className="w-80 flex flex-col min-h-0">
                {/* 字段引用 */}
                <Card className="flex-1 flex flex-col min-h-0">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-sm font-medium">字段引用</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-1">
                        {availableFields.map((field) => (
                          <div
                            key={field.id}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                              selectedField?.id === field.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => setSelectedField(field)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {getFieldIcon(field.type)}
                              <span className="text-sm font-medium">{field.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {getFieldTypeLabel(field.type)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                insertField(field.name)
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* 整表引用 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">整表引用</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">邮寄地址</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧面板 - 字段详情和函数帮助 */}
              <div className="flex-1 flex flex-col min-h-0">
                <TabsContent value="edit" className="flex-1 flex flex-col min-h-0 m-0">
                  <div className="flex flex-col gap-4 flex-1 min-h-0">
                    {/* 选中字段详情 */}
                    {selectedField && (
                      <Card className="flex-shrink-0">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            {getFieldIcon(selectedField.type)}
                            {getFieldTypeLabel(selectedField.type)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <p className="text-sm text-muted-foreground">
                            数据表的一列，返回当前行中该列对应的值，可用于公式计算
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* 常用函数 */}
                    <Card className="flex-1 flex flex-col min-h-0">
                      <CardHeader className="pb-3 flex-shrink-0">
                        <CardTitle className="text-sm font-medium">常用函数</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 min-h-0">
                        <ScrollArea className="h-full">
                          <div className="p-3 space-y-2">
                            {commonFunctions.map((func) => (
                              <div
                                key={func.name}
                                className="p-3 border rounded-md hover:bg-accent cursor-pointer transition-colors"
                                onClick={() => insertFunction(func.name)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-sm font-medium">{func.name}</span>
                                  <span className="text-xs text-muted-foreground">{func.desc}</span>
                                </div>
                                <code className="text-xs text-muted-foreground">{func.example}</code>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 m-0">
                  <Card className="flex-1 flex flex-col min-h-0">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        AI生成公式
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="ai-prompt">描述你想要的公式</Label>
                          <Textarea
                            id="ai-prompt"
                            placeholder="例如：计算两个数字字段的和，如果结果大于100则显示'高'，否则显示'低'"
                            className="min-h-[120px]"
                          />
                        </div>
                        <Button className="w-full">
                          <Wand2 className="h-4 w-4 mr-2" />
                          生成公式
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
