#!/bin/bash

echo "🚀 准备合并 feature/fields 到 main..."
echo ""

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"
echo ""

if [ "$CURRENT_BRANCH" != "feature/fields" ]; then
    echo "⚠️  警告: 当前不在 feature/fields 分支"
    echo "切换到 feature/fields..."
    git checkout feature/fields
fi

echo "📦 步骤1: 提交当前分支的更改..."
git add docs/
git status --short

read -p "确认提交这些文件? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "docs: 添加虚拟字段和迁移相关文档"
    echo "✅ 已提交docs/更改"
else
    echo "❌ 已取消"
    exit 1
fi

echo ""
echo "📦 步骤2: 推送feature/fields分支..."
git push origin feature/fields
echo "✅ 已推送feature/fields"

echo ""
echo "🔄 步骤3: 切换到main分支..."
git checkout main
git pull origin main
echo "✅ main分支已更新"

echo ""
echo "🔗 步骤4: 合并feature/fields..."
git merge feature/fields
echo "✅ 已合并feature/fields"

echo ""
echo "📤 步骤5: 推送main分支..."
git push origin main
echo "✅ 已推送main"

echo ""
echo "🎉 合并完成！"
echo ""
echo "验证:"
git log --oneline -3

