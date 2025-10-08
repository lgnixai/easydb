# 虚拟字段和AI字段集成指南

> 本文档记录了在新系统中集成虚拟字段（Lookup、Formula、Rollup）和AI字段的完整实施方案

## 📋 目录

1. [概述](#概述)
2. [数据库变更](#数据库变更)
3. [数据模型更新](#数据模型更新)
4. [核心架构](#核心架构)
5. [已实现功能](#已实现功能)
6. [待实现功能](#待实现功能)
7. [使用示例](#使用示例)
8. [测试指南](#测试指南)

## 概述

### 虚拟字段类型

新系统支持以下虚拟字段类型：

| 类型 | 说明 | 状态 |
|------|------|------|
| **Lookup** | 从关联记录查找值 | ✅ 核心实现完成 |
| **Formula** | 基于公式表达式计算 | 🔄 待实现 |
| **Rollup** | 对关联记录聚合统计 | 🔄 待实现 |
| **AI字段** | 使用AI生成/处理内容 | 🔄 待实现 |

### 核心特性

- ✅ 字段依赖图管理
- ✅ 虚拟字段值缓存
- ✅ 循环依赖检测
- ✅ 计算状态追踪（pending/error）
- 🔄 拓扑排序计算
- 🔄 增量更新机制

## 数据库变更

### 迁移脚本

执行迁移脚本：
```bash
cd /Users/leven/space/easy/easydb/server/scripts/migrations
psql -U <username> -d <database> -f 007_add_virtual_and_ai_field_support.sql
```

### 新增字段（field表）

```sql
ALTER TABLE field ADD COLUMN:
- is_pending BOOLEAN DEFAULT FALSE      -- 是否等待计算
- has_error BOOLEAN DEFAULT FALSE       -- 计算是否出错
- lookup_linked_field_id VARCHAR(30)   -- lookup关联的link字段ID
- lookup_options TEXT                   -- lookup配置（JSON）
- ai_config TEXT                        -- AI字段配置（JSON）
- deleted_time TIMESTAMP                -- 软删除时间
```

### 新增表

#### 1. field_dependency（字段依赖关系表）
```sql
CREATE TABLE field_dependency (
    id VARCHAR(50) PRIMARY KEY,
    source_field_id VARCHAR(30),        -- 源字段（被依赖）
    dependent_field_id VARCHAR(30),     -- 依赖字段（虚拟字段）
    dependency_type VARCHAR(50),        -- 依赖类型
    created_time TIMESTAMP
);
```

#### 2. virtual_field_cache（虚拟字段缓存表）
```sql
CREATE TABLE virtual_field_cache (
    id VARCHAR(50) PRIMARY KEY,
    record_id VARCHAR(30),
    field_id VARCHAR(30),
    cached_value TEXT,                  -- 缓存值（JSON）
    value_type VARCHAR(50),
    cached_at TIMESTAMP,
    expires_at TIMESTAMP
);
```

## 数据模型更新

### Go Model (models/table.go)

```go
type Field struct {
    // 基础字段
    ID          string    `gorm:"primaryKey;type:varchar(30)"`
    TableID     string    `gorm:"type:varchar(30);not null"`
    Name        string
    Type        string
    
    // 虚拟字段支持
    IsComputed          *bool    `gorm:"column:is_computed"`
    IsLookup            *bool    `gorm:"column:is_lookup"`
    IsPending           *bool    `gorm:"column:is_pending;default:false"`
    HasError            *bool    `gorm:"column:has_error;default:false"`
    LookupLinkedFieldID *string  `gorm:"column:lookup_linked_field_id"`
    LookupOptions       *string  `gorm:"column:lookup_options;type:text"`
    AIConfig            *string  `gorm:"column:ai_config;type:text"`
    
    // ... 其他字段
}
```

### Domain Entity (domain/table/entity.go)

```go
type Field struct {
    ID                  string
    Name                string
    Type                FieldType
    
    // 虚拟字段属性
    IsComputed          bool
    IsLookup            bool
    IsPending           bool
    HasError            bool
    LookupLinkedFieldID *string
    LookupOptions       *LookupOptions
    AIConfig            *AIFieldConfig
    
    // ... 其他字段
}
```

## 核心架构

### 1. 配置结构定义

#### LookupOptions
```go
type LookupOptions struct {
    LinkFieldID      string   // 关联的link字段ID
    ForeignTableID   string   // 外部表ID
    LookupFieldID    string   // 要查找的字段ID
    Relationship     *string  // 关系类型
    FilterExpression *string  // 过滤条件
    // 查询优化字段
    FKHostTableName  *string
    SelfKeyName      *string
    ForeignKeyName   *string
}
```

#### AIFieldConfig
```go
type AIFieldConfig struct {
    Type               string    // AI操作类型
    ModelKey           string    // AI模型标识
    IsAutoFill         *bool     // 是否自动填充
    SourceFieldID      *string   // 源字段ID
    TargetLanguage     *string   // 目标语言
    AttachPrompt       *string   // 附加提示词
    Prompt             *string   // 提示词模板
    AttachmentFieldIDs []string  // 附件字段IDs
}
```

#### FormulaOptions
```go
type FormulaOptions struct {
    Expression       string    // 公式表达式
    ReferencedFields []string  // 引用的字段IDs
    ResultType       *string   // 结果类型
}
```

#### RollupOptions
```go
type RollupOptions struct {
    LinkFieldID         string   // 关联的link字段ID
    ForeignTableID      string   // 外部表ID
    RollupFieldID       string   // 要汇总的字段ID
    AggregationFunction string   // 聚合函数
    FilterExpression    *string  // 过滤条件
}
```

### 2. 虚拟字段计算器接口

```go
type VirtualFieldCalculator interface {
    // 计算虚拟字段的值
    Calculate(ctx CalculationContext) (interface{}, error)
    
    // 获取依赖的字段IDs
    GetDependencies() []string
    
    // 获取字段类型
    GetFieldType() FieldType
}
```

### 3. 计算上下文

```go
type CalculationContext struct {
    RecordData map[string]interface{}  // 当前记录数据
    RecordID   string
    Table      *Table
    Field      *Field
    UserID     string
    Ctx        context.Context
    Context    map[string]interface{}
    Services   *CalculationServices    // 服务引用
}
```

### 4. 缓存机制

```go
type VirtualFieldCache interface {
    Get(recordID, fieldID string) (interface{}, bool)
    Set(recordID, fieldID string, value interface{}, ttl time.Duration)
    Delete(recordID, fieldID string)
    DeleteByRecord(recordID string)
    DeleteByField(fieldID string)
}
```

实现：
- **InMemoryVirtualFieldCache**: 内存缓存实现
- 默认TTL: 5分钟
- 自动清理过期缓存

### 5. 依赖管理

```go
type FieldDependencyManager struct {
    // fieldID -> []dependentFieldID
    dependencies map[string][]string
    // dependentFieldID -> []sourceFieldID（反向索引）
    reverseDeps  map[string][]string
}
```

功能：
- 添加/移除依赖关系
- 查询依赖字段
- 构建依赖图
- 检测循环依赖

## 已实现功能

### ✅ 1. 数据库迁移脚本
- [x] 字段表添加虚拟字段支持列
- [x] 创建依赖关系表
- [x] 创建缓存表
- [x] 添加必要的索引和外键

### ✅ 2. 数据模型更新
- [x] GORM模型更新
- [x] Domain实体更新
- [x] 配置结构定义

### ✅ 3. Lookup字段处理器
- [x] 字段验证
- [x] 值计算逻辑
- [x] 依赖提取
- [x] 字段准备函数

### ✅ 4. 基础设施
- [x] 虚拟字段计算器接口
- [x] 计算上下文定义
- [x] 内存缓存实现
- [x] 依赖管理器
- [x] 序列化/反序列化工具

## 待实现功能

### 🔄 1. Formula字段处理器
```go
// 需要实现：
- 公式解析器
- 表达式求值
- 字段引用提取
- 类型推断
```

参考旧系统：
- `teable-develop/apps/nestjs-backend/src/features/field/field-calculate/field-supplement.service.ts`
- `prepareFormulaField()` 方法

### 🔄 2. Rollup字段处理器
```go
// 需要实现：
- 聚合函数：COUNT, SUM, AVG, MIN, MAX
- 数组操作：ARRAY_JOIN, ARRAY_UNIQUE, ARRAY_COMPACT
- 过滤支持
```

参考旧系统：
- `prepareRollupField()` 方法

### 🔄 3. AI字段处理器
```go
// 需要实现：
- AI Provider接口
- OpenAI/DeepSeek集成
- 提示词模板处理
- 结果缓存
```

参考文件：
- `teable-develop/apps/nextjs-app/src/features/app/components/field-setting/field-ai-config/`

### 🔄 4. 虚拟字段服务
```go
type VirtualFieldService struct {
    calculators map[FieldType]VirtualFieldCalculator
    cache       VirtualFieldCache
    depManager  *FieldDependencyManager
}

// 需要实现：
- CalculateField()      // 计算单个字段
- CalculateVirtualFields() // 批量计算
- UpdateDependentFields()  // 更新依赖字段
- InvalidateCache()        // 失效缓存
```

### 🔄 5. 拓扑排序引擎
```go
// 需要实现：
- getTopoOrders()          // 拓扑排序
- prependStartFieldIds()   // 优先级排序
- detectCircularDependency() // 循环检测
```

参考：
- `teable-develop/apps/nestjs-backend/src/features/calculation/utils/dfs.ts`

### 🔄 6. 计算引擎
```go
// 需要实现：
- calculateFields()        // 计算指定字段
- calculateChanges()       // 增量计算
- calComputedFieldsByRecordIds() // 按记录计算
```

参考：
- `teable-develop/apps/nestjs-backend/src/features/calculation/field-calculation.service.ts`

### 🔄 7. API接口更新

#### 创建字段接口
```go
// POST /api/fields
// 需要支持：
- is_lookup, lookup_options
- is_computed
- ai_config
- 自动推断 cellValueType
- 自动设置 is_pending
```

#### 更新字段接口
```go
// PUT /api/fields/:id
// 需要支持：
- 检测配置变更
- 标记为 pending
- 更新依赖图
- 触发重算
```

#### 查询字段接口
```go
// GET /api/fields/:id
// 需要返回：
- is_pending, has_error
- lookup_options (反序列化)
- ai_config (反序列化)
```

### 🔄 8. 前端UI

#### Field Editor组件
- [ ] AI配置面板
- [ ] Lookup配置面板
- [ ] Formula配置面板
- [ ] Rollup配置面板

#### 字段选择器
- [ ] 支持字段类型过滤
- [ ] 显示虚拟字段标识
- [ ] 显示计算状态（pending/error）

#### 字段类型图标
- [ ] Lookup字段图标
- [ ] Formula字段图标
- [ ] Rollup字段图标
- [ ] AI字段图标

## 使用示例

### 1. 创建Lookup字段

```go
// 1. 准备lookup选项
lookupOpts := &table.LookupOptions{
    LinkFieldID:    "fld_link_xxxxx",
    ForeignTableID: "tbl_foreign_xxxxx",
    LookupFieldID:  "fld_lookup_xxxxx",
}

// 2. 验证和准备字段
field, err := table.PrepareLookupField(lookupOpts, services, ctx)
if err != nil {
    return err
}

// 3. 设置字段基本信息
field.Name = "关联产品名称"
field.Type = table.FieldTypeLookup
field.TableID = tableID

// 4. 序列化lookup选项
lookupJSON, err := table.SerializeLookupOptions(lookupOpts)
if err != nil {
    return err
}

// 5. 保存到数据库
dbField := &models.Field{
    ID:                  field.ID,
    Name:                field.Name,
    Type:                string(field.Type),
    IsComputed:          boolPtr(true),
    IsLookup:            boolPtr(true),
    IsPending:           boolPtr(true),
    LookupLinkedFieldID: &lookupOpts.LinkFieldID,
    LookupOptions:       &lookupJSON,
    // ... 其他字段
}

err = db.Create(dbField).Error
```

### 2. 计算Lookup字段值

```go
// 1. 创建计算上下文
calcCtx := table.CalculationContext{
    RecordData: recordData,
    RecordID:   recordID,
    Table:      table,
    Field:      field,
    Ctx:        ctx,
    Services: &table.CalculationServices{
        RecordService: recordService,
        TableService:  tableService,
        FieldService:  fieldService,
    },
}

// 2. 获取lookup处理器
handler := table.NewLookupFieldHandler()
calculator := handler.(table.VirtualFieldCalculator)

// 3. 计算值
value, err := calculator.Calculate(calcCtx)
if err != nil {
    // 标记字段为错误状态
    field.HasError = true
    return err
}

// 4. 缓存结果
cache.Set(recordID, field.ID, value, 5*time.Minute)

// 5. 更新字段状态
field.IsPending = false
field.HasError = false
```

### 3. 使用依赖管理器

```go
// 1. 创建依赖管理器
depManager := table.NewFieldDependencyManager()

// 2. 添加依赖关系
// 表示 lookupField 依赖 linkField
depManager.AddDependency(linkFieldID, lookupFieldID)

// 3. 当linkField变化时，查找需要更新的字段
changedFieldIDs := []string{linkFieldID}
dependentFields := depManager.GetDependentFields(linkFieldID)
// 返回: [lookupFieldID]

// 4. 检测循环依赖
hasCycle, path := depManager.DetectCircularDependency(fieldID)
if hasCycle {
    return fmt.Errorf("circular dependency detected: %v", path)
}

// 5. 构建依赖图（用于拓扑排序）
graph := depManager.BuildDependencyGraph(fieldIDs)
```

### 4. 使用缓存

```go
// 1. 创建缓存
cache := table.NewInMemoryVirtualFieldCache()

// 2. 设置缓存
cache.Set(recordID, fieldID, value, 5*time.Minute)

// 3. 获取缓存
if cachedValue, found := cache.Get(recordID, fieldID); found {
    return cachedValue
}

// 4. 失效缓存
// 单个字段
cache.Delete(recordID, fieldID)

// 整条记录
cache.DeleteByRecord(recordID)

// 某个字段的所有缓存
cache.DeleteByField(fieldID)
```

## 测试指南

### 单元测试

```bash
# 测试lookup字段处理器
go test ./internal/domain/table -run TestLookupFieldHandler

# 测试依赖管理器
go test ./internal/domain/table -run TestFieldDependencyManager

# 测试缓存
go test ./internal/domain/table -run TestVirtualFieldCache
```

### 集成测试

```bash
# 1. 运行迁移
./scripts/run_migrations.sh

# 2. 创建测试数据
# 创建两个关联的表
# 创建link字段
# 创建lookup字段

# 3. 测试lookup计算
curl -X GET http://localhost:8080/api/records/:recordId

# 4. 测试缓存
# 第一次请求 - 应该计算
# 第二次请求 - 应该使用缓存

# 5. 测试依赖更新
# 修改源记录
# 验证lookup字段自动更新
```

### 端到端测试

前端测试流程：
1. 创建基础表和关联表
2. 创建link字段连接两表
3. 创建lookup字段
4. 验证lookup值正确显示
5. 修改源数据，验证lookup更新
6. 测试过滤条件
7. 测试多值情况

## 性能优化建议

### 1. 批量计算
```go
// 一次性计算多个字段，减少数据库查询
values, err := CalculateVirtualFields(ctx, table, recordData, fieldIDs)
```

### 2. 缓存策略
- 使用Redis替代内存缓存（生产环境）
- 调整TTL根据使用频率
- 实现缓存预热

### 3. 查询优化
- 使用JOIN优化lookup查询
- 批量获取关联记录
- 添加合适的数据库索引

### 4. 增量更新
- 只更新受影响的字段
- 使用消息队列异步处理
- 实现计算任务调度

## 故障排查

### 问题1：Lookup字段显示为空
```
检查：
1. link字段是否有值
2. 外部表记录是否存在
3. lookup_field_id是否正确
4. 是否有权限访问外部表

解决：
- 查看 has_error 字段
- 检查日志错误信息
- 验证字段配置
```

### 问题2：计算性能慢
```
检查：
1. 是否有循环依赖
2. 依赖链是否过长
3. 缓存是否生效
4. 是否缺少数据库索引

解决：
- 使用拓扑排序优化计算顺序
- 启用缓存
- 添加合适索引
- 考虑异步计算
```

### 问题3：循环依赖错误
```
检查：
1. 使用 DetectCircularDependency 检测
2. 查看返回的依赖路径

解决：
- 重新设计字段关系
- 移除循环引用
- 使用中间字段打破循环
```

## 参考资料

### 旧系统实现
- Teable NestJS Backend: `/Users/leven/space/easy/easydb/teable-develop/apps/nestjs-backend/src/features/`
- 字段计算服务: `calculation/field-calculation.service.ts`
- 字段补充服务: `field/field-calculate/field-supplement.service.ts`
- 引用服务: `calculation/reference.service.ts`

### 前端组件
- AI配置: `nextjs-app/src/features/app/components/field-setting/field-ai-config/`
- Lookup配置: `nextjs-app/src/features/app/components/field-setting/lookup-options/`

### 核心包
- Core模型: `packages/core/src/models/field/`
- AI配置: `packages/core/src/models/field/ai-config/`

## 下一步计划

### 短期（1-2周）
1. 完成Formula字段处理器
2. 完成Rollup字段处理器
3. 实现虚拟字段服务
4. 更新字段API接口

### 中期（2-4周）
1. 实现AI字段处理器
2. 集成AI Provider
3. 实现拓扑排序引擎
4. 完善前端UI

### 长期（1-2月）
1. 性能优化和调优
2. 完善文档和示例
3. 添加更多AI操作类型
4. 实现高级特性（如条件计算）

## 贡献指南

如需继续开发，请参考：
1. 本文档的"待实现功能"部分
2. 旧系统的实现作为参考
3. 保持与现有架构的一致性
4. 添加完善的单元测试
5. 更新本文档记录变更

---

**文档版本**: 1.0  
**最后更新**: 2025-10-08  
**作者**: AI Assistant  
**状态**: 基础架构已完成，待继续实现

