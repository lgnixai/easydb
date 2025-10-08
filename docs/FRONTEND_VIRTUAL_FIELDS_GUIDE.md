# 📱 前端虚拟字段集成指南

## 🎯 概览

本指南介绍如何在前端使用虚拟字段功能，包括 Formula（公式）、Lookup（查找）、Rollup（汇总）和 AI 字段。

## 📦 新增组件

### 1. 字段类型映射

**文件**: `teable-ui/src/lib/field-type-mapping.ts`

新增字段类型：
- `lookup` - Lookup字段
- `ai` - AI字段

```typescript
export type FrontFieldType =
  | 'singleLineText'
  | 'longText'
  | 'number'
  // ... 其他类型
  | 'formula'
  | 'rollup'
  | 'lookup'  // 新增
  | 'ai'      // 新增
```

### 2. 虚拟字段配置组件

#### AIFieldConfig

**文件**: `teable-ui/src/components/field-configs/AIFieldConfig.tsx`

配置AI字段的提示词、操作类型和引用字段。

```typescript
import AIFieldConfig, { AIFieldConfigValue } from './field-configs/AIFieldConfig'

const [aiConfig, setAiConfig] = useState<AIFieldConfigValue>({
  operation: 'generate',
  prompt: '根据 {{description}} 生成摘要',
  referenceFields: ['field-id-1', 'field-id-2'],
  temperature: 0.7,
  maxTokens: 500,
})

<AIFieldConfig
  value={aiConfig}
  onChange={setAiConfig}
  availableFields={fields}
/>
```

**配置项**：
- `operation`: AI操作类型 (`generate` | `classify` | `extract` | `summarize` | `translate`)
- `prompt`: AI提示词（使用 `{{field_name}}` 引用字段）
- `referenceFields`: 引用的字段ID列表
- `temperature`: 温度参数（0-2）
- `maxTokens`: 最大Token数
- `model`: AI模型（可选）

#### LookupFieldConfig

**文件**: `teable-ui/src/components/field-configs/LookupFieldConfig.tsx`

配置从关联表中查找值。

```typescript
import LookupFieldConfig, { LookupFieldConfigValue } from './field-configs/LookupFieldConfig'

const [lookupConfig, setLookupConfig] = useState<LookupFieldConfigValue>({
  linkFieldId: 'field-link-id',
  lookupFieldId: 'field-to-lookup-id',
  multiple: false,
})

<LookupFieldConfig
  value={lookupConfig}
  onChange={setLookupConfig}
  availableFields={fields}
  linkedTableFields={linkedFields}
/>
```

**配置项**：
- `linkFieldId`: 关联字段ID（必须是Link类型）
- `lookupFieldId`: 要查找的字段ID
- `multiple`: 是否允许多个值

#### FormulaFieldConfig

**文件**: `teable-ui/src/components/field-configs/FormulaFieldConfig.tsx`

配置公式计算。

```typescript
import FormulaFieldConfig, { FormulaFieldConfigValue } from './field-configs/FormulaFieldConfig'

const [formulaConfig, setFormulaConfig] = useState<FormulaFieldConfigValue>({
  expression: '{field1} + {field2}',
  returnType: 'number',
})

<FormulaFieldConfig
  value={formulaConfig}
  onChange={setFormulaConfig}
  availableFields={fields}
/>
```

**配置项**：
- `expression`: 公式表达式
- `returnType`: 返回类型（`text` | `number` | `boolean` | `date`）

#### RollupFieldConfig

**文件**: `teable-ui/src/components/field-configs/RollupFieldConfig.tsx`

配置汇总计算。

```typescript
import RollupFieldConfig, { RollupFieldConfigValue } from './field-configs/RollupFieldConfig'

const [rollupConfig, setRollupConfig] = useState<RollupFieldConfigValue>({
  linkFieldId: 'field-link-id',
  rollupFieldId: 'field-to-rollup-id',
  aggregation: 'sum',
})

<RollupFieldConfig
  value={rollupConfig}
  onChange={setRollupConfig}
  availableFields={fields}
  linkedTableFields={linkedFields}
/>
```

**配置项**：
- `linkFieldId`: 关联字段ID
- `rollupFieldId`: 要汇总的字段ID
- `aggregation`: 汇总方式（`count` | `sum` | `average` | `min` | `max` | `concatenate`）

### 3. 字段创建对话框

**文件**: `teable-ui/src/components/CreateFieldDialog.tsx`

集成了所有虚拟字段配置的字段创建对话框。

```typescript
import CreateFieldDialog from './components/CreateFieldDialog'

<CreateFieldDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  onCreateField={async (fieldData) => {
    // 创建字段的API调用
    await teable.createField({
      table_id: tableId,
      ...fieldData,
    })
  }}
  availableFields={fields}
  trigger={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      添加字段
    </Button>
  }
/>
```

### 4. 虚拟字段单元格渲染

**文件**: `teable-ui/src/components/VirtualFieldCell.tsx`

显示虚拟字段的计算结果和状态。

```typescript
import VirtualFieldCell, { VirtualFieldBadge } from './components/VirtualFieldCell'

// 单元格渲染
<VirtualFieldCell
  value={cellValue}
  fieldType="ai"
  isPending={field.is_pending}
  hasError={field.has_error}
  errorMessage={field.error_message}
/>

// 字段标签（用于列标题等）
<VirtualFieldBadge
  fieldType="formula"
  isPending={field.is_pending}
  hasError={field.has_error}
/>
```

### 5. 虚拟字段API

**文件**: `teable-ui/src/lib/virtual-field-api.ts`

提供虚拟字段计算和状态查询的API。

```typescript
import {
  calculateVirtualField,
  getVirtualFieldInfo,
  calculateVirtualFieldsBatch,
  VirtualFieldStatusMonitor,
  useVirtualFieldCalculation,
} from './lib/virtual-field-api'

// 1. 触发单个字段计算
const result = await calculateVirtualField(fieldId, {
  force: true,
  token: userToken,
})

// 2. 获取字段信息
const info = await getVirtualFieldInfo(fieldId, userToken)
console.log(info.is_pending, info.has_error)

// 3. 批量计算多个字段
const batchResult = await calculateVirtualFieldsBatch(
  ['field-1', 'field-2', 'field-3'],
  { token: userToken }
)

// 4. 监听字段状态变化
const monitor = new VirtualFieldStatusMonitor(
  fieldId,
  (info) => {
    console.log('字段状态更新:', info)
    if (!info.is_pending) {
      console.log('计算完成!')
    }
  },
  userToken
)
monitor.start(2000) // 每2秒轮询一次
// monitor.stop() // 停止监听

// 5. 使用React Hook
function MyComponent({ fieldId }) {
  const { calculate, isCalculating, error } = useVirtualFieldCalculation(fieldId, token)
  
  return (
    <button
      onClick={() => calculate(true)}
      disabled={isCalculating}
    >
      {isCalculating ? '计算中...' : '重新计算'}
    </button>
  )
}
```

## 🚀 完整使用示例

### 示例 1: 创建AI字段

```typescript
import { useState } from 'react'
import CreateFieldDialog from './components/CreateFieldDialog'
import teable from './lib/teable-simple'

function TableView({ tableId, fields }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateField = async (fieldData) => {
    try {
      const response = await teable.createField({
        table_id: tableId,
        ...fieldData,
      })
      
      console.log('字段创建成功:', response.data)
      
      // 如果是虚拟字段，可以立即触发计算
      if (fieldData.is_computed) {
        await calculateVirtualField(response.data.id)
      }
    } catch (error) {
      console.error('创建字段失败:', error)
      throw error
    }
  }

  return (
    <div>
      <CreateFieldDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateField={handleCreateField}
        availableFields={fields}
        trigger={<button>添加字段</button>}
      />
    </div>
  )
}
```

### 示例 2: 显示虚拟字段状态

```typescript
import { useEffect, useState } from 'react'
import VirtualFieldCell from './components/VirtualFieldCell'
import { getVirtualFieldInfo, VirtualFieldStatusMonitor } from './lib/virtual-field-api'

function VirtualFieldDisplay({ fieldId, value }) {
  const [fieldInfo, setFieldInfo] = useState(null)

  useEffect(() => {
    // 加载字段信息
    getVirtualFieldInfo(fieldId).then(setFieldInfo)

    // 如果字段正在计算，启动监听
    if (fieldInfo?.is_pending) {
      const monitor = new VirtualFieldStatusMonitor(fieldId, setFieldInfo)
      monitor.start()
      
      return () => monitor.stop()
    }
  }, [fieldId])

  if (!fieldInfo) return <div>加载中...</div>

  return (
    <VirtualFieldCell
      value={value}
      fieldType={fieldInfo.field_type}
      isPending={fieldInfo.is_pending}
      hasError={fieldInfo.has_error}
      errorMessage={fieldInfo.error_message}
    />
  )
}
```

### 示例 3: 在表格中集成

```typescript
import { useMemo } from 'react'
import { Grid } from '@teable/grid-table-kanban'
import VirtualFieldCell from './components/VirtualFieldCell'
import { mapBackendTypeToFieldType } from './lib/field-type-mapping'

function TableGrid({ fields, records }) {
  const columns = useMemo(() => {
    return fields.map((field) => ({
      id: field.id,
      name: field.name,
      width: 200,
      hasMenu: true,
    }))
  }, [fields])

  const getCellContent = (cell) => {
    const field = fields.find((f) => f.id === cell.columnId)
    const fieldType = mapBackendTypeToFieldType(field.type)

    // 如果是虚拟字段，使用特殊渲染器
    if (['formula', 'lookup', 'rollup', 'ai'].includes(fieldType)) {
      return {
        kind: 'custom',
        copyData: String(cell.value || ''),
        allowOverlay: false,
        readonly: true,
        data: (
          <VirtualFieldCell
            value={cell.value}
            fieldType={fieldType}
            isPending={field.is_pending}
            hasError={field.has_error}
            errorMessage={field.error_message}
          />
        ),
      }
    }

    // 普通字段使用标准渲染
    return {
      kind: 'text',
      data: String(cell.value || ''),
      displayData: String(cell.value || ''),
      allowOverlay: true,
      readonly: field.is_system || field.read_only,
    }
  }

  return (
    <Grid
      columns={columns}
      getCellContent={getCellContent}
      // ... 其他属性
    />
  )
}
```

## 🎨 UI 特性

### 字段类型图标和颜色

- **Formula**: 绿色 🟢 计算器图标
- **Lookup**: 蓝色 🔵 眼睛图标
- **Rollup**: 橙色 🟠 趋势图标
- **AI**: 紫色 🟣 星星图标

### 状态指示

- **计算中** (Pending): 旋转的加载器图标
- **错误** (Error): 红色警告图标，悬停显示错误信息
- **正常**: 显示计算结果

## 🔧 API端点

### 后端API

1. **创建字段**
   - `POST /api/fields`
   - Body: `{ table_id, name, type, ai_config?, lookup_options?, ... }`

2. **触发虚拟字段计算**
   - `POST /api/fields/:id/calculate`
   - Body: `{ force?: boolean }`

3. **获取虚拟字段信息**
   - `GET /api/fields/:id/virtual-info`

## 📝 最佳实践

### 1. 性能优化

```typescript
// 使用批量计算代替单个计算
const virtualFieldIds = fields
  .filter(f => f.is_computed)
  .map(f => f.id)

await calculateVirtualFieldsBatch(virtualFieldIds)
```

### 2. 错误处理

```typescript
try {
  await calculateVirtualField(fieldId, { force: true })
} catch (error) {
  toast.error(`计算失败: ${error.message}`)
}
```

### 3. 用户体验

```typescript
// 显示计算进度
const [calculating, setCalculating] = useState(false)

const handleCalculate = async () => {
  setCalculating(true)
  try {
    await calculateVirtualField(fieldId)
    toast.success('计算完成')
  } catch (error) {
    toast.error('计算失败')
  } finally {
    setCalculating(false)
  }
}
```

### 4. 实时更新

```typescript
// 使用WebSocket或轮询获取实时状态
useEffect(() => {
  const monitor = new VirtualFieldStatusMonitor(
    fieldId,
    (info) => {
      // 更新UI
      setFieldInfo(info)
    }
  )
  
  monitor.start(2000)
  return () => monitor.stop()
}, [fieldId])
```

## 🐛 常见问题

### Q: 虚拟字段不能编辑？

A: 这是正常的。虚拟字段是只读的，它们的值由系统自动计算。

### Q: AI字段计算很慢？

A: AI字段需要调用AI API，可能需要几秒到几十秒。使用 `VirtualFieldStatusMonitor` 监听计算状态。

### Q: 如何强制重新计算？

```typescript
await calculateVirtualField(fieldId, { force: true })
```

### Q: 如何处理循环依赖？

A: 后端会自动检测并拒绝创建会导致循环依赖的字段。前端应该显示相应的错误信息。

## 🎯 下一步

- [ ] 添加虚拟字段的批量编辑功能
- [ ] 实现虚拟字段的依赖关系可视化
- [ ] 添加AI字段的提示词模板库
- [ ] 实现公式编辑器的智能提示
- [ ] 添加虚拟字段的性能监控

## 📚 相关文档

- [后端虚拟字段实现](./AI_VIRTUAL_FIELDS_IMPLEMENTATION_SUMMARY.md)
- [API文档](./API_GUIDE_VIRTUAL_FIELDS.md)
- [数据库迁移](./HOW_TO_MIGRATE.md)

---

**更新时间**: 2025-10-08  
**版本**: 1.0.0  
**状态**: ✅ 完成

