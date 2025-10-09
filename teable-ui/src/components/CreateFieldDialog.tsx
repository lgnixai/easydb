import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Plus, Type, Hash, Calendar, Link as LinkIcon, Calculator, Sparkles, TrendingUp, Eye } from 'lucide-react'
import {
  // 基础字段配置
  BaseFieldConfig,
  SelectFieldConfig,
  NumberFieldConfig,
  DateFieldConfig,
  // 虚拟字段配置
  AIFieldConfig,
  LookupFieldConfig,
  FormulaFieldConfig,
  RollupFieldConfig,
  // 类型定义
  type BaseFieldConfigValue,
  type SelectFieldConfigValue,
  type NumberFieldConfigValue,
  type DateFieldConfigValue,
  type AIFieldConfigValue,
  type LookupFieldConfigValue,
  type FormulaFieldConfigValue,
  type RollupFieldConfigValue,
} from './field-configs'

/**
 * 字段创建对话框
 * 支持基础字段和虚拟字段（Formula, Lookup, AI, Rollup）的创建
 */

interface Field {
  id: string
  name: string
  type: string
}

interface CreateFieldDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreateField: (fieldData: any) => Promise<void>
  availableFields: Field[]
  trigger?: React.ReactNode
  // 新增：编辑模式
  mode?: 'create' | 'edit'
  initialValue?: {
    id?: string
    name: string
    type: string
    description?: string
    options?: any
  }
  onUpdateField?: (fieldId: string, updates: any) => Promise<void>
}

