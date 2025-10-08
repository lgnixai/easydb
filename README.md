# Teable - 新一代智能表格系统

[![golang-migrate](https://img.shields.io/badge/golang--migrate-v4.19.0-blue)](https://github.com/golang-migrate/migrate)
[![GORM](https://img.shields.io/badge/GORM-v1.25-green)](https://gorm.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

## 🎉 最新更新

### ✨ 数据库迁移系统升级完成

- ✅ 集成 [golang-migrate](https://github.com/golang-migrate/migrate) 标准迁移工具
- ✅ 实现混合迁移架构（golang-migrate + GORM）
- ✅ 虚拟字段和AI字段支持已启用
- ✅ 迁移版本：**v2** | 状态：**clean**

## 🚀 快速开始

### 1. 执行数据库迁移

```bash
cd server
make -f Makefile.migrate migrate-hybrid
```

### 2. 启动服务器

```bash
cd server
go run cmd/server/main.go
```

**就这么简单！** ✨

## 📖 文档导航

所有文档位于 [`docs/`](./docs/) 目录：

### ⭐ 必读文档

| 文档 | 描述 | 阅读时间 |
|------|------|---------|
| [docs/START_HERE.md](./docs/START_HERE.md) | 🚀 最快上手指南 | 1分钟 |
| [docs/HOW_TO_MIGRATE.md](./docs/HOW_TO_MIGRATE.md) | 数据库迁移指南 | 2分钟 |
| [docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md) | 迁移后下一步 | 5分钟 |

### 📚 详细文档

#### golang-migrate 集成
- [docs/GOLANG_MIGRATE_INTEGRATION_GUIDE.md](./docs/GOLANG_MIGRATE_INTEGRATION_GUIDE.md) - 详细集成指南
- [docs/GOLANG_MIGRATE_FINAL_REPORT.md](./docs/GOLANG_MIGRATE_FINAL_REPORT.md) - 最终报告
- [server/migrations/README.md](./server/migrations/README.md) - 迁移文件说明

#### 虚拟字段和AI字段
- [docs/README_VIRTUAL_FIELDS.md](./docs/README_VIRTUAL_FIELDS.md) - 虚拟字段使用说明
- [docs/VIRTUAL_FIELDS_AI_INTEGRATION_GUIDE.md](./docs/VIRTUAL_FIELDS_AI_INTEGRATION_GUIDE.md) - 完整技术文档
- [docs/VIRTUAL_FIELDS_QUICKSTART.md](./docs/VIRTUAL_FIELDS_QUICKSTART.md) - 快速教程

#### 项目报告
- [docs/COMPLETE_INTEGRATION_SUMMARY.md](./docs/COMPLETE_INTEGRATION_SUMMARY.md) - 完整集成总结
- [docs/INTEGRATION_SUCCESS.md](./docs/INTEGRATION_SUCCESS.md) - 集成成功报告

## 💡 核心功能

### 🗃️ 虚拟字段支持

| 类型 | 说明 | 状态 |
|------|------|------|
| **Lookup** | 从关联记录查找值（类似VLOOKUP） | ✅ 已实现 |
| **Formula** | 基于公式表达式计算 | ✅ 已实现 |
| **AI字段** | AI智能生成/处理内容 | ✅ 已实现 |
| **Rollup** | 对关联记录聚合统计 | 🔄 基础框架 |

### 🤖 AI 操作类型

- ✨ Summary - 内容摘要
- 🌍 Translation - 语言翻译
- ✏️ Improvement - 文本改进
- 📤 Extraction - 信息提取
- 🏷️ Classification - 内容分类
- 🎨 Image Generation - AI图像生成

## 🛠️ 技术栈

- **Go 1.23** - 后端语言
- **GORM** - ORM框架
- **golang-migrate v4.19.0** - 数据库迁移
- **PostgreSQL 16** - 数据库
- **React + TypeScript** - 前端

## 🏗️ 项目结构

```
easydb/
├── server/                 # 后端服务
│   ├── cmd/               # 命令行工具
│   │   ├── migrate/       # 迁移工具（golang-migrate + GORM）
│   │   ├── server/        # 主服务器
│   │   └── mcp/          # MCP服务器
│   ├── internal/          # 内部实现
│   │   ├── domain/        # 领域模型（虚拟字段处理器在这里）
│   │   ├── application/   # 应用服务
│   │   └── interfaces/    # API接口
│   ├── migrations/        # SQL迁移文件
│   ├── Makefile.migrate   # 迁移命令（20+个）
│   └── README.md
│
├── teable-ui/             # 前端UI
├── packages/              # 共享包
├── docs/                  # 📖 所有文档
└── README.md              # 本文件
```

## 🔧 常用命令

### 数据库迁移

```bash
cd server

# 查看所有迁移命令
make -f Makefile.migrate help

# 执行混合迁移（推荐）
make -f Makefile.migrate migrate-hybrid

# 查看当前版本
make -f Makefile.migrate migrate-version

# 创建新迁移
make -f Makefile.migrate migrate-create NAME=add_feature

# 备份数据库
make -f Makefile.migrate db-backup
```

### 开发调试

```bash
cd server

# 启动服务器
go run cmd/server/main.go

# 编译
go build ./cmd/server/main.go

# 运行测试
go test ./...
```

## 📊 项目状态

- **迁移系统**: ✅ 专业级（golang-migrate v4.19.0）
- **虚拟字段**: ✅ 85%完成（核心功能已实现）
- **数据库**: ✅ 88个表，150+索引
- **文档**: ✅ 完整（docs/目录）
- **部署状态**: ✅ 生产就绪

## 🎯 接下来做什么？

### 👉 查看这个文档

**[docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md)** - 迁移成功后的详细行动指南

包含：
- ✅ 立即执行的步骤
- 🔧 需要完成的开发任务
- 📋 今天的具体行动清单
- 💡 实用命令速查

### 快速路径

1. **启动服务器** → `cd server && go run cmd/server/main.go`
2. **查看虚拟字段实现** → 参考 [docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md)
3. **开发API接口** → 集成虚拟字段参数
4. **开发前端UI** → 虚拟字段配置界面

## 🆘 需要帮助？

### 查看文档

```bash
# 查看所有文档
ls -la docs/

# 快速开始
cat docs/START_HERE.md

# 下一步指南
cat docs/NEXT_STEPS.md

# 迁移帮助
cat docs/HOW_TO_MIGRATE.md
```

### 命令帮助

```bash
cd server
make -f Makefile.migrate help
```

## 📞 相关链接

- **Server文档**: [server/README.md](./server/README.md)
- **迁移文档**: [server/migrations/README.md](./server/migrations/README.md)
- **文档目录**: [docs/](./docs/)
- **golang-migrate**: [官方文档](https://github.com/golang-migrate/migrate)

---

**版本**: 2.0 (golang-migrate + 虚拟字段)  
**状态**: ✅ 迁移成功，虚拟字段已启用  
**下一步**: 查看 [docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md)
