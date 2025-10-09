# 虚拟字段工作流程详解

## 📋 概述

虚拟字段的值**完全由后端计算**，前端只负责展示。本文档详细说明虚拟字段的计算时机、缓存策略和触发机制。

## 🔄 工作流程

### 1. 数据读取流程

```
前端请求数据
    ↓
后端查询数据库
    ↓
获取记录和表结构
    ↓
【虚拟字段计算】
    ├── 检查缓存
    │   ├── 有缓存 → 直接返回
    │   └── 无缓存 → 执行计算
    ├── 计算虚拟字段值
    │   ├── Formula: 评估表达式
    │   ├── Lookup: 查找关联记录
    │   ├── Rollup: 聚合计算
    │   └── AI: AI处理
    ├── 存入缓存（TTL: 5分钟）
    └── 添加到记录数据
    ↓
返回完整数据给前端
    ↓
前端展示（包含虚拟字段值）
```

**当前实现：**
```go
// server/internal/application/record_service.go (289-324行)
func (s *RecordService) calculateFormulaFields(ctx context.Context, rec *record.Record, tableSchema *table.Table) {
    for _, field := range tableSchema.GetFields() {
        if field.Type == "formula" || field.Type == table.FieldTypeVirtualFormula {
            // 1. 检查缓存
            // 2. 计算值
            value, err := s.virtualFieldService.CalculateField(ctx, tableSchema, field, recordData)
            // 3. 添加到记录数据
            rec.Data[field.Name] = value
        }
    }
}
```

### 2. 数据更新流程

```
前端更新普通字段
    ↓
后端接收更新请求
    ↓
验证数据
    ↓
更新数据库
    ↓
【触发虚拟字段重算】
    ├── 识别被更新的字段
    ├── 查找依赖这些字段的虚拟字段
    ├── 清除相关缓存
    ├── 重新计算虚拟字段
    └── 更新虚拟字段值到数据库（如果需要）
    ↓
返回更新后的完整数据
    ↓
前端实时更新显示
```

## 🔍 缓存策略详解

### 当前缓存实现

```go
// server/internal/domain/table/virtual_field_service.go (297-400行)

type InMemoryVirtualFieldCache struct {
    data map[string]map[string]cacheEntry // recordID -> fieldID -> value
    mu   sync.RWMutex
}

type cacheEntry struct {
    value     interface{}
    expiresAt time.Time // TTL: 5分钟
}

// 缓存读取
func (c *InMemoryVirtualFieldCache) Get(recordID, fieldID string) (interface{}, bool) {
    if time.Now().Before(entry.expiresAt) {
        return entry.value, true
    }
    return nil, false
}

// 缓存写入
func (c *InMemoryVirtualFieldCache) Set(recordID, fieldID string, value interface{}, ttl time.Duration) {
    c.data[recordID][fieldID] = cacheEntry{
        value:     value,
        expiresAt: time.Now().Add(ttl), // 默认5分钟
    }
}

// 缓存失效
func (c *InMemoryVirtualFieldCache) Delete(recordID, fieldID string)
func (c *InMemoryVirtualFieldCache) DeleteByRecord(recordID string)
func (c *InMemoryVirtualFieldCache) DeleteByField(fieldID string)
```

### 缓存层级

```
┌─────────────────────────────────────┐
│     应用层缓存（5分钟TTL）            │
│  - 减少重复计算                       │
│  - 提高读取性能                       │
└─────────────────────────────────────┘
           ↓ (缓存未命中)
┌─────────────────────────────────────┐
│        实时计算                       │
│  - 获取关联数据                       │
│  - 执行公式/聚合                      │
└─────────────────────────────────────┘
```

### 缓存失效时机

1. **时间过期**：5分钟后自动失效
2. **数据更新**：依赖字段更新时主动清除
3. **手动刷新**：用户触发强制重算
4. **记录删除**：删除记录时清除缓存

## ⚡ 触发机制

### 需要补充的实现

当前缺少完整的触发机制，需要在记录更新时自动触发虚拟字段重算：

```go
// 需要在 RecordService.UpdateRecord 中添加
func (s *RecordService) UpdateRecord(ctx context.Context, req *UpdateRecordRequest) (*Record, error) {
    // 1. 更新普通字段
    record, err := s.recordRepo.Update(ctx, req)
    if err != nil {
        return nil, err
    }
    
    // 2. 获取表结构
    tableSchema, err := s.tableService.GetTable(ctx, record.TableID)
    if err != nil {
        return nil, err
    }
    
    // 【新增】3. 触发虚拟字段重算
    if s.virtualFieldService != nil {
        // 识别更新的字段
        updatedFields := extractUpdatedFields(req)
        
        // 更新依赖的虚拟字段
        err = s.virtualFieldService.UpdateDependentFields(
            ctx,
            tableSchema,
            record.ID,
            updatedFields,
        )
        if err != nil {
            // 记录错误但不阻断主流程
            log.Warn("Failed to update virtual fields", "error", err)
        }
        
        // 重新计算并返回最新值
        s.calculateVirtualFields(ctx, record, tableSchema)
    }
    
    return record, nil
}
```