export function CreateFieldDialog({
  open,
  onOpenChange,
  onCreateField,
  availableFields,
  trigger,
  mode = 'create',
  initialValue,
  onUpdateField,
}: CreateFieldDialogProps) {
  const [fieldName, setFieldName] = useState(initialValue?.name ?? '')
  const [fieldType, setFieldType] = useState<string>(initialValue?.type ?? 'singleLineText')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [isCreating, setIsCreating] = useState(false)

  // 当initialValue变化时更新状态
  useEffect(() => {
    if (initialValue) {
      setFieldName(initialValue.name ?? '')
      setFieldType(initialValue.type ?? 'singleLineText')
      setDescription(initialValue.description ?? '')
      
      // 如果是编辑模式且有options，尝试恢复配置
      if (mode === 'edit' && initialValue.options) {
        try {
          const options = typeof initialValue.options === 'string' 
            ? JSON.parse(initialValue.options) 
            : initialValue.options
          
          // 根据字段类型设置相应的配置
          const fieldType = initialValue.type ?? 'singleLineText'
          if (['singleLineText', 'longText', 'checkbox', 'rating'].includes(fieldType)) {
            setBaseConfig(options)
          } else if (['singleSelect', 'multipleSelect'].includes(fieldType)) {
            setSelectConfig(options)
          } else if (fieldType === 'number') {
            setNumberConfig(options)
          } else if (fieldType === 'date') {
            setDateConfig(options)
          } else if (fieldType === 'ai') {
            setAiConfig(options)
          } else if (fieldType === 'lookup') {
            setLookupConfig(options)
          } else if (fieldType === 'formula') {
            setFormulaConfig(options)
          } else if (fieldType === 'rollup') {
            setRollupConfig(options)
          }
        } catch (e) {
          console.warn('无法解析字段选项配置:', e)
        }
      }
    }
  }, [initialValue, mode])

  // 当字段类型更改时重置相关配置状态
  useEffect(() => {
    // 重置所有配置状态，让用户重新配置新类型
    setBaseConfig(undefined)
    setSelectConfig(undefined)
    setNumberConfig(undefined)
    setDateConfig(undefined)
    setAiConfig(undefined)
    setLookupConfig(undefined)
    setFormulaConfig(undefined)
    setRollupConfig(undefined)
  }, [fieldType])

  // 基础字段配置
  const [baseConfig, setBaseConfig] = useState<BaseFieldConfigValue | undefined>()
  const [selectConfig, setSelectConfig] = useState<SelectFieldConfigValue | undefined>()
  const [numberConfig, setNumberConfig] = useState<NumberFieldConfigValue | undefined>()
  const [dateConfig, setDateConfig] = useState<DateFieldConfigValue | undefined>()
  
  // 虚拟字段配置
  const [aiConfig, setAiConfig] = useState<AIFieldConfigValue | undefined>()
  const [lookupConfig, setLookupConfig] = useState<LookupFieldConfigValue | undefined>()
  const [formulaConfig, setFormulaConfig] = useState<FormulaFieldConfigValue | undefined>()
  const [rollupConfig, setRollupConfig] = useState<RollupFieldConfigValue | undefined>()

  const baseFieldTypes = [
    { value: 'singleLineText', label: '单行文本', icon: Type, desc: '简短的文本' },
    { value: 'longText', label: '长文本', icon: Type, desc: '多行文本' },
    { value: 'number', label: '数字', icon: Hash, desc: '整数或小数' },
    { value: 'singleSelect', label: '单选', icon: Type, desc: '从选项中选择一个' },
    { value: 'multipleSelect', label: '多选', icon: Type, desc: '从选项中选择多个' },
    { value: 'date', label: '日期', icon: Calendar, desc: '日期或时间' },
    { value: 'checkbox', label: '复选框', icon: Type, desc: '是/否' },
    { value: 'rating', label: '评分', icon: Type, desc: '星级评分' },
    { value: 'link', label: '关联', icon: LinkIcon, desc: '关联到其他表' },
  ]

  const virtualFieldTypes = [
    { value: 'formula', label: 'Formula', icon: Calculator, desc: '公式计算', color: 'text-green-500' },
    { value: 'lookup', label: 'Lookup', icon: Eye, desc: '查找关联数据', color: 'text-blue-500' },
    { value: 'rollup', label: 'Rollup', icon: TrendingUp, desc: '汇总统计', color: 'text-orange-500' },
    { value: 'ai', label: 'AI', icon: Sparkles, desc: 'AI生成内容', color: 'text-purple-500' },
  ]

  const handleCreate = async () => {
    if (!fieldName.trim()) {
      alert('请输入字段名称')
      return
    }

    setIsCreating(true)
    try {
      const fieldData: any = {
        name: fieldName,
        type: fieldType,
        description: description || undefined,
      }

      // 根据字段类型添加相应的配置
      switch (fieldType) {
        // 基础字段配置
        case 'singleLineText':
        case 'longText':
        case 'checkbox':
        case 'rating':
          if (baseConfig) {
            fieldData.options = JSON.stringify(baseConfig)
          }
          break
        case 'singleSelect':
        case 'multipleSelect':
          if (selectConfig) {
            fieldData.options = JSON.stringify(selectConfig)
          }
          break
        case 'number':
          if (numberConfig) {
            fieldData.options = JSON.stringify(numberConfig)
          }
          break
        case 'date':
          if (dateConfig) {
            fieldData.options = JSON.stringify(dateConfig)
          }
          break
        // 虚拟字段配置
        case 'ai':
          if (aiConfig) {
            fieldData.ai_config = JSON.stringify(aiConfig)
            fieldData.is_computed = true
          }
          break
        case 'lookup':
          if (lookupConfig) {
            fieldData.is_lookup = true
            fieldData.lookup_options = JSON.stringify(lookupConfig)
            fieldData.is_computed = true
          }
          break
        case 'formula':
          if (formulaConfig) {
            fieldData.options = JSON.stringify(formulaConfig)
            fieldData.is_computed = true
          }
          break
        case 'rollup':
          if (rollupConfig) {
            fieldData.options = JSON.stringify(rollupConfig)
            fieldData.is_computed = true
          }
          break
      }

      if (mode === 'edit' && initialValue?.id && onUpdateField) {
        await onUpdateField(initialValue.id, fieldData)
      } else {
        await onCreateField(fieldData)
      }

      // 重置表单
      setFieldName('')
      setFieldType('singleLineText')
      setDescription('')
      setBaseConfig(undefined)
      setSelectConfig(undefined)
      setNumberConfig(undefined)
      setDateConfig(undefined)
      setAiConfig(undefined)
      setLookupConfig(undefined)
      setFormulaConfig(undefined)
      setRollupConfig(undefined)
      onOpenChange?.(false)
    } catch (error) {
      console.error('创建字段失败:', error)
      alert('创建字段失败: ' + (error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  const isVirtualField = ['formula', 'lookup', 'rollup', 'ai'].includes(fieldType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? '编辑字段' : '创建新字段'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? '修改字段的属性和配置' 
              : isVirtualField ? '虚拟字段会根据其他字段自动计算' : '选择字段类型并配置'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 基本信息 */}
          <div className="space-y-2">
            <Label htmlFor="fieldName">字段名称</Label>
            <Input
              id="fieldName"
              placeholder="输入字段名称"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Input
              id="description"
              placeholder="字段描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 字段类型选择 */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基础字段</TabsTrigger>
              <TabsTrigger value="virtual">虚拟字段</TabsTrigger>
            </TabsList>
            
            {/* 编辑模式下显示当前字段类型 */}
            {mode === 'edit' && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                💡 当前字段类型: {baseFieldTypes.find(t => t.value === fieldType)?.label || 
                             virtualFieldTypes.find(t => t.value === fieldType)?.label || 
                             fieldType} - 您可以更改字段类型
              </div>
            )}

            {/* 基础字段类型 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {baseFieldTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      className={`p-3 border rounded-lg text-left hover:bg-accent transition-colors ${
                        fieldType === type.value ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setFieldType(type.value)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* 基础字段配置 */}
              <div className="mt-6">
                {/* 文本类型字段配置 */}
                {['singleLineText', 'longText', 'checkbox', 'rating'].includes(fieldType) && (
                  <BaseFieldConfig
                    value={baseConfig}
                    onChange={setBaseConfig}
                    fieldType={fieldType as 'singleLineText' | 'longText' | 'checkbox' | 'rating'}
                  />
                )}

                {/* 选择类型字段配置 */}
                {['singleSelect', 'multipleSelect'].includes(fieldType) && (
                  <SelectFieldConfig
                    value={selectConfig}
                    onChange={setSelectConfig}
                    fieldType={fieldType as 'singleSelect' | 'multipleSelect'}
                  />
                )}

                {/* 数字字段配置 */}
                {fieldType === 'number' && (
                  <NumberFieldConfig
                    value={numberConfig}
                    onChange={setNumberConfig}
                  />
                )}

                {/* 日期字段配置 */}
                {fieldType === 'date' && (
                  <DateFieldConfig
                    value={dateConfig}
                    onChange={setDateConfig}
                  />
                )}
              </div>
            </TabsContent>

            {/* 虚拟字段类型 */}
            <TabsContent value="virtual" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {virtualFieldTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      className={`p-4 border rounded-lg text-left hover:bg-accent transition-colors ${
                        fieldType === type.value ? 'border-primary bg-accent' : ''
                      }`}
                      onClick={() => setFieldType(type.value)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`h-5 w-5 ${type.color}`} />
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* 虚拟字段配置 */}
              <div className="mt-6">
                {fieldType === 'ai' && (
                  <AIFieldConfig
                    value={aiConfig}
                    onChange={setAiConfig}
                    availableFields={availableFields}
                  />
                )}
                {fieldType === 'lookup' && (
                  <LookupFieldConfig
                    value={lookupConfig}
                    onChange={setLookupConfig}
                    availableFields={availableFields}
                  />
                )}
                {fieldType === 'formula' && (
                  <FormulaFieldConfig
                    value={formulaConfig}
                    onChange={setFormulaConfig}
                    availableFields={availableFields}
                  />
                )}
                {fieldType === 'rollup' && (
                  <RollupFieldConfig
                    value={rollupConfig}
                    onChange={setRollupConfig}
                    availableFields={availableFields}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating 
              ? (mode === 'edit' ? '保存中...' : '创建中...') 
              : (mode === 'edit' ? '保存' : '创建字段')
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateFieldDialog
