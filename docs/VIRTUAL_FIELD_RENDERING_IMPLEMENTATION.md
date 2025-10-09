# 虚拟字段渲染实现文档

## 概述

本文档说明了我们系统中虚拟字段渲染的实现方案，该方案参考了 teable-develop 系统的设计。

## 核心概念

### 虚拟字段 (Virtual Field)

虚拟字段是一种计算字段，其值是基于其他字段或关联记录动态计算得出的。主要类型包括：

1. **Formula（公式字段）**: 基于表达式计算其他字段的值
2. **Lookup（查找字段）**: 从关联记录中查找并显示字段值
3. **Rollup（汇总字段）**: 对关联记录的字段值进行聚合计算
4. **AI（AI字段）**: 使用AI生成或处理内容

### 虚拟字段实例 (Field Instance)

在计算 Rollup/Lookup 字段时，需要创建临时的虚拟字段实例来表示被查找或汇总的字段。这个虚拟字段实例：

- ID 固定为 `values`
- 用于在 rollup 表达式中引用（如 `sum({values})`）
- 继承源字段的 `cellValueType` 和 `isMultipleCellValue` 属性

## 架构设计

### 后端实现

```
┌─────────────────────────────────────────────────────────────┐
│                  VirtualFieldService                        │
│  - 管理虚拟字段计算                                          │
│  - 注册字段处理器                                            │
│  - 缓存计算结果                                              │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────────┬──────────────────┬──────────┐
             │                  │                  │          │
   ┌─────────▼──────┐  ┌───────▼───────┐  ┌──────▼─────┐  ┌─▼──────┐
   │ Formula        │  │   Lookup      │  │  Rollup    │  │   AI   │
   │ Handler        │  │   Handler     │  │  Handler   │  │ Handler│
   └────────────────┘  └───────────────┘  └────────────┘  └────────┘
                                │                │
                                └────────┬───────┘
                                         │
                              ┌──────────▼──────────┐
                              │ FieldInstanceFactory│
                              │ - 创建虚拟字段实例    │
                              │ - ID固定为'values'  │
                              └─────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ FormulaEvaluator    │
                              │ - 评估表达式         │
                              │ - 支持聚合函数       │
                              └─────────────────────┘
```

### 前端实现

```
┌─────────────────────────────────────────────────────────────┐
│                   VirtualFieldCell                          │
│  - 渲染虚拟字段单元格                                         │
│  - 显示计算状态                                              │
│  - 格式化显示值                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
         ┌─────────▼─────────┐  ┌───────▼────────┐
         │  VirtualFieldBadge│  │ virtual-field  │
         │  - 字段类型标签    │  │ -api.ts        │
         └───────────────────┘  │ - API集成      │
                                └────────────────┘
```

## 关键实现

### 1. 字段实例工厂 (`field_instance_factory.go`)

```go
// 创建虚拟字段实例（用于 rollup/lookup 计算）
func (f *FieldInstanceFactory) CreateVirtualFieldInstance(
    sourceField *Field,
    isMultipleCellValue bool,
) *FieldInstance {
    return &FieldInstance{
        ID:                  "values", // 固定ID
        Name:                "values", // 固定名称
        Type:                sourceField.Type,
        CellValueType:       string(sourceField.CellValueType),
        IsMultipleCellValue: isMultipleCellValue,
        IsVirtual:           true,
    }
}
```

### 2. Rollup 字段处理器 (`field_handler_rollup.go`)

```go
func (h *RollupFieldHandler) Calculate(ctx CalculationContext) (interface{}, error) {
    // 1. 获取关联记录
    linkedRecords, err := h.getLinkedRecords(...)
    
    // 2. 创建虚拟字段实例（ID='values'）
    factory := NewFieldInstanceFactory()
    virtualField := factory.CreateVirtualFieldInstance(rollupField, isMultiple)
    
    // 3. 构建字段映射，包含虚拟字段
    fieldMap := CreateFieldInstanceMap(ctx.Table.GetFields())
    fieldMap.AddVirtualField(virtualField)
    
    // 4. 准备记录数据，包含虚拟字段的值
    calcRecordData := make(map[string]interface{})
    calcRecordData["values"] = flatValues
    
    // 5. 使用公式计算器评估表达式
    result, err := h.formulaEvaluator.Evaluate(expression, fieldMap, calcRecordData)
    
    return result, nil
}
```

### 3. Lookup 字段处理器 (`field_handler_lookup.go`)

```go
func (h *LookupFieldHandler) Calculate(ctx CalculationContext) (interface{}, error) {
    // 1. 获取关联记录
    linkedRecords, err := h.getLinkedRecords(...)
    
    // 2. 创建虚拟字段实例
    factory := NewFieldInstanceFactory()
    virtualField := factory.CreateVirtualFieldInstance(lookupField, len(linkedRecords) > 1)
    
    // 3. 从关联记录中提取值
    values := extractValues(linkedRecords, lookupField)
    
    // 4. 根据处理方式返回结果
    return h.handleMultipleValues(values, lookupOpts.MultipleRecordHandling, virtualField)
}
```

### 4. 公式评估器 (`formula_evaluator.go`)

```go
func (e *DefaultFormulaEvaluator) Evaluate(
    expression string,
    fieldMap FieldInstanceMap,
    recordData map[string]interface{},
) (interface{}, error) {
    // 支持聚合函数（如 sum({values}), count({values}）
    if e.isAggregateFunction(expression) {
        return e.evaluateAggregateFunction(expression, fieldMap, recordData)
    }
    
    // 支持普通表达式
    preparedExpr, err := e.prepareExpression(expression, fieldMap, recordData)
    result, err := e.evaluateExpression(preparedExpr)
    
    return result, nil
}
```

### 5. 前端虚拟字段单元格 (`VirtualFieldCell.tsx`)

```tsx
export default function VirtualFieldCell({
  value,
  fieldType,
  metadata,
}: VirtualFieldCellProps) {
  // 标准化字段类型（处理 virtual_ 前缀）
  const normalizedFieldType = fieldType.replace('virtual_', '')
  
  // 格式化显示值
  const formatValue = (val: any): string => {
    if (Array.isArray(val)) {
      if (metadata?.isMultiple) {
        return val.map(v => formatSingleValue(v)).join(', ')
      }
      return val.length > 0 ? formatSingleValue(val[0]) : ''
    }
    return formatSingleValue(val)
  }
  
  // 根据聚合函数格式化数字
  const formatSingleValue = (val: any): string => {
    if (typeof val === 'number') {
      if (metadata?.aggregationFunction === 'count') {
        return Math.floor(val).toString()
      }
      return Number.isInteger(val) ? val.toString() : val.toFixed(2)
    }
    return String(val)
  }
  
  return (
    <div className="flex items-center gap-2">
      <FieldIcon className={color} />
      <span>{formatValue(value)}</span>
    </div>
  )
}
```

## 使用示例

### 1. 创建 Lookup 字段

```go
lookupField := &Field{
    Name: "关联产品名称",
    Type: FieldTypeVirtualLookup,
    Options: &FieldOptions{
        // 配置会被解析为 LookupFieldOptions
    },
}

// Options 内容示例
lookupOptions := LookupFieldOptions{
    LinkFieldID:            "link_field_id",
    LookupFieldID:          "product_name_field_id",
    MultipleRecordHandling: "comma_separated",
}
```

### 2. 创建 Rollup 字段

```go
rollupField := &Field{
    Name: "产品总价",
    Type: FieldTypeVirtualRollup,
    Options: &FieldOptions{
        // 配置会被解析为 RollupFieldOptions
    },
}

// Options 内容示例
rollupOptions := RollupFieldOptions{
    LinkFieldID:         "link_field_id",
    RollupFieldID:       "price_field_id",
    AggregationFunction: "sum",
    FilterExpression:    "", // 可选
}
```

### 3. 前端显示虚拟字段

```tsx
import VirtualFieldCell, { VirtualFieldBadge } from './components/VirtualFieldCell'

// 在表格单元格中使用
<VirtualFieldCell
  value={record.field_value}
  fieldType="virtual_rollup"
  isPending={field.is_pending}
  hasError={field.has_error}
  errorMessage={field.error_message}
  metadata={{
    sourceFieldType: 'number',
    isMultiple: false,
    aggregationFunction: 'sum',
  }}
/>

// 在字段标题中使用
<VirtualFieldBadge
  fieldType="virtual_lookup"
  isPending={field.is_pending}
  hasError={field.has_error}
/>
```

## 支持的聚合函数

以下聚合函数在 Rollup 字段中可用：