## 📊 性能分析

### 1. 读取性能

| 场景 | 性能 | 说明 |
|------|------|------|
| **缓存命中** | ~1ms | 直接从内存读取 |
| **缓存未命中** | 10-100ms | 需要执行计算 |
| - Formula字段 | 5-20ms | 表达式评估 |
| - Lookup字段 | 10-50ms | 查询关联记录 |
| - Rollup字段 | 20-100ms | 聚合计算 |
| - AI字段 | 500-2000ms | AI调用 |

### 2. 写入性能

| 场景 | 性能 | 说明 |
|------|------|------|
| **更新普通字段** | ~5ms | 标准更新 |
| **触发虚拟字段** | +10-100ms | 依赖字段数量决定 |
| **无依赖虚拟字段** | ~5ms | 不触发计算 |

### 3. 性能优化策略

#### a) 缓存优化
```go
// 1. 分级缓存
type CacheConfig struct {
    Formula time.Duration // 5分钟
    Lookup  time.Duration // 3分钟
    Rollup  time.Duration // 10分钟（变化较少）
    AI      time.Duration // 30分钟（计算昂贵）
}

// 2. 预加载缓存
func (s *VirtualFieldService) PreloadCache(ctx context.Context, recordIDs []string) {
    // 批量预计算虚拟字段
}
```

#### b) 异步计算
```go
// 非关键虚拟字段异步计算
func (s *VirtualFieldService) CalculateAsync(ctx context.Context, field *Field, record *Record) {
    go func() {
        value, _ := s.CalculateField(ctx, table, field, recordData)
        s.cache.Set(record.ID, field.ID, value, ttl)
    }()
}
```

#### c) 增量更新
```go
// 只更新受影响的虚拟字段
func (s *VirtualFieldService) UpdateDependentFields(
    ctx context.Context,
    table *Table,
    recordID string,
    changedFields []string, // 只传递变更的字段
) error {
    // 查找依赖这些字段的虚拟字段
    dependentFields := s.findDependentFields(table, changedFields)
    
    // 只计算受影响的虚拟字段
    for _, field := range dependentFields {
        s.InvalidateCache(recordID, field.ID)
        // 重新计算
    }
}
```

## 🔧 实时计算实现

### 方案一：同步实时计算（推荐用于关键字段）

```go
// 更新记录时立即计算
func (s *RecordService) UpdateRecord(ctx context.Context, req *UpdateRecordRequest) (*Record, error) {
    // 1. 更新数据库
    record, err := s.recordRepo.Update(ctx, req)
    
    // 2. 立即计算虚拟字段
    tableSchema, _ := s.tableService.GetTable(ctx, record.TableID)
    s.virtualFieldService.UpdateDependentFields(ctx, tableSchema, record.ID, req.UpdatedFields)
    s.calculateVirtualFields(ctx, record, tableSchema)
    
    // 3. 返回包含最新虚拟字段值的记录
    return record, nil
}
```

### 方案二：异步延迟计算（用于非关键字段）

```go
// 更新记录后异步计算
func (s *RecordService) UpdateRecord(ctx context.Context, req *UpdateRecordRequest) (*Record, error) {
    // 1. 更新数据库
    record, err := s.recordRepo.Update(ctx, req)
    
    // 2. 异步计算虚拟字段
    go func() {
        tableSchema, _ := s.tableService.GetTable(context.Background(), record.TableID)
        s.virtualFieldService.UpdateDependentFields(context.Background(), tableSchema, record.ID, req.UpdatedFields)
    }()
    
    // 3. 立即返回（虚拟字段值可能是旧的）
    return record, nil
}
```

### 方案三：WebSocket实时推送（最佳用户体验）

```go
// 1. 客户端更新数据
POST /api/records/{id}

// 2. 服务端响应
{
    "id": "rec123",
    "data": {...}, // 立即返回
    "virtual_fields_status": "calculating" // 状态
}

// 3. 虚拟字段计算完成后推送
WebSocket Message:
{
    "type": "virtual_field_updated",
    "record_id": "rec123",
    "fields": {
        "total_price": 1500.00,
        "average_rating": 4.5
    }
}
```

