# 虚拟字段和AI字段迁移指南

## 📋 概述

本系统使用 **GORM AutoMigrate** 进行数据库迁移，虚拟字段和AI字段支持已完全集成到迁移系统中。

## 🚀 执行迁移

### 方法一：直接运行（推荐）

```bash
cd /Users/leven/space/easy/easydb/server

# 运行迁移程序
go run cmd/migrate/main.go
```

### 方法二：编译后执行

```bash
cd /Users/leven/space/easy/easydb/server

# 编译迁移程序
go build -o bin/migrate cmd/migrate/main.go

# 执行迁移
./bin/migrate
```

## 📊 迁移内容

### 1. Field 表新增字段

迁移会自动为 `field` 表添加以下字段：

```sql
-- 虚拟字段状态
is_pending              BOOLEAN DEFAULT false   -- 是否等待计算
has_error               BOOLEAN DEFAULT false   -- 计算是否出错

-- Lookup 字段配置
lookup_linked_field_id  VARCHAR(30)            -- 关联的link字段ID
lookup_options          TEXT                   -- Lookup配置(JSON)

-- AI 字段配置
ai_config               TEXT                   -- AI配置(JSON)
```

### 2. 新增表

#### field_dependency - 字段依赖关系表
```go
type FieldDependency struct {
    ID               string    // 主键
    SourceFieldID    string    // 源字段ID（被依赖）
    DependentFieldID string    // 依赖字段ID（虚拟字段）
    DependencyType   string    // 依赖类型：lookup/formula/rollup/ai
    CreatedTime      time.Time // 创建时间
}
```

#### virtual_field_cache - 虚拟字段缓存表
```go
type VirtualFieldCache struct {
    ID          string     // 主键
    RecordID    string     // 记录ID
    FieldID     string     // 字段ID
    CachedValue *string    // 缓存值(JSON)
    ValueType   *string    // 值类型
    CachedAt    time.Time  // 缓存时间
    ExpiresAt   *time.Time // 过期时间
}
```

### 3. 索引和约束

迁移会自动创建：

#### 索引（8个）
- `idx_field_is_computed` - 计算字段索引（部分索引）
- `idx_field_is_lookup` - Lookup字段索引（部分索引）
- `idx_field_has_error` - 错误字段索引（部分索引）
- `idx_field_is_pending` - 待计算字段索引（部分索引）
- `idx_field_lookup_linked` - Lookup关联索引（部分索引）
- `uq_field_dependency` - 依赖关系唯一索引
- `idx_virtual_cache_expires` - 缓存过期索引
- `uq_virtual_cache_key` - 缓存键唯一索引

#### 外键约束（4个）
- `fk_field_lookup_linked` - field.lookup_linked_field_id -> field.id
- `fk_field_dependency_source` - field_dependency.source_field_id -> field.id
- `fk_field_dependency_dependent` - field_dependency.dependent_field_id -> field.id
- `fk_virtual_cache_field` - virtual_field_cache.field_id -> field.id

## ✅ 验证迁移

### 1. 查看迁移输出

正常输出示例：
```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🚀 Teable 数据库自动迁移工具 (GORM AutoMigrate)          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

📋 数据库配置:
   主机: localhost:5432
   数据库: easytable
   用户: postgres

✅ 数据库连接成功

📦 开始自动迁移所有表...

   正在迁移 88 个模型...  # 新增了2个模型（FieldDependency, VirtualFieldCache）
   ✅ 成功迁移 88 个模型

🔧 添加补充索引和约束...
   创建补充索引...
   创建外键约束...
✅ 补充索引添加完成

📊 数据库统计:
   表数量: 88
   索引数量: 150+
   外键约束: 50+

╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🎉 数据库迁移完成！                                 ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

### 2. 手动验证字段

```bash
# 验证 field 表新增字段
psql -U postgres -d easytable -c "
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'field'
AND column_name IN ('is_pending', 'has_error', 'lookup_linked_field_id', 'lookup_options', 'ai_config')
ORDER BY column_name;
"
```

期望输出：
```
      column_name       |     data_type      | is_nullable | column_default
