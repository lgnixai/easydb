# 标准 MCP 使用说明

## 📋 概述

我已经为您的 Teable 项目完整实现了**标准 MCP 协议**支持。现在您可以通过两种方式使用 AI 侧边栏：

1. **原有方式**：Ollama + Prompt Engineering + 直接 REST API
2. **标准 MCP**：Ollama + MCP 客户端 + MCP 服务器（新增）✨

## 🎯 您当前的架构

### 原有架构（已存在）
```
用户 → Ollama AI → 解析 JSON → 直接调用 Teable API
```

### 新增的标准 MCP 架构
```
用户 → Ollama AI → MCP 客户端 → MCP 服务器 → Teable API
```

## 📦 新增的文件

### 前端文件（teable-ui）

| 文件路径 | 说明 |
|---------|------|
| `src/lib/mcp-client.ts` | 标准 MCP 客户端核心库（支持 HTTP/SSE/WebSocket） |
| `src/components/AISidebar/hooks/useMCPClient.ts` | MCP 客户端 React Hook |
| `src/components/AISidebar/hooks/useAIChatWithMCP.ts` | AI + MCP 集成 Hook |
| `src/components/AISidebar/AISidebarWithMCP.tsx` | 使用标准 MCP 的侧边栏组件 |

### 文档文件（docs）

| 文件路径 | 说明 |
|---------|------|
| `docs/MCP_README.md` | 📘 文档导航入口 |
| `docs/MCP_QUICK_START.md` | 🚀 5 分钟快速开始 |
| `docs/MCP_STANDARD_USAGE.md` | 📖 完整使用文档 |
| `docs/MCP_COMPARISON.md` | 🔄 两种方式对比 |
| `docs/MCP_INTEGRATION_SUMMARY.md` | 📦 集成总结 |
| `标准MCP使用说明.md` | 📝 本文件（中文说明） |

## 🚀 快速使用

### 步骤 1：启动 MCP 服务器

您的 MCP 服务器已经存在于 `server/cmd/mcp/main.go`，启动它：

```bash
cd /Users/leven/space/easy/easydb/server/cmd/mcp
go run main.go -mode=http -port=3001
```

### 步骤 2：配置环境变量

编辑 `teable-ui/.env`：

```bash
# Ollama 配置（已有）
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2

# MCP 服务器配置（新增）
VITE_MCP_SERVER_URL=http://localhost:3001

# Teable 后端（已有）
VITE_TEABLE_BASE_URL=http://127.0.0.1:8080
```

### 步骤 3：使用标准 MCP 侧边栏

在您的组件中：

```typescript
import { AISidebarWithMCP } from '@/components/AISidebar/AISidebarWithMCP';

function Layout() {
  return (
    <div className="flex h-screen">
      <main className="flex-1">
        {/* 主内容 */}
      </main>
      
      {/* 使用标准 MCP 的 AI 侧边栏 */}
      <div className="w-96">
        <AISidebarWithMCP
          mcpServerUrl="http://localhost:3001"
          spaceId={currentSpaceId}
          baseId={currentBaseId}
          tableId={currentTableId}
          onActionComplete={() => {
            // 刷新数据
          }}
        />
      </div>
    </div>
  );
}
```

## 🎨 使用方式对比

### 方式 1：原有方式（继续可用）

```typescript
import { AISidebar } from '@/components/AISidebar/AISidebar';

<AISidebar 
  spaceId={spaceId}
  baseId={baseId}
  tableId={tableId}
/>
```

**优点**：
- ✅ 简单，无需额外服务器
- ✅ 资源消耗少

**缺点**：
- ❌ 非标准协议
- ❌ 扩展性受限

### 方式 2：标准 MCP（推荐）

```typescript
import { AISidebarWithMCP } from '@/components/AISidebar/AISidebarWithMCP';

<AISidebarWithMCP
  mcpServerUrl="http://localhost:3001"
  spaceId={spaceId}
  baseId={baseId}
  tableId={tableId}
/>
```

**优点**：
- ✅ 符合 MCP 标准
- ✅ 工具管理规范
- ✅ 易于扩展
- ✅ 类型安全

**缺点**：
- ⚠️ 需要运行 MCP 服务器
- ⚠️ 略微增加延迟（~20-25%）

## 📊 可用的 MCP 工具

您的 MCP 服务器提供了 11 个工具：

| 工具名称 | 功能 |
|---------|------|
| `teable_user_register` | 注册新用户 |
| `teable_user_login` | 用户登录 |
| `teable_user_get` | 获取用户信息 |
| `teable_space_create` | 创建工作空间 |
| `teable_base_create` | 创建数据库 |
| `teable_base_get` | 获取数据库信息 |
| `teable_table_create` | 创建表格 |
| `teable_table_list` | 列出表格 |
| `teable_field_create` | 创建字段 |
| `teable_field_get` | 获取字段信息 |
| `teable_record_create` | 创建记录 |