### 数值聚合
- `sum({values})` - 求和
- `average({values})` / `avg({values})` - 平均值
- `min({values})` - 最小值
- `max({values})` - 最大值

### 计数聚合
- `count({values})` - 计数（仅数值）
- `countall({values})` - 计数所有
- `counta({values})` - 计数非空值

### 逻辑聚合
- `and({values})` - 逻辑与
- `or({values})` - 逻辑或
- `xor({values})` - 逻辑异或

### 数组操作
- `array_join({values})` - 连接为字符串
- `array_unique({values})` - 去重
- `array_compact({values})` - 移除空值
- `concatenate({values})` - 拼接

## 与 teable-develop 的对比

### 相同点

1. **虚拟字段实例创建**：使用相同的方式创建 ID 为 `values` 的虚拟字段实例
2. **字段映射**：在计算时将虚拟字段添加到字段映射中
3. **记录数据准备**：将查找/汇总的值赋给 `values` 字段
4. **表达式评估**：支持在表达式中引用 `{values}`

### 差异点

1. **语言实现**：我们使用 Go，teable-develop 使用 TypeScript
2. **公式引擎**：我们使用 `govaluate`，teable-develop 使用自定义解析器
3. **字段类型命名**：我们使用 `virtual_` 前缀（如 `virtual_rollup`）

## 最佳实践

### 1. 性能优化

- 使用缓存避免重复计算
- 批量处理关联记录查询
- 异步计算大量虚拟字段

### 2. 错误处理

- 优雅处理计算错误
- 在 UI 中显示错误信息
- 提供重试机制

### 3. 用户体验

- 显示计算状态（pending/success/error）
- 使用图标区分虚拟字段类型
- 格式化显示计算结果

## 测试建议

### 单元测试

```go
func TestRollupFieldCalculation(t *testing.T) {
    // 准备测试数据
    table := createTestTable()
    rollupField := createRollupField()
    linkedRecords := createLinkedRecords()
    
    // 执行计算
    handler := NewRollupFieldHandler(recordService, evaluator)
    result, err := handler.Calculate(ctx)
    
    // 验证结果
    assert.NoError(t, err)
    assert.Equal(t, expectedResult, result)
}
```

### 集成测试

```go
func TestVirtualFieldEndToEnd(t *testing.T) {
    // 1. 创建表和字段
    // 2. 添加记录
    // 3. 创建虚拟字段
    // 4. 验证计算结果
    // 5. 更新源数据
    // 6. 验证虚拟字段自动更新
}
```

## 未来改进

1. **性能优化**
   - 实现增量计算
   - 添加计算队列
   - 优化缓存策略

2. **功能增强**
   - 支持更多聚合函数
   - 支持嵌套虚拟字段
   - 支持条件过滤

3. **用户体验**
   - 可视化公式编辑器
   - 实时预览计算结果
   - 依赖关系可视化

## 相关文件

### 后端
- `server/internal/domain/table/field_instance_factory.go` - 字段实例工厂
- `server/internal/domain/table/field_handler_lookup.go` - Lookup 处理器
- `server/internal/domain/table/field_handler_rollup.go` - Rollup 处理器
- `server/internal/domain/table/formula_evaluator.go` - 公式评估器
- `server/internal/domain/table/virtual_field_service.go` - 虚拟字段服务

### 前端
- `teable-ui/src/components/VirtualFieldCell.tsx` - 虚拟字段单元格组件
- `teable-ui/src/lib/virtual-field-api.ts` - 虚拟字段 API

### 文档
- `docs/FRONTEND_VIRTUAL_FIELDS_GUIDE.md` - 前端虚拟字段指南
- `docs/FRONTEND_VIRTUAL_FIELDS_SUMMARY.md` - 前端虚拟字段总结
- `docs/VIRTUAL_FIELD_RENDERING_IMPLEMENTATION.md` - 本文档

## 总结

本实现成功地参考了 teable-develop 系统的虚拟字段渲染方案，实现了：

1. ✅ 虚拟字段实例创建机制
2. ✅ Lookup 和 Rollup 字段的完整计算逻辑
3. ✅ 公式评估器支持虚拟字段引用
4. ✅ 前端组件增强显示虚拟字段
5. ✅ 完整的文档和示例

这为我们的系统提供了强大的虚拟字段功能，用户可以方便地从关联记录中查找值或进行聚合计算。

