# AI 侧边栏快速开始

## 5 分钟上手

### 1. 安装 Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# 访问 https://ollama.ai/download 下载安装包
```

### 2. 启动 Ollama 并下载模型

```bash
# 启动服务（后台运行）
ollama serve &

# 下载推荐模型
ollama pull llama3.2
```

### 3. 配置项目

在 `teable-ui` 目录创建 `.env` 文件：

```env
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```

### 4. 启动项目

```bash
cd teable-ui
pnpm install
pnpm dev
```

### 5. 开始使用

1. 打开浏览器访问 http://localhost:5173
2. 登录系统
3. 在右侧边栏看到 "🤖 AI 助手"
4. 输入命令，例如：

```
创建一个员工信息表
```

5. 点击"确认"执行操作
6. 查看左侧目录树，新表已创建！

## 常用命令速查

| 需求 | 命令示例 |
|------|---------|
| 创建空间 | `创建一个空间：公司管理` |
| 创建数据库 | `创建数据库：人事系统` |
| 创建表格 | `创建一个员工表` |
| 添加单个字段 | `添加姓名字段` |
| 添加多个字段 | `添加字段：姓名（文本）、邮箱（邮箱）、年龄（数字）` |
| 查询表格列表 | `列出当前数据库的所有表` |
| 创建记录 | `添加一个员工：张三，邮箱zhang@example.com` |

## 测试是否正常工作

### 测试 Ollama

```bash
# 测试服务
curl http://localhost:11434/api/tags

# 测试模型
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello"
}'
```

### 测试 AI 侧边栏

1. 打开 AI 侧边栏
2. 输入：`你好`
3. 如果 AI 回复了，说明配置成功！

## 故障排除

### Ollama 无法启动

```bash
# 查看进程
ps aux | grep ollama

# 杀掉旧进程
killall ollama

# 重新启动
ollama serve
```

### 模型下载失败

```bash
# 使用代理（如果需要）
export HTTP_PROXY=http://localhost:7890
export HTTPS_PROXY=http://localhost:7890

# 重新下载
ollama pull llama3.2
```

### AI 无响应

1. 检查 Ollama 服务：`curl http://localhost:11434/api/tags`
2. 检查浏览器控制台错误
3. 重启开发服务器：`pnpm dev`

## 下一步

- 阅读[完整使用指南](./AI_SIDEBAR_USER_GUIDE.md)
- 查看[设计文档](./AI_SIDEBAR_DESIGN.md)
- 探索更多 AI 命令

## 获取帮助

遇到问题？
1. 查看 AI 侧边栏的错误提示
2. 检查浏览器开发者工具的控制台
3. 阅读完整文档

享受 AI 助手带来的便捷体验！🚀

