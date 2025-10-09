# MCP 快速开始指南

5 分钟快速上手标准 MCP 协议。

## 🚀 快速开始

### 第 1 步：启动 MCP 服务器

```bash
# 进入 MCP 服务器目录
cd server/cmd/mcp

# 启动 HTTP 模式服务器
go run main.go -mode=http -port=3001
```

看到以下输出表示成功：
```
Starting MCP server in HTTP mode on port 3001...
```

### 第 2 步：测试 MCP 服务器

在新终端测试：

```bash
# 健康检查
curl http://localhost:3001/health

# 预期输出：
# {"service":"teable-mcp-server","status":"healthy","mode":"http","timestamp":"...","version":"1.0.0"}

# 获取工具列表
curl http://localhost:3001/mcp/tools

# 预期输出：工具列表
```

### 第 3 步：配置前端环境变量

创建或编辑 `teable-ui/.env`：

```bash
# Ollama 配置
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2

# MCP 服务器配置（新增）
VITE_MCP_SERVER_URL=http://localhost:3001

# Teable 后端 API
VITE_TEABLE_BASE_URL=http://127.0.0.1:8080
```

### 第 4 步：在前端使用 MCP

#### 选项 A：使用完整的 AI 侧边栏（推荐）

```typescript
// 在你的主布局组件中
import { AISidebarWithMCP } from '@/components/AISidebar/AISidebarWithMCP';

function Layout() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">
        {/* 你的主内容 */}
      </main>
      
      {/* MCP AI 侧边栏 */}
      <div className="w-96">
        <AISidebarWithMCP
          mcpServerUrl="http://localhost:3001"
          spaceId={currentSpaceId}
          baseId={currentBaseId}
          tableId={currentTableId}
          onActionComplete={() => {
            // 操作完成后的回调
            refreshData();
          }}
        />
      </div>
    </div>
  );
}
```

#### 选项 B：直接使用 MCP 客户端

```typescript
import { useMCPClient } from '@/components/AISidebar/hooks/useMCPClient';

function MyComponent() {
  const mcp = useMCPClient({
    baseUrl: 'http://localhost:3001',
    transport: 'http',
    autoConnect: true
  });

  const createSpace = async () => {
    try {
      const result = await mcp.callTool('teable_space_create', {
        name: '我的第一个空间',
        description: '使用 MCP 创建'
      });
      console.log('创建成功:', result);
    } catch (err) {
      console.error('创建失败:', err);
    }
  };

  return (
    <div>
      <p>MCP 状态: {mcp.connected ? '✅ 已连接' : '❌ 未连接'}</p>
      <p>可用工具: {mcp.tools.length}</p>
      <button onClick={createSpace}>创建空间</button>
    </div>
  );
}
```

### 第 5 步：测试 AI + MCP 集成

启动前端后，在 AI 侧边栏输入：

```
创建一个名为"员工管理"的空间
```

AI 会：
1. 理解你的意图
2. 调用 MCP 工具 `teable_space_create`
3. 返回创建结果

## 📝 常用命令示例

### 创建空间
```
用户: 创建一个项目管理空间
AI: ✅ 好的，我将创建空间"项目管理"
```

### 创建数据库
```
用户: 在当前空间创建一个数据库叫"客户数据"
AI: ✅ 已在空间中创建数据库"客户数据"
```

### 创建表格
```
用户: 创建一个员工表
AI: ✅ 已创建表格"员工表"
```

### 添加字段
```
用户: 给员工表添加姓名、邮箱、电话三个字段
AI: ✅ 已添加 3 个字段
```

## 🔧 故障排查

### MCP 服务器无法启动

```bash
# 检查端口是否被占用
lsof -i :3001

# 使用其他端口
go run main.go -mode=http -port=3002
```

### 前端无法连接 MCP

```bash
# 1. 检查 MCP 服务器是否运行
curl http://localhost:3001/health

# 2. 检查环境变量
echo $VITE_MCP_SERVER_URL

# 3. 查看浏览器控制台
# 应该看到 "[MCP] 连接成功" 日志
```

### AI 无法调用工具

1. 确保 Ollama 正在运行：
```bash
curl http://localhost:11434/api/tags
```

2. 检查模型是否安装：
```bash
ollama list
```

3. 如果没有模型，安装一个：
```bash
ollama pull llama3.2
```

## 🎯 下一步

- ✅ 完成快速开始
- 📖 阅读完整文档：[MCP_STANDARD_USAGE.md](./MCP_STANDARD_USAGE.md)
- 🔧 了解更多工具：查看 `server/cmd/mcp/main.go` 中的 `registerCoreTools`
- 🚀 添加自定义工具：参考现有工具实现

## 💡 提示

1. **开发模式**：使用 HTTP 传输最简单
2. **生产环境**：考虑使用 SSE 或 WebSocket
3. **性能优化**：启用连接池和缓存
4. **安全性**：添加身份验证和权限控制

## 🆘 获取帮助

- 查看日志：MCP 服务器和前端控制台
- 阅读完整文档：[MCP_STANDARD_USAGE.md](./MCP_STANDARD_USAGE.md)
- 查看示例代码：`teable-ui/src/components/AISidebar/`

---

**开始使用标准 MCP 协议，享受更强大的 AI 集成能力！** 🎉

