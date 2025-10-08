# golang-migrate 集成指南

## 🎯 概述

成功集成 [golang-migrate/migrate](https://github.com/golang-migrate/migrate)，实现标准化、科学的数据库迁移管理。

## ✨ 集成方案

### 混合迁移架构

采用 **golang-migrate + GORM AutoMigrate** 混合方案：

```
┌─────────────────────────────────────────────┐
│          混合迁移系统                        │
├─────────────────────────────────────────────┤
│                                             │
│  Step 1: golang-migrate                    │
│  ├─ SQL迁移文件（.up.sql / .down.sql）      │
│  ├─ 版本追踪（schema_migrations表）         │
│  └─ 支持回滚                                │
│                                             │
│  Step 2: GORM AutoMigrate                  │
│  ├─ Go模型自动同步                          │
│  ├─ 字段类型自动推断                        │
│  └─ 补充索引和约束                          │
│                                             │
└─────────────────────────────────────────────┘
```

### 优势

| 功能 | golang-migrate | GORM AutoMigrate | 混合方案 |
|------|---------------|------------------|---------|
| 版本追踪 | ✅ | ❌ | ✅ |
| 回滚支持 | ✅ | ❌ | ✅ |
| 模型同步 | ❌ | ✅ | ✅ |
| 复杂SQL | ✅ | ❌ | ✅ |
| 易用性 | 🟡 | ✅ | ✅ |
| 标准化 | ✅ | 🟡 | ✅ |

## 🚀 快速开始

### 1. 安装依赖（已完成）

```bash
cd /Users/leven/space/easy/easydb/server

go get -u github.com/golang-migrate/migrate/v4
go get -u github.com/golang-migrate/migrate/v4/database/postgres
go get -u github.com/golang-migrate/migrate/v4/source/file
go mod tidy
```

### 2. 执行迁移

```bash
# 方式1: 使用 Makefile（推荐）
make -f Makefile.migrate migrate-hybrid

# 方式2: 直接运行
go run cmd/migrate/main.go hybrid

# 方式3: 编译后执行
go build -o bin/migrate cmd/migrate/main.go
./bin/migrate hybrid
```

### 3. 验证结果

```bash
# 查看迁移版本
make -f Makefile.migrate migrate-version

# 输出示例：
# 📌 当前迁移版本信息:
#    版本号: 2
#    状态: clean
```

## 📁 目录结构

```
server/
├── cmd/
│   └── migrate/
│       └── main.go                    ✅ 重构为混合迁移工具
├── migrations/                         ✅ 新增：SQL迁移文件目录
│   ├── 000001_init_schema.up.sql
│   ├── 000001_init_schema.down.sql
│   ├── 000002_add_virtual_field_support.up.sql
│   ├── 000002_add_virtual_field_support.down.sql
│   └── README.md
├── Makefile.migrate                    ✅ 新增：迁移命令快捷方式
└── config.yaml                         # 数据库配置
```

## 🔧 迁移命令详解

### 基础命令

#### 1. 执行迁移（up）

```bash
# 执行所有待执行的迁移
go run cmd/migrate/main.go up

# 或使用 Makefile
make -f Makefile.migrate migrate-up
```

**效果：**
- 执行所有 `.up.sql` 文件
- 更新 schema_migrations 表
- 标记迁移版本

#### 2. 回滚迁移（down）

```bash
# 回滚最后一次迁移
go run cmd/migrate/main.go down

# 或使用 Makefile
make -f Makefile.migrate migrate-down
```

**效果：**
- 执行最新的 `.down.sql` 文件
- 回退迁移版本

#### 3. 查看版本（version）

```bash
go run cmd/migrate/main.go version

# 输出：
# 📌 当前迁移版本信息:
#    版本号: 2
#    状态: clean
```

#### 4. 强制版本（force）

```bash
# 强制设置为版本2（解决dirty状态）
go run cmd/migrate/main.go force 2

# 或
make -f Makefile.migrate migrate-force VERSION=2
```

#### 5. 混合迁移（hybrid）⭐

```bash
# 推荐使用
go run cmd/migrate/main.go hybrid

# 执行流程：
# 1. golang-migrate up
# 2. GORM AutoMigrate
# 3. 添加补充索引
```

### 高级命令

#### 创建新迁移

```bash
# 使用 Makefile
make -f Makefile.migrate migrate-create NAME=add_user_avatar

# 将创建：
# migrations/1728380123_add_user_avatar.up.sql
# migrations/1728380123_add_user_avatar.down.sql
```

#### 列出迁移文件

```bash
make -f Makefile.migrate migrate-list

# 输出：
# 📁 迁移文件列表:
# -rw-r--r--  1 user  staff   1.2K  000001_init_schema.up.sql
# -rw-r--r--  1 user  staff   0.5K  000001_init_schema.down.sql
# ...
```

#### 数据库备份

```bash
make -f Makefile.migrate db-backup

# 创建：backup_20251008_143025.sql
```

#### 连接数据库

```bash
make -f Makefile.migrate db-console

# 进入 psql 控制台
```

## 📝 迁移文件编写指南

### 文件命名

格式：`{version}_{description}.{up|down}.sql`

**版本号选择：**
- **方式1**：递增数字（000001, 000002, ...）- 简单清晰
- **方式2**：Unix时间戳 - 避免冲突

**示例：**
```
000001_init_schema.up.sql
000001_init_schema.down.sql
000002_add_virtual_field_support.up.sql
000002_add_virtual_field_support.down.sql
1728380000_add_user_field.up.sql
1728380000_add_user_field.down.sql
```

### UP 迁移模板

```sql
-- =====================================================
-- Migration: add_user_avatar
-- Description: 为用户表添加头像字段
-- Author: Your Name
-- Date: 2025-10-08
-- =====================================================

-- 添加字段
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS avatar_thumb_url VARCHAR(500);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_users_avatar 
    ON users(avatar_url) 
    WHERE avatar_url IS NOT NULL;

-- 添加注释
COMMENT ON COLUMN users.avatar_url IS '用户头像URL';
COMMENT ON COLUMN users.avatar_thumb_url IS '用户头像缩略图URL';

-- 默认值或数据迁移
UPDATE users SET avatar_url = 'https://default-avatar.png' 
WHERE avatar_url IS NULL;

-- 完成标记
SELECT 'Migration completed' as status;
```

### DOWN 迁移模板

```sql
-- =====================================================
-- Rollback: add_user_avatar
-- Description: 回滚用户头像字段
-- =====================================================

-- 删除索引
DROP INDEX IF EXISTS idx_users_avatar;

-- 删除字段（警告：会丢失数据！）
ALTER TABLE users 
    DROP COLUMN IF EXISTS avatar_thumb_url,
    DROP COLUMN IF EXISTS avatar_url;

-- 完成标记
SELECT 'Rollback completed' as status;
```

## 🔍 版本追踪

### schema_migrations 表

golang-migrate 自动创建和管理：

```sql
CREATE TABLE schema_migrations (
    version BIGINT PRIMARY KEY,
    dirty BOOLEAN NOT NULL
);
```

**字段说明：**
- `version`: 当前迁移版本号
- `dirty`: 迁移是否处于脏状态（执行失败）

### 查询迁移历史

```sql
-- 查看当前版本
SELECT * FROM schema_migrations;

-- 查看所有已执行的迁移
-- （golang-migrate 只保存当前版本）
```

## ⚡ 使用场景

### 场景1: 新项目初始化

```bash
# 1. 执行混合迁移
make -f Makefile.migrate migrate-hybrid

# 2. 验证
make -f Makefile.migrate migrate-version

# 3. 启动服务
go run cmd/server/main.go
```

### 场景2: 添加新功能

```bash
# 1. 创建迁移文件
make -f Makefile.migrate migrate-create NAME=add_feature_x

# 2. 编辑迁移文件
vim migrations/*_add_feature_x.up.sql
vim migrations/*_add_feature_x.down.sql

# 3. 执行迁移
make -f Makefile.migrate migrate-up

# 4. 验证
make -f Makefile.migrate migrate-version
```

### 场景3: 回滚错误的迁移

```bash
# 1. 查看当前版本
make -f Makefile.migrate migrate-version

# 2. 回滚
make -f Makefile.migrate migrate-down

# 3. 验证
make -f Makefile.migrate migrate-version
```

### 场景4: 修复 dirty 状态

```bash
# 如果迁移执行失败，版本会变为 dirty

# 1. 查看状态
make -f Makefile.migrate migrate-version
# 输出: 版本号: 2, 状态: dirty

# 2. 手动修复数据库问题
make -f Makefile.migrate db-console
# 在psql中修复问题...

# 3. 强制设置版本
make -f Makefile.migrate migrate-force VERSION=2

# 4. 重新迁移
make -f Makefile.migrate migrate-up
```

## 🎨 与 GORM 的配合

### 分工原则

**golang-migrate 负责：**
- ✅ 结构性变更（CREATE TABLE, ALTER TABLE）
- ✅ 数据迁移（UPDATE, INSERT）
- ✅ 索引和约束（CREATE INDEX, ADD CONSTRAINT）
- ✅ 复杂SQL操作

**GORM AutoMigrate 负责：**
- ✅ 模型字段同步
- ✅ 列类型调整
- ✅ 简单索引创建
- ✅ 保持代码和数据库一致

### 推荐工作流

1. **大版本或结构性变更**: 使用 golang-migrate
   ```bash
   make migrate-create NAME=add_virtual_field_support
   # 编辑 .up.sql 和 .down.sql
   make migrate-hybrid
   ```

2. **小调整或开发阶段**: 使用 GORM AutoMigrate
   ```bash
   # 修改 Go 模型
   make migrate-gorm
   ```

3. **生产环境**: 总是使用混合模式
   ```bash
   make migrate-hybrid
   ```

## 📊 已创建的迁移

### 000001_init_schema

**目的**: 初始化标记，实际表由 GORM 创建

**内容**:
- 占位迁移
- 标记迁移系统已启用

### 000002_add_virtual_field_support

**目的**: 添加虚拟字段和AI字段支持

**新增字段**:
```sql
ALTER TABLE field ADD COLUMN:
- is_pending              BOOLEAN
- has_error               BOOLEAN
- lookup_linked_field_id  VARCHAR(30)
- lookup_options          TEXT
- ai_config               TEXT
```

**新增表**:
- `field_dependency` - 字段依赖关系
- `virtual_field_cache` - 虚拟字段缓存

**索引**:
- 5个部分索引（性能优化）
- 2个唯一索引

**外键**:
- 4个外键约束（数据完整性）

## 🛠️ Makefile 命令速查

```bash
# 常用命令
make -f Makefile.migrate migrate-hybrid    # 执行混合迁移⭐
make -f Makefile.migrate migrate-version   # 查看版本
make -f Makefile.migrate migrate-create    # 创建迁移
make -f Makefile.migrate db-backup         # 备份数据库
make -f Makefile.migrate help              # 查看帮助

# 高级命令
make -f Makefile.migrate migrate-up        # 仅golang-migrate up
make -f Makefile.migrate migrate-down      # 回滚
make -f Makefile.migrate migrate-force     # 强制版本
make -f Makefile.migrate migrate-gorm      # 仅GORM
make -f Makefile.migrate db-console        # 连接数据库
```

## 📋 集成清单

- [x] ✅ 安装 golang-migrate 依赖
- [x] ✅ 创建 migrations 目录
- [x] ✅ 创建初始迁移文件
- [x] ✅ 创建虚拟字段迁移文件
- [x] ✅ 重构 cmd/migrate/main.go
- [x] ✅ 创建 Makefile.migrate
- [x] ✅ 编写迁移文档
- [x] ✅ 编译测试通过

## 🎯 使用建议

### 开发环境

```bash
# 快速迭代，使用GORM AutoMigrate
make -f Makefile.migrate migrate-gorm

# 或直接启动服务器（会自动迁移，如果配置了）
go run cmd/server/main.go
```

### 测试环境

```bash
# 使用混合模式
DB_NAME=easytable_test make -f Makefile.migrate migrate-hybrid
```

### 生产环境

```bash
# 1. 备份数据库
make -f Makefile.migrate db-backup

# 2. 执行混合迁移
make -f Makefile.migrate migrate-hybrid

# 3. 验证版本
make -f Makefile.migrate migrate-version

# 4. 启动服务
go run cmd/server/main.go
```

## 📖 相关文档

- [golang-migrate 官方文档](https://github.com/golang-migrate/migrate)
- [迁移文件README](./server/migrations/README.md)
- [虚拟字段迁移指南](./MIGRATION_GUIDE_VIRTUAL_FIELDS.md)
- [快速开始指南](./VIRTUAL_FIELDS_QUICKSTART.md)

## 🎉 总结

✅ **成功集成 golang-migrate**
- 标准化的迁移管理
- 版本追踪和回滚
- 混合方案兼顾灵活性
- 完整的工具链支持

**下一步：**
```bash
make -f Makefile.migrate migrate-hybrid
```

---

**版本**: 1.0  
**日期**: 2025-10-08  
**状态**: ✅ 生产就绪

