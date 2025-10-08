# 🚀 数据库迁移 - 快速指南

## 一条命令执行迁移

```bash
cd /Users/leven/space/easy/easydb/server
make -f Makefile.migrate migrate-hybrid
```

就这么简单！✅

## 📋 详细步骤

### 第1步：进入server目录

```bash
cd /Users/leven/space/easy/easydb/server
```

### 第2步：执行迁移

#### 方式1：使用 Makefile（推荐）⭐

```bash
make -f Makefile.migrate migrate-hybrid
```

#### 方式2：直接运行

```bash
go run cmd/migrate/main.go hybrid
```

#### 方式3：编译后执行

```bash
go build -o bin/migrate cmd/migrate/main.go
./bin/migrate hybrid
```

### 第3步：验证结果

```bash
# 查看迁移版本
make -f Makefile.migrate migrate-version

# 期望输出：
# 📌 当前迁移版本信息:
#    版本号: 2
#    状态: clean
```

## 🎉 完成！

迁移成功后：
- ✅ 所有表已创建/更新（88个表）
- ✅ 虚拟字段支持已添加
- ✅ 索引和约束已创建
- ✅ 可以启动服务器

```bash
go run cmd/server/main.go
```

## 🆘 遇到问题？

### 问题：数据库连接失败

**检查配置：**
```bash
cat config.yaml
```

**或设置环境变量：**
```bash
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your_password
export POSTGRES_DB=easytable
```

### 问题：迁移状态为 dirty

**解决方法：**
```bash
# 强制设置版本为2
make -f Makefile.migrate migrate-force VERSION=2

# 重新执行迁移
make -f Makefile.migrate migrate-up
```

## 📚 更多帮助

### 查看所有命令

```bash
make -f Makefile.migrate help
```

### 查看详细文档

- [集成指南](./GOLANG_MIGRATE_INTEGRATION_GUIDE.md)
- [迁移文件说明](./server/migrations/README.md)
- [最终报告](./GOLANG_MIGRATE_FINAL_REPORT.md)

## 💡 常用命令

```bash
# 查看迁移版本
make -f Makefile.migrate migrate-version

# 创建新迁移
make -f Makefile.migrate migrate-create NAME=add_feature

# 回滚迁移
make -f Makefile.migrate migrate-down

# 备份数据库
make -f Makefile.migrate db-backup

# 连接数据库
make -f Makefile.migrate db-console
```

---

**版本**: 1.0  
**更新**: 2025-10-08  
**状态**: ✅ 可用

**开始迁移**: `make -f Makefile.migrate migrate-hybrid`

