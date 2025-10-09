import { useState } from 'react'
import { Button } from './ui/button'
import FormulaEditorDialog from './FormulaEditorDialog'

export default function FormulaEditorTest() {
  const [isOpen, setIsOpen] = useState(false)
  const [formula, setFormula] = useState('')

  // 模拟字段数据
  const availableFields = [
    { id: '1', name: '员工姓名', type: 'text' },
    { id: '2', name: '年龄', type: 'number' },
    { id: '3', name: '性别', type: 'singleSelect' },
    { id: '4', name: '科目', type: 'singleSelect' },
    { id: '5', name: '名次', type: 'text' },
    { id: '6', name: '分数', type: 'number' },
    { id: '7', name: '部门', type: 'singleSelect' },
    { id: '8', name: '入职日期', type: 'date' },
    { id: '9', name: '工资', type: 'number' },
    { id: '10', name: '绩效', type: 'rating' },
    { id: '11', name: '备注', type: 'longText' },
    { id: '12', name: '联系方式', type: 'text' },
    { id: '13', name: '学历', type: 'singleSelect' },
    { id: '14', name: '工作经验', type: 'number' },
    { id: '15', name: '技能', type: 'multipleSelect' },
  ]

  const handleFormulaSubmit = (newFormula: string) => {
    setFormula(newFormula)
    console.log('提交的公式:', newFormula)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">公式编辑器滚动测试</h1>
        
        <div className="space-y-4">
          <Button onClick={() => setIsOpen(true)}>
            打开公式编辑器
          </Button>
          
          {formula && (
            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">当前公式：</h3>
              <code className="text-sm bg-white p-2 rounded border">
                {formula}
              </code>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <h3 className="font-medium">测试说明：</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>点击"打开公式编辑器"按钮</li>
            <li>检查左侧"字段引用"列表是否可以滚动</li>
            <li>检查右侧"常用函数"列表是否可以滚动</li>
            <li>尝试添加字段和函数到公式中</li>
            <li>测试AI生成公式标签页</li>
          </ul>
        </div>

        <FormulaEditorDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          value={formula}
          onChange={setFormula}
          availableFields={availableFields}
          onSubmit={handleFormulaSubmit}
        />
      </div>
    </div>
  )
}