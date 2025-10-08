# 虚拟字段快速开始指南

## 🚀 30分钟快速上手虚拟字段和AI字段

本指南将带你快速完成虚拟字段系统的迁移、测试和基本使用。

## 步骤 1: 执行数据库迁移（2分钟）

```bash
cd /Users/leven/space/easy/easydb/server

# 运行迁移
go run cmd/migrate/main.go
```

**期望输出：**
```
✅ 数据库连接成功
📦 开始自动迁移所有表...
   正在迁移 88 个模型...
   ✅ 成功迁移 88 个模型
🔧 添加补充索引和约束...
✅ 补充索引添加完成
🎉 数据库迁移完成！
```

## 步骤 2: 验证迁移结果（1分钟）

```bash
# 验证新字段
psql -U postgres -d easytable -c "
SELECT column_name FROM information_schema.columns
WHERE table_name = 'field'
AND column_name IN ('is_pending', 'has_error', 'lookup_options', 'ai_config')
ORDER BY column_name;
"
```

**期望输出：**
```
    column_name
-------------------
 ai_config
 has_error
 is_pending
 lookup_options
```

## 步骤 3: 创建测试表和数据（5分钟）

### 3.1 创建两个测试表

```go
// 创建"产品"表
productTable := &table.Table{
    BaseID: baseID,
    Name:   "产品",
}

// 创建"订单"表
orderTable := &table.Table{
    BaseID: baseID,
    Name:   "订单",
}
```

### 3.2 为产品表添加字段

```go
// 产品名称字段
nameField := &table.Field{
    TableID: productTable.ID,
    Name:    "产品名称",
    Type:    table.FieldTypeText,
}

// 产品价格字段
priceField := &table.Field{
    TableID: productTable.ID,
    Name:    "价格",
    Type:    table.FieldTypeNumber,
}
```

### 3.3 为订单表添加字段

```go
// Link字段：关联到产品表
linkField := &table.Field{
    TableID: orderTable.ID,
    Name:    "关联产品",
    Type:    table.FieldTypeLink,
    Options: &table.FieldOptions{
        LinkTableID: productTable.ID,
    },
}
```

## 步骤 4: 创建 Lookup 字段（5分钟）

### 4.1 准备 Lookup 配置

```go
package main

import (
    "context"
    "fmt"
    "teable-go-backend/internal/domain/table"
)

func main() {
    ctx := context.Background()
    
    // 1. 准备 Lookup 选项
    lookupOpts := &table.LookupOptions{
        LinkFieldID:    linkField.ID,           // Link字段ID
        ForeignTableID: productTable.ID,        // 外部表ID（产品表）
        LookupFieldID:  nameField.ID,           // 要查找的字段ID（产品名称）
    }
    
    // 2. 创建 Lookup 字段
    lookupField := &table.Field{
        TableID:             orderTable.ID,
        Name:                "产品名称（查找）",
        Type:                table.FieldTypeLookup,
        IsComputed:          true,
        IsLookup:            true,
        IsPending:           true,  // 新创建时标记为待计算
        LookupLinkedFieldID: &lookupOpts.LinkFieldID,
        LookupOptions:       lookupOpts,
    }
    
    // 3. 保存到数据库
    // ... (使用 repository 保存)
    
    fmt.Println("✅ Lookup 字段创建成功")
}
```

### 4.2 序列化 Lookup 选项（保存到数据库）

```go
import "teable-go-backend/internal/infrastructure/database/models"

// 序列化为 JSON
lookupJSON, err := table.SerializeLookupOptions(lookupOpts)
if err != nil {
    log.Fatal(err)
}

// 创建数据库模型
dbField := &models.Field{
    ID:                  lookupField.ID,
    TableID:             lookupField.TableID,
    Name:                lookupField.Name,
    Type:                string(lookupField.Type),
    IsComputed:          boolPtr(true),
    IsLookup:            boolPtr(true),
    IsPending:           boolPtr(true),
    LookupLinkedFieldID: &lookupOpts.LinkFieldID,
    LookupOptions:       &lookupJSON,  // JSON字符串
    // ... 其他字段
}

// 保存到数据库
db.Create(dbField)
```

## 步骤 5: 计算 Lookup 字段值（5分钟）

### 5.1 准备计算上下文

```go
// 假设有一条订单记录
recordData := map[string]interface{}{
    "id":        "rec_order_001",
    "关联产品":   "rec_product_001",  // Link字段的值
    // ... 其他字段
}

// 创建计算上下文
calcCtx := table.CalculationContext{
    RecordData: recordData,
    RecordID:   "rec_order_001",
    Table:      orderTable,
    Field:      lookupField,
    Ctx:        context.Background(),
    Services: &table.CalculationServices{
        RecordService: recordService,
        TableService:  tableService,
        FieldService:  fieldService,
    },
}
```

### 5.2 执行计算

```go
// 获取 Lookup 处理器
handler := table.NewLookupFieldHandler()
calculator := handler.(table.VirtualFieldCalculator)

// 计算值
value, err := calculator.Calculate(calcCtx)
if err != nil {
    log.Printf("计算失败: %v", err)
    return
}

fmt.Printf("✅ Lookup 计算结果: %v\n", value)
// 输出: ✅ Lookup 计算结果: 产品A
```

### 5.3 缓存结果

```go
// 创建缓存
cache := table.NewInMemoryVirtualFieldCache()

// 缓存计算结果（5分钟TTL）
cache.Set(recordData["id"].(string), lookupField.ID, value, 5*time.Minute)

// 下次查询时先检查缓存
if cachedValue, found := cache.Get(recordID, fieldID); found {
    fmt.Printf("使用缓存值: %v\n", cachedValue)
    return cachedValue
}
```