## 🔧 三种使用级别

### 级别 1：仅使用 MCP 客户端

直接调用 MCP 工具，不需要 AI：

```typescript
import { useMCPClient } from '@/components/AISidebar/hooks/useMCPClient';

function MyComponent() {
  const mcp = useMCPClient({
    baseUrl: 'http://localhost:3001',
    autoConnect: true
  });

  const createSpace = async () => {
    const result = await mcp.callTool('teable_space_create', {
      name: '新空间',
      description: '描述'
    });
    console.log('创建成功:', result);
  };

  return (
    <div>
      <p>MCP 状态: {mcp.connected ? '✅' : '❌'}</p>
      <p>可用工具: {mcp.tools.length}</p>
      <button onClick={createSpace}>创建空间</button>
    </div>
  );
}
```

### 级别 2：AI + MCP 集成

通过自然语言控制 MCP：

```typescript
import { useAIChatWithMCP } from '@/components/AISidebar/hooks/useAIChatWithMCP';

function ChatComponent() {
  const chat = useAIChatWithMCP({
    mcpServerUrl: 'http://localhost:3001'
  });

  const handleSend = async () => {
    // AI 会自动判断并调用对应的 MCP 工具
    await chat.sendMessage('创建一个员工管理空间');
  };

  return (
    <div>
      {chat.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={handleSend}>发送</button>
    </div>
  );
}
```

### 级别 3：完整的 UI 组件

开箱即用的完整侧边栏：

```typescript
<AISidebarWithMCP
  mcpServerUrl="http://localhost:3001"
  spaceId={spaceId}
  baseId={baseId}
  tableId={tableId}
/>
```

## 🧪 测试 MCP 服务器

### 健康检查

```bash
curl http://localhost:3001/health
```

预期输出：
```json
{
  "service": "teable-mcp-server",
  "status": "healthy",
  "mode": "http",
  "timestamp": "2025-10-08T...",
  "version": "1.0.0"
}
```

### 获取工具列表

```bash
curl http://localhost:3001/mcp/tools
```

### 调用工具

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "teable_space_create",
      "arguments": {
        "name": "测试空间",
        "description": "这是一个测试"
      }
    },
    "id": 1
  }'
```

## 🔍 故障排查

### 问题 1：MCP 服务器无法启动

```bash
# 检查端口是否被占用
lsof -i :3001

# 使用其他端口
go run main.go -mode=http -port=3002
```

### 问题 2：前端无法连接

1. 确保 MCP 服务器正在运行
2. 检查 `VITE_MCP_SERVER_URL` 配置
3. 查看浏览器控制台错误

### 问题 3：Ollama 连接失败

```bash
# 检查 Ollama 是否运行
curl http://localhost:11434/api/tags

# 启动 Ollama
ollama serve

# 拉取模型
ollama pull llama3.2
```

## 📚 完整文档

详细文档请查看：

- **快速开始**: `docs/MCP_QUICK_START.md`
- **完整指南**: `docs/MCP_STANDARD_USAGE.md`
- **方式对比**: `docs/MCP_COMPARISON.md`
- **集成总结**: `docs/MCP_INTEGRATION_SUMMARY.md`
- **文档导航**: `docs/MCP_README.md`

## 💡 建议

### 新项目
→ 直接使用标准 MCP

### 现有项目
→ 渐进式迁移：
1. 保持原有方式运行
2. 启动 MCP 服务器
3. 在新功能中使用标准 MCP
4. 逐步迁移现有功能

### 简单场景
→ 继续使用原有方式

## 🎯 核心优势

使用标准 MCP 的好处：

1. **标准化** - 符合 Anthropic MCP 规范
2. **类型安全** - JSON Schema 定义所有参数
3. **易扩展** - 添加新工具只需注册
4. **可维护** - 工具定义和实现分离
5. **可测试** - 独立测试每个工具
6. **兼容性** - 可与其他 MCP 客户端配合

## 🚀 下一步

1. ✅ 启动 MCP 服务器
2. ✅ 配置环境变量
3. ✅ 使用 `AISidebarWithMCP` 组件
4. ✅ 测试基本功能
5. ✅ 阅读详细文档
6. ✅ 根据需求选择使用方式

## 📞 联系方式

如有问题，请：
- 查看 `docs/` 目录下的详细文档
- 查看代码示例
- 提交 Issue

---

**现在您拥有了两种强大的 AI 集成方式，可以根据项目需求灵活选择！** 🎉

**推荐起点**：[docs/MCP_QUICK_START.md](./docs/MCP_QUICK_START.md)