------------------------+--------------------+-------------+----------------
 ai_config              | text               | YES         | NULL
 has_error              | boolean            | YES         | false
 is_pending             | boolean            | YES         | false
 lookup_linked_field_id | character varying  | YES         | NULL
 lookup_options         | text               | YES         | NULL
```

### 3. 验证新表

```bash
# 验证新表是否创建
psql -U postgres -d easytable -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('field_dependency', 'virtual_field_cache')
ORDER BY table_name;
"
```

期望输出：
```
    table_name
--------------------
 field_dependency
 virtual_field_cache
```

### 4. 验证索引

```bash
# 验证虚拟字段相关索引
psql -U postgres -d easytable -c "
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('field', 'field_dependency', 'virtual_field_cache')
AND indexname LIKE '%field%'
OR indexname LIKE '%virtual%'
ORDER BY indexname;
"
```

## 🔄 重新迁移

如果需要重新迁移（通常不需要，GORM AutoMigrate 是增量的）：

```bash
# 1. 备份数据库
pg_dump -U postgres easytable > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 删除相关表（谨慎！）
psql -U postgres -d easytable -c "
DROP TABLE IF EXISTS virtual_field_cache CASCADE;
DROP TABLE IF EXISTS field_dependency CASCADE;
"

# 3. 重新运行迁移
go run cmd/migrate/main.go
```

## 🐛 故障排查

### 问题1：迁移失败 - 连接数据库失败

**原因：** 数据库配置错误或数据库未启动

**解决：**
1. 检查 `config.yaml` 配置
2. 验证数据库是否运行：`psql -U postgres -d easytable -c "SELECT 1"`
3. 检查环境变量是否正确设置

### 问题2：外键创建失败

**原因：** 可能存在数据完整性问题

**解决：**
```bash
# 检查孤立的 lookup_linked_field_id
psql -U postgres -d easytable -c "
SELECT f1.id, f1.name, f1.lookup_linked_field_id
FROM field f1
WHERE f1.lookup_linked_field_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM field f2 
    WHERE f2.id = f1.lookup_linked_field_id
);
"

# 如果有孤立记录，清理它们
psql -U postgres -d easytable -c "
UPDATE field
SET lookup_linked_field_id = NULL
WHERE lookup_linked_field_id NOT IN (SELECT id FROM field);
"
```

### 问题3：索引创建警告

**原因：** 索引可能已存在（这是正常的）

**解决：** 无需处理，迁移程序会继续执行

## 📝 配置说明

### config.yaml 示例

```yaml
database:
  host: localhost
  port: 5432
  user: postgres
  password: your_password
  name: easytable
  ssl_mode: disable
```

### 环境变量（优先级更高）

```bash
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your_password
export POSTGRES_DB=easytable
```

## 🔗 相关文档

- [虚拟字段实施指南](./VIRTUAL_FIELDS_AI_INTEGRATION_GUIDE.md) - 完整的实施指南
- [实施总结](./AI_VIRTUAL_FIELDS_IMPLEMENTATION_SUMMARY.md) - 项目进度和下一步计划
- [迁移代码](./server/cmd/migrate/main.go) - 迁移程序源码

## 💡 最佳实践

1. **备份优先**: 迁移前总是先备份数据库
2. **测试环境**: 先在测试环境验证迁移
3. **版本控制**: 保持代码和数据库schema同步
4. **监控日志**: 注意迁移过程中的警告信息
5. **增量迁移**: GORM AutoMigrate 是安全的增量迁移

## 🎯 下一步

迁移完成后：

1. ✅ 启动应用服务器：`go run cmd/server/main.go`
2. ✅ 测试 Lookup 字段创建和计算
3. ✅ 参考 [实施指南](./VIRTUAL_FIELDS_AI_INTEGRATION_GUIDE.md) 继续开发

---

**文档版本**: 1.0  
**最后更新**: 2025-10-08  
**维护者**: 开发团队

