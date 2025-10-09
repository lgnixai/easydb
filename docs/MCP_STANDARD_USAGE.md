# 标准 MCP 协议使用指南

本文档说明如何在 Teable 项目中使用标准的 Model Context Protocol (MCP) 协议。

## 📋 目录

- [架构概览](#架构概览)
- [后端 MCP 服务器](#后端-mcp-服务器)
- [前端 MCP 客户端](#前端-mcp-客户端)
- [使用示例](#使用示例)
- [配置说明](#配置说明)
- [传输方式](#传输方式)
- [故障排查](#故障排查)

## 🏗️ 架构概览

### 标准 MCP 架构

```
┌─────────────────┐          ┌──────────────────┐
│  前端 UI        │          │  MCP 服务器       │
│  ┌───────────┐  │  JSON-   │  ┌─────────────┐  │
│  │ AI 助手   │  │  RPC     │  │ MCP Tools   │  │
│  │           │──┼──────────┼─▶│             │  │
│  │ Ollama    │  │  over    │  │ - Space     │  │
│  │ + MCP     │  │  HTTP/   │  │ - Base      │  │
│  │ Client    │  │  SSE/WS  │  │ - Table     │  │
│  └───────────┘  │          │  │ - Field     │  │
└─────────────────┘          │  │ - Record    │  │
                             │  └─────────────┘  │
                             └──────────────────┘
```

### 工作流程

1. **用户输入** → AI 侧边栏
2. **Ollama AI** 分析意图 → 决定调用哪个 MCP 工具
3. **MCP 客户端** 发送标准 JSON-RPC 请求 → MCP 服务器
4. **MCP 服务器** 执行工具 → 返回结果
5. **前端** 显示结果给用户

## 🖥️ 后端 MCP 服务器

### 启动服务器

MCP 服务器位于 `server/cmd/mcp/main.go`，支持 4 种运行模式：

#### 1. HTTP 模式（推荐）

```bash
cd server/cmd/mcp
go run main.go -mode=http -port=3001
```

**特点**：
- ✅ 简单易用，适合开发调试
- ✅ 支持跨域 (CORS)
- ✅ 支持健康检查
- ❌ 不支持流式响应

**端点**：
- `POST /mcp` - MCP JSON-RPC 端点
- `GET /mcp/tools` - 获取工具列表
- `GET /mcp/info` - 获取服务器信息
- `GET /health` - 健康检查

#### 2. SSE 模式（流式）

```bash
go run main.go -mode=sse -port=3001
```

**特点**：
- ✅ 支持服务器推送事件
- ✅ 适合长时间运行的任务
- ✅ 自动重连
- ⚠️ 配置稍复杂

#### 3. WebSocket 模式（双向）

```bash
go run main.go -mode=websocket -port=3001
```

**特点**：
- ✅ 全双工通信
- ✅ 低延迟
- ✅ 适合实时场景
- ⚠️ 需要处理连接管理

#### 4. stdio 模式（命令行）

```bash
go run main.go -mode=stdio
```

**特点**：
- ✅ 与 Claude Desktop 等工具兼容
- ❌ 不适合 Web 前端

### 可用工具

| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `teable_user_register` | 注册新用户 | name, email, password, phone? |
| `teable_user_login` | 用户登录 | email, password |
| `teable_user_get` | 获取用户信息 | user_id |
| `teable_space_create` | 创建空间 | name, description? |
| `teable_base_create` | 创建数据库 | space_id, name, description? |
| `teable_base_get` | 获取数据库信息 | base_id |
| `teable_table_create` | 创建表格 | base_id, name, description? |
| `teable_table_list` | 列出表格 | base_id |
| `teable_field_create` | 创建字段 | table_id, name, type, ... |
| `teable_field_get` | 获取字段信息 | field_id |
| `teable_record_create` | 创建记录 | table_id, fields |

### 测试 MCP 服务器

```bash
# 健康检查
curl http://localhost:3001/health

# 获取工具列表
curl http://localhost:3001/mcp/tools

# 调用工具（创建空间）
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "teable_space_create",
      "arguments": {
        "name": "我的测试空间",
        "description": "这是一个测试空间"
      }
    },
    "id": 1
  }'
```

## 🌐 前端 MCP 客户端

### 文件结构

```
teable-ui/src/
├── lib/
│   └── mcp-client.ts                    # MCP 客户端核心库
├── components/AISidebar/
│   ├── hooks/
│   │   ├── useMCPClient.ts              # MCP 客户端 Hook
│   │   └── useAIChatWithMCP.ts          # AI + MCP 集成 Hook
│   ├── AISidebarWithMCP.tsx             # 使用 MCP 的侧边栏组件
│   └── ...
```

### 基础使用

#### 1. 使用 MCP 客户端 Hook

```typescript
import { useMCPClient } from '@/components/AISidebar/hooks/useMCPClient';

function MyComponent() {
  const mcp = useMCPClient({
    baseUrl: 'http://localhost:3001',
    transport: 'http',
    autoConnect: true
  });

  // 列出工具
  const handleListTools = async () => {
    const tools = await mcp.listTools();
    console.log('可用工具:', tools);
  };

  // 调用工具
  const handleCreateSpace = async () => {
    const result = await mcp.callTool('teable_space_create', {
      name: '我的空间',
      description: '测试空间'
    });
    console.log('创建结果:', result);
  };

  return (
    <div>
      <p>MCP 状态: {mcp.connected ? '已连接' : '未连接'}</p>
      <p>可用工具: {mcp.tools.length}</p>
      <button onClick={handleListTools}>列出工具</button>
      <button onClick={handleCreateSpace}>创建空间</button>
    </div>
  );
}
```

#### 2. 使用 AI + MCP 集成

```typescript
import { useAIChatWithMCP } from '@/components/AISidebar/hooks/useAIChatWithMCP';

function AIChatComponent() {
  const chat = useAIChatWithMCP({
    mcpServerUrl: 'http://localhost:3001',
    spaceId: 'space-123',
    baseId: 'base-456',
    tableId: 'table-789'
  });

  const handleSend = async () => {
    // AI 会自动判断是否需要调用 MCP 工具
    await chat.sendMessage('创建一个员工表');
  };

  return (
    <div>
      <p>MCP: {chat.mcpConnected ? '✅' : '❌'}</p>
      <p>工具数: {chat.availableTools.length}</p>
      {chat.messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={handleSend}>发送</button>
    </div>
  );
}
```

#### 3. 使用完整的 AI 侧边栏

```typescript
import { AISidebarWithMCP } from '@/components/AISidebar/AISidebarWithMCP';

function App() {
  return (
    <AISidebarWithMCP
      mcpServerUrl="http://localhost:3001"
      spaceId={currentSpaceId}
      baseId={currentBaseId}
      tableId={currentTableId}
      onActionComplete={() => {
        console.log('操作完成，刷新数据');
      }}
    />
  );
}
```

## ⚙️ 配置说明

### 环境变量

在 `teable-ui/.env` 中配置：

```bash
# Ollama 配置
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2

# MCP 服务器配置
VITE_MCP_SERVER_URL=http://localhost:3001
VITE_MCP_TRANSPORT=http  # http | sse | websocket

# Teable 后端 API
VITE_TEABLE_BASE_URL=http://127.0.0.1:8080
```

### 配置文件

创建 `teable-ui/src/config/mcp.config.ts`：

```typescript
export const MCP_CONFIG = {
  serverUrl: import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001',
  transport: (import.meta.env.VITE_MCP_TRANSPORT || 'http') as 'http' | 'sse' | 'websocket',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

## 🔄 传输方式对比

| 特性 | HTTP | SSE | WebSocket |
|-----|------|-----|-----------|
| **实现难度** | ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 复杂 |
| **双向通信** | ❌ | ❌ | ✅ |
| **流式响应** | ❌ | ✅ | ✅ |
| **服务器推送** | ❌ | ✅ | ✅ |
| **自动重连** | N/A | ✅ | 需手动实现 |
| **浏览器支持** | ✅ 完美 | ✅ 良好 | ✅ 良好 |
| **适用场景** | 简单请求 | 长轮询、通知 | 实时聊天 |
| **推荐指数** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**推荐选择**：
- 🥇 **HTTP** - 用于开发和大多数场景
- 🥈 **SSE** - 需要流式响应时
- 🥉 **WebSocket** - 需要实时双向通信时

## 🔍 故障排查

### 问题 1: MCP 服务器连接失败

**症状**：`MCP 连接失败` 或 `Failed to connect`

**解决方案**：
```bash
# 1. 检查 MCP 服务器是否运行
curl http://localhost:3001/health

# 2. 检查端口是否被占用
lsof -i :3001

# 3. 查看 MCP 服务器日志
# 确保没有错误信息

# 4. 检查 CORS 配置
# main.go 中的 CORS 中间件应包含前端地址
```

### 问题 2: 工具调用失败

**症状**：`Error calling tool` 或工具返回错误

**解决方案**：
```typescript
// 1. 检查参数是否正确
const tools = await mcp.listTools();
console.log('工具定义:', tools);

// 2. 验证参数类型
await mcp.callTool('teable_space_create', {
  name: '空间名称',        // ✅ 字符串
  description: '描述'      // ✅ 字符串（可选）
});

// 3. 检查后端日志
// server/cmd/mcp 目录下查看错误信息
```

### 问题 3: AI 无法正确调用工具

**症状**：AI 返回的 JSON 格式不正确

**解决方案**：
```typescript
// 1. 检查 System Prompt
// 确保 AI 知道可用的工具列表

// 2. 调整 Ollama 模型
// 使用更强的模型，如 llama3.2 或 mistral

// 3. 增加示例
// 在 System Prompt 中添加更多示例
```

### 问题 4: SSE/WebSocket 连接断开

**症状**：连接频繁断开或无法建立

**解决方案**：
```typescript
// 实现自动重连
const reconnect = async () => {
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    try {
      await mcp.connect();
      console.log('重连成功');
      break;
    } catch (err) {
      attempts++;
      console.log(`重连失败 (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};
```

## 📊 性能优化

### 1. 连接池

```typescript
// 复用 MCP 客户端实例
const mcpClient = createMCPClient({
  baseUrl: 'http://localhost:3001',
  transport: 'http'
});

// 在应用中共享
export default mcpClient;
```

### 2. 请求缓存

```typescript
// 缓存工具列表
let cachedTools: MCPToolDefinition[] | null = null;

const getTools = async () => {
  if (cachedTools) return cachedTools;
  cachedTools = await mcp.listTools();
  return cachedTools;
};
```

### 3. 并发控制

```typescript
// 限制并发请求数
import pLimit from 'p-limit';

const limit = pLimit(3);

const results = await Promise.all(
  tasks.map(task => 
    limit(() => mcp.callTool(task.name, task.args))
  )
);
```

## 🔐 安全建议

1. **使用 HTTPS**：生产环境使用 HTTPS 传输
2. **身份验证**：在 MCP 请求中添加认证令牌
3. **输入验证**：验证所有工具参数
4. **速率限制**：防止滥用 MCP API
5. **日志审计**：记录所有 MCP 工具调用

## 📚 参考资源

- [MCP 官方规范](https://modelcontextprotocol.io/)
- [mcp-go 库文档](https://github.com/mark3labs/mcp-go)
- [Teable 文档](../README.md)

## 🎯 下一步

- [ ] 添加更多 MCP 工具
- [ ] 实现工具权限控制
- [ ] 支持工具组合（工作流）
- [ ] 添加工具使用统计
- [ ] 支持自定义工具

---

**最后更新**: 2025-10-08
**维护者**: Teable Team

