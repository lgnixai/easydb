# 合并到 main 分支指南

## 📋 当前状态

- **当前分支**: feature/fields
- **目标分支**: main
- **变更内容**: 虚拟字段和golang-migrate集成

## ✅ 合并前检查清单

### 1. 确认所有更改已提交

```bash
cd /Users/leven/space/easy/easydb

# 查看状态
git status

# 如果有未提交的更改，先提交
git add .
git commit -m "feat: 集成虚拟字段和golang-migrate标准迁移工具"
```

### 2. 确认编译通过

```bash
cd server

# 编译测试
go build ./cmd/server/main.go
go build ./cmd/migrate/main.go

# 应该看到：✅ 编译成功
```

### 3. 确认迁移成功

```bash
# 查看迁移版本
make -f Makefile.migrate migrate-version

# 应该看到：
# 版本号: 2
# 状态: clean
```

### 4. 确认服务器正常

```bash
# 启动测试
go run cmd/server/main.go

# 应该正常启动无错误
```

## 🔄 合并步骤（推荐方式）

### 方式一：通过 Pull Request（推荐）⭐

**适用于**: 团队协作，需要 Code Review

```bash
# 1. 确保当前分支已推送
git push origin feature/fields

# 2. 在 GitHub/GitLab 上创建 Pull Request
#    - Source: feature/fields
#    - Target: main
#    - Title: "feat: 集成虚拟字段和golang-migrate标准迁移工具"

# 3. 等待 Review 和批准

# 4. 合并 PR
#    - 选择合并方式：Squash and merge 或 Merge commit

# 5. 本地更新 main
git checkout main
git pull origin main
```

### 方式二：本地合并（快速）

**适用于**: 个人项目，确认无冲突

```bash
cd /Users/leven/space/easy/easydb

# 1. 切换到 main 分支
git checkout main

# 2. 拉取最新代码
git pull origin main

# 3. 合并 feature/fields
git merge feature/fields

# 4. 推送到远程
git push origin main
```

### 方式三：Rebase 后合并（保持历史整洁）

**适用于**: 想要线性提交历史

```bash
cd /Users/leven/space/easy/easydb

# 1. 在 feature/fields 分支上 rebase main
git checkout feature/fields
git fetch origin
git rebase origin/main

# 2. 解决冲突（如果有）
# git add <resolved files>
# git rebase --continue

# 3. 切换到 main 并合并
git checkout main
git merge feature/fields --ff-only

# 4. 推送
git push origin main
```

## ⚠️ 合并前注意事项

### 1. 备份当前工作

```bash
# 创建备份分支
git branch feature/fields-backup

# 或导出patch
git diff main > feature-fields.patch
```

### 2. 检查冲突

```bash
# 模拟合并，查看是否有冲突
git merge main --no-commit --no-ff

# 如果有冲突，会显示冲突文件
# 取消模拟合并
git merge --abort
```

### 3. 运行测试

```bash
cd server

# 运行所有测试
go test ./...

# 如果有测试失败，先修复
```

## 🔍 处理冲突

如果合并时出现冲突：

### 1. 查看冲突文件

```bash
git status

# 显示冲突的文件
# both modified: server/...
```

### 2. 解决冲突

```bash
# 编辑冲突文件，查找 <<<<<<< 标记
# 保留需要的代码，删除冲突标记

# 标记为已解决
git add <resolved file>
```

### 3. 完成合并

```bash
git commit -m "Merge feature/fields into main"
```

## 📝 推荐的提交信息

### 合并提交模板

```
feat: 集成虚拟字段和golang-migrate标准迁移工具

主要变更：
- 集成 golang-migrate v4.19.0 标准迁移工具
- 实现混合迁移架构（golang-migrate + GORM）
- 添加虚拟字段完整支持（Lookup/Formula/AI/Rollup）
- 新增2个虚拟字段API接口
- 创建Makefile.migrate（20+个命令）
- 完整文档（31份）

数据库变更：
- 执行迁移版本2
- field表新增5个字段
- 新增field_dependency和virtual_field_cache表
- 添加8个索引和4个外键约束

API变更：
- POST /api/fields/:id/calculate - 计算虚拟字段
- GET /api/fields/:id/virtual-info - 获取虚拟字段配置
- CreateField API 支持虚拟字段参数

完成度：95%
状态：生产就绪
文档：docs/ 目录（31份）
```

## 🎯 合并后的验证

### 1. 验证 main 分支

```bash
# 切换到 main
git checkout main

# 检查提交历史
git log --oneline -5

# 验证文件
ls -la docs/
ls -la server/migrations/
```

### 2. 在 main 分支重新测试

```bash
cd server

# 编译
go build ./cmd/server/main.go

# 启动
go run cmd/server/main.go

# 验证迁移
make -f Makefile.migrate migrate-version
```

### 3. 标记版本（可选）

```bash
# 创建版本标签
git tag -a v2.0.0 -m "虚拟字段和golang-migrate集成版本"

# 推送标签
git push origin v2.0.0
```

## 📊 合并检查表

- [ ] ✅ 所有更改已提交
- [ ] ✅ 编译测试通过
- [ ] ✅ 服务器启动正常
- [ ] ✅ 迁移版本正确（v2，clean）
- [ ] ✅ 无冲突或冲突已解决
- [ ] ✅ 代码审查通过（如需要）
- [ ] ✅ 测试通过
- [ ] ✅ 文档完整

## 🆘 遇到问题？

### 问题：合并冲突

**解决步骤**:
1. 查看冲突文件：`git status`
2. 手动编辑解决冲突
3. 标记已解决：`git add <file>`
4. 完成合并：`git commit`

### 问题：误操作需要撤销

**撤销合并**:
```bash
# 如果还未推送
git reset --hard HEAD~1

# 如果已推送（创建回退提交）
git revert HEAD
git push
```

### 问题：想要重新合并

**重置到合并前**:
```bash
# 回到合并前状态
git checkout main
git reset --hard origin/main

# 重新合并
git merge feature/fields
```

## 💡 最佳实践

### 1. 合并前沟通

如果是团队项目：
- 📢 通知团队即将合并
- 📋 说明主要变更
- ✅ 获得批准

### 2. 增量合并

如果更改很大：
- 考虑分多个小的PR合并
- 每个PR专注一个功能
- 便于Review和回滚

### 3. 合并后清理

```bash
# 删除已合并的本地分支
git branch -d feature/fields

# 删除远程分支（如果需要）
git push origin --delete feature/fields
```

## 📞 快速参考

```bash
# 快速合并流程（无冲突情况）
git checkout main
git pull origin main
git merge feature/fields
git push origin main

# 验证
git log --oneline -5
```

---

**建议**: 使用 Pull Request 方式，更安全和专业

**下一步**: 创建 PR 或执行本地合并

**备份**: 合并前建议备份：`git branch feature/fields-backup`