## 步骤 6: 管理字段依赖（5分钟）

### 6.1 添加依赖关系

```go
// 创建依赖管理器
depManager := table.NewFieldDependencyManager()

// 添加依赖：lookupField 依赖 linkField
depManager.AddDependency(linkField.ID, lookupField.ID)

fmt.Println("✅ 依赖关系已添加")
```

### 6.2 查询依赖字段

```go
// 当 linkField 变化时，查找需要更新的字段
dependentFields := depManager.GetDependentFields(linkField.ID)

fmt.Printf("需要更新的字段: %v\n", dependentFields)
// 输出: 需要更新的字段: [fld_lookup_xxxxx]
```

### 6.3 检测循环依赖

```go
// 在创建新字段前检测循环依赖
hasCycle, path := depManager.DetectCircularDependency(newFieldID)
if hasCycle {
    return fmt.Errorf("检测到循环依赖: %v", path)
}
```

## 步骤 7: 完整示例（10分钟）

### 完整的 Lookup 字段使用流程

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    
    "teable-go-backend/internal/domain/table"
)

func main() {
    ctx := context.Background()
    
    // ========== 1. 初始化服务 ==========
    cache := table.NewInMemoryVirtualFieldCache()
    depManager := table.NewFieldDependencyManager()
    
    // ========== 2. 创建 Lookup 字段 ==========
    lookupOpts := &table.LookupOptions{
        LinkFieldID:    "fld_link_001",
        ForeignTableID: "tbl_products",
        LookupFieldID:  "fld_name",
    }
    
    // 验证配置
    handler := table.NewLookupFieldHandler()
    if err := handler.ValidateOptions(&table.FieldOptions{Lookup: lookupOpts}); err != nil {
        log.Fatal("配置验证失败:", err)
    }
    
    // 添加依赖关系
    depManager.AddDependency(lookupOpts.LinkFieldID, "fld_lookup_001")
    
    fmt.Println("✅ 步骤1: Lookup字段配置完成")
    
    // ========== 3. 计算字段值 ==========
    recordData := map[string]interface{}{
        "id":           "rec_order_001",
        "fld_link_001": "rec_product_001",  // Link字段值
    }
    
    // 检查缓存
    recordID := recordData["id"].(string)
    fieldID := "fld_lookup_001"
    
    if cachedValue, found := cache.Get(recordID, fieldID); found {
        fmt.Printf("✅ 步骤2: 使用缓存值: %v\n", cachedValue)
        return
    }
    
    // 计算新值
    calcCtx := table.CalculationContext{
        RecordData: recordData,
        RecordID:   recordID,
        Ctx:        ctx,
        // Services: services,  // 实际使用时需要注入服务
    }
    
    calculator := handler.(table.VirtualFieldCalculator)
    value, err := calculator.Calculate(calcCtx)
    if err != nil {
        log.Fatal("计算失败:", err)
    }
    
    fmt.Printf("✅ 步骤3: 计算完成，结果: %v\n", value)
    
    // 缓存结果
    cache.Set(recordID, fieldID, value, 5*time.Minute)
    
    fmt.Println("✅ 步骤4: 结果已缓存")
    
    // ========== 4. 处理依赖更新 ==========
    // 模拟 linkField 变化
    changedFieldID := lookupOpts.LinkFieldID
    dependentFields := depManager.GetDependentFields(changedFieldID)
    
    fmt.Printf("✅ 步骤5: 检测到 %d 个依赖字段需要更新\n", len(dependentFields))
    
    // 失效缓存
    for _, depFieldID := range dependentFields {
        cache.Delete(recordID, depFieldID)
    }
    
    fmt.Println("✅ 步骤6: 缓存已失效，下次查询将重新计算")
    
    // ========== 5. 检测循环依赖 ==========
    hasCycle, path := depManager.DetectCircularDependency(fieldID)
    if hasCycle {
        log.Printf("⚠️  检测到循环依赖: %v", path)
    } else {
        fmt.Println("✅ 步骤7: 无循环依赖")
    }
    
    fmt.Println("\n🎉 完整流程执行成功！")
}

func boolPtr(b bool) *bool {
    return &b
}
```

## 测试验证清单

- [ ] 迁移成功，新字段和表已创建
- [ ] Lookup 字段可以正确创建
- [ ] Lookup 字段值可以正确计算
- [ ] 缓存机制工作正常
- [ ] 依赖关系管理正常
- [ ] 循环依赖检测有效

## 常见问题

### Q1: 迁移时报错"表已存在"

**A:** 这是正常的。GORM AutoMigrate 是增量迁移，已存在的表会自动跳过。

### Q2: Lookup 计算返回 nil

**A:** 检查：
1. Link 字段是否有值
2. 外部记录是否存在
3. RecordService 是否正确注入

### Q3: 缓存不生效

**A:** 确保：
1. 使用相同的 recordID 和 fieldID
2. 缓存未过期（检查 TTL）
3. 缓存实例是单例的

## 下一步

完成快速开始后，你可以：

1. 📖 阅读 [完整实施指南](./VIRTUAL_FIELDS_AI_INTEGRATION_GUIDE.md)
2. 🔨 实现 Formula 字段处理器
3. 🔨 实现 Rollup 字段处理器
4. 🤖 实现 AI 字段处理器
5. 🌐 开发前端配置 UI

## 获取帮助

- 查看 [迁移指南](./MIGRATION_GUIDE_VIRTUAL_FIELDS.md)
- 查看 [实施总结](./AI_VIRTUAL_FIELDS_IMPLEMENTATION_SUMMARY.md)
- 查看代码示例：`server/internal/domain/table/field_handler_lookup.go`

---

**文档版本**: 1.0  
**更新时间**: 2025-10-08  
**预计完成时间**: 30 分钟