## 🌟 完整示例

### 场景：订单表 + Rollup 总价字段

```
表结构：
- 订单表（Orders）
  - id
  - customer_name（普通字段）
  - items（Link字段 → 订单项表）
  - total_amount（Rollup字段：sum(items.price * items.quantity)）
  
- 订单项表（Order Items）
  - id
  - product_name
  - price
  - quantity
```

### 流程示例

#### 1. 初次读取
```http
GET /api/records?table_id=orders

Response:
{
    "records": [
        {
            "id": "order1",
            "customer_name": "张三",
            "items": [
                {"id": "item1", "title": "产品A"},
                {"id": "item2", "title": "产品B"}
            ],
            "total_amount": 1500.00  // ← 后端计算好的值
        }
    ]
}
```

**后端处理：**
1. 查询订单记录
2. 检查 `total_amount` 缓存（未命中）
3. 执行 Rollup 计算：
   - 查询关联的订单项
   - 创建虚拟字段实例（id='values'）
   - 评估表达式：`sum({values})`
   - 结果：1500.00
4. 存入缓存（5分钟）
5. 返回给前端

#### 2. 更新订单项价格
```http
PUT /api/records/item1
{
    "price": 800  // 从500改为800
}

Response:
{
    "id": "item1",
    "price": 800,
    "quantity": 2
}
```

**后端处理：**
1. 更新 `item1.price = 800`
2. 识别依赖字段：`orders.total_amount` 依赖 `items.price`
3. 清除缓存：`cache.Delete("order1", "total_amount")`
4. 重新计算：`total_amount = 2100.00`（800*2 + 500*1）
5. 可选：WebSocket推送更新

#### 3. 再次读取
```http
GET /api/records/order1

Response:
{
    "id": "order1",
    "total_amount": 2100.00  // ← 已更新的值
}
```

**后端处理：**
1. 查询订单记录
2. 检查 `total_amount` 缓存（命中！）
3. 直接从缓存返回：2100.00
4. 性能：<1ms

## 📈 监控指标

### 关键指标

1. **缓存命中率**
   ```go
   cacheHitRate := cacheHits / (cacheHits + cacheMisses)
   // 目标：>80%
   ```

2. **计算耗时**
   ```go
   averageCalculationTime := totalTime / calculationCount
   // 目标：<50ms
   ```

3. **触发频率**
   ```go
   virtualFieldUpdateRate := updatesTriggered / totalUpdates
   // 监控：是否过于频繁
   ```

### 性能基准

| 指标 | 目标值 | 当前值 | 优化方案 |
|------|--------|--------|----------|
| 缓存命中率 | >80% | 待测试 | 调整TTL |
| 平均计算时间 | <50ms | 待测试 | 异步计算 |
| P95延迟 | <100ms | 待测试 | 预加载 |
| 并发计算 | >100 req/s | 待测试 | 增加缓存 |

## 🚀 优化建议

### 短期优化（1-2周）

1. **完善触发机制**
   - ✅ 在 UpdateRecord 中添加虚拟字段触发
   - ✅ 实现依赖分析
   - ✅ 智能缓存失效

2. **性能监控**
   - 添加计算耗时日志
   - 监控缓存命中率
   - 记录异常情况

### 中期优化（1-2月）

1. **缓存策略**
   - 实现分级缓存
   - 添加 Redis 分布式缓存
   - 预加载热点数据

2. **异步处理**
   - 非关键字段异步计算
   - 批量更新优化
   - 计算队列

### 长期优化（3-6月）

1. **智能计算**
   - 增量计算
   - 依赖图优化
   - 计算结果持久化

2. **实时推送**
   - WebSocket 集成
   - 实时更新通知
   - 协作更新

## 📝 总结

### 虚拟字段特点

✅ **优点：**
- 数据一致性好（后端计算）
- 前端无需关心计算逻辑
- 支持复杂的聚合和关联
- 缓存机制提高性能

⚠️ **注意事项：**
- 首次计算可能较慢
- 需要合理设置缓存时间
- 要处理好依赖触发
- 监控计算性能

### 推荐配置

```go
// 虚拟字段服务配置
type VirtualFieldConfig struct {
    // 缓存配置
    CacheTTL         time.Duration // 默认5分钟
    MaxCacheSize     int           // 最大缓存条目
    
    // 计算配置
    MaxCalculationTime time.Duration // 超时时间
    AsyncThreshold     time.Duration // 异步阈值
    
    // 触发配置
    AutoTrigger        bool          // 自动触发
    BatchUpdate        bool          // 批量更新
}
```

