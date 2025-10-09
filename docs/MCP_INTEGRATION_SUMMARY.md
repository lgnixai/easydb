# MCP 标准协议集成总结

本文档总结了为 Teable 项目添加的标准 MCP 协议支持。

## 📦 新增文件

### 前端核心库

#### 1. `teable-ui/src/lib/mcp-client.ts`
**标准 MCP 客户端核心库**

功能：
- ✅ 实现标准 MCP JSON-RPC 协议
- ✅ 支持 3 种传输方式：HTTP、SSE、WebSocket
- ✅ 工具列表获取和调用
- ✅ 连接管理和健康检查
- ✅ 自动重连和错误处理

主要类：
```typescript
class MCPClient {
  async initialize(): Promise<void>
  async listTools(): Promise<MCPToolDefinition[]>
  async callTool(params: MCPCallToolParams): Promise<any>
  async getServerInfo(): Promise<any>
  async healthCheck(): Promise<boolean>
  async close(): Promise<void>
}
```

### React Hooks

#### 2. `teable-ui/src/components/AISidebar/hooks/useMCPClient.ts`
**MCP 客户端 React Hook**

功能：
- ✅ React 友好的 MCP 客户端封装
- ✅ 状态管理（连接、加载、错误）
- ✅ 自动连接和断开
- ✅ 工具列表缓存

使用示例：
```typescript
const mcp = useMCPClient({
  baseUrl: 'http://localhost:3001',
  transport: 'http',
  autoConnect: true
});

// 调用工具
await mcp.callTool('teable_space_create', { name: '空间' });
```

#### 3. `teable-ui/src/components/AISidebar/hooks/useAIChatWithMCP.ts`
**AI + MCP 集成 Hook**

功能：
- ✅ 集成 Ollama AI 和 MCP 客户端
- ✅ 自动解析 AI 意图并调用工具
- ✅ 对话历史管理
- ✅ 工具调用确认机制

工作流程：
```
用户输入 → Ollama AI → 解析意图 → MCP 工具调用 → 返回结果
```

### UI 组件

#### 4. `teable-ui/src/components/AISidebar/AISidebarWithMCP.tsx`
**使用标准 MCP 的 AI 侧边栏组件**

功能：
- ✅ 完整的聊天界面
- ✅ MCP 连接状态显示
- ✅ 可用工具列表展示
- ✅ 实时操作反馈
- ✅ 上下文信息显示

特性：
- 🎨 美观的 Obsidian 风格 UI
- 🔌 实时 MCP 连接指示
- 🛠️ 工具列表可折叠展示
- ⚡ 流畅的聊天体验

### 文档

#### 5. `docs/MCP_STANDARD_USAGE.md`
**完整的 MCP 使用文档**

内容：
- 📖 架构概览
- 🖥️ 后端服务器配置
- 🌐 前端客户端使用
- ⚙️ 配置说明
- 🔄 传输方式对比
- 🔍 故障排查
- 📊 性能优化
- 🔐 安全建议

#### 6. `docs/MCP_QUICK_START.md`
**5 分钟快速开始指南**

内容：
- 🚀 快速启动步骤
- 📝 常用命令示例
- 🔧 故障排查
- 💡 实用提示

#### 7. `docs/MCP_COMPARISON.md`
**两种实现方式对比**

内容：
- 📊 架构对比
- 🔍 详细特性对比
- 📝 代码示例对比
- 🎯 使用场景推荐
- 🔄 迁移指南
- 📈 性能对比

## 🎯 主要特性

### 1. 标准协议支持
- ✅ 完全符合 MCP 规范
- ✅ JSON-RPC 2.0 协议
- ✅ 标准化的工具定义

### 2. 多传输方式
- ✅ HTTP - 简单易用，适合大多数场景
- ✅ SSE - 支持服务器推送，适合流式响应
- ✅ WebSocket - 双向实时通信

### 3. 完整的工具生态
- ✅ 11 个内置 Teable 工具
- ✅ 动态工具发现
- ✅ 类型安全的参数定义

### 4. 开发者友好
- ✅ TypeScript 类型定义
- ✅ React Hooks 封装
- ✅ 详尽的文档和示例
- ✅ 完善的错误处理

## 🚀 快速开始

### 1. 启动 MCP 服务器

```bash
cd server/cmd/mcp
go run main.go -mode=http -port=3001
```

### 2. 配置环境变量

```bash
# teable-ui/.env
VITE_MCP_SERVER_URL=http://localhost:3001
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama3.2
```

### 3. 使用 MCP 侧边栏

```typescript
import { AISidebarWithMCP } from '@/components/AISidebar/AISidebarWithMCP';

function App() {
  return (
    <AISidebarWithMCP
      mcpServerUrl="http://localhost:3001"
      spaceId={currentSpaceId}
      baseId={currentBaseId}
      tableId={currentTableId}
    />
  );
}
```

## 📚 使用场景

### 场景 1：仅使用 MCP 客户端

适合：直接调用 MCP 工具，不需要 AI

```typescript
import { useMCPClient } from '@/components/AISidebar/hooks/useMCPClient';

const mcp = useMCPClient({ 
  baseUrl: 'http://localhost:3001',
  autoConnect: true 
});

// 调用工具
const result = await mcp.callTool('teable_space_create', {
  name: '新空间'
});
```

### 场景 2：AI + MCP 集成

适合：通过自然语言控制 MCP 工具

```typescript
import { useAIChatWithMCP } from '@/components/AISidebar/hooks/useAIChatWithMCP';

const chat = useAIChatWithMCP({
  mcpServerUrl: 'http://localhost:3001'
});

// 发送自然语言命令
await chat.sendMessage('创建一个员工管理空间');
```

### 场景 3：完整的 AI 侧边栏

适合：提供完整的用户界面

```typescript
import { AISidebarWithMCP } from '@/components/AISidebar/AISidebarWithMCP';

<AISidebarWithMCP
  mcpServerUrl="http://localhost:3001"
  spaceId={spaceId}
/>
```

## 🔄 与原有方式对比

| 特性 | 原有方式 | 标准 MCP | 推荐场景 |
|-----|---------|----------|---------|
| **标准化** | ❌ | ✅ | 需要标准协议 |
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 快速原型 |
| **可维护性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 长期项目 |
| **扩展性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 复杂系统 |
| **资源消耗** | 低 | 中 | 资源受限 |

**建议**：
- 🥇 新项目：直接使用标准 MCP
- 🥈 现有项目：渐进式迁移
- 🥉 简单场景：可继续使用原有方式

## 📊 可用 MCP 工具

| 工具名称 | 功能 | 必需参数 |
|---------|------|---------|
| `teable_user_register` | 注册用户 | name, email, password |
| `teable_user_login` | 用户登录 | email, password |
| `teable_user_get` | 获取用户 | user_id |
| `teable_space_create` | 创建空间 | name |
| `teable_base_create` | 创建数据库 | space_id, name |
| `teable_base_get` | 获取数据库 | base_id |
| `teable_table_create` | 创建表格 | base_id, name |
| `teable_table_list` | 列出表格 | base_id |
| `teable_field_create` | 创建字段 | table_id, name, type |
| `teable_field_get` | 获取字段 | field_id |
| `teable_record_create` | 创建记录 | table_id, fields |

## 🔧 配置选项

### MCP 客户端配置

```typescript
interface MCPClientConfig {
  baseUrl: string;              // MCP 服务器地址
  transport?: MCPTransport;     // 传输方式: 'http' | 'sse' | 'websocket'
  timeout?: number;             // 请求超时时间（毫秒）
}
```

### Hook 配置

```typescript
interface UseMCPClientConfig {
  baseUrl: string;              // MCP 服务器地址
  transport?: MCPTransport;     // 传输方式
  autoConnect?: boolean;        // 是否自动连接
}
```

### AI Chat 配置

```typescript
interface UseAIChatWithMCPOptions {
  mcpServerUrl?: string;        // MCP 服务器地址
  spaceId?: string;             // 当前空间 ID
  baseId?: string;              // 当前数据库 ID
  tableId?: string;             // 当前表格 ID
  onActionComplete?: () => void; // 操作完成回调
}
```

## 🐛 调试技巧

### 1. 启用详细日志

```typescript
// 浏览器控制台会显示：
// [MCP] 连接成功, 可用工具: 11
// [MCP] 调用工具: teable_space_create { name: '...' }
// [MCP] 工具返回结果: { ... }
```

### 2. 检查 MCP 服务器

```bash
# 健康检查
curl http://localhost:3001/health

# 获取工具列表
curl http://localhost:3001/mcp/tools
```

### 3. 测试工具调用

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "teable_space_create",
      "arguments": { "name": "测试空间" }
    },
    "id": 1
  }'
```

## 📈 性能优化建议

### 1. 连接复用

```typescript
// 创建全局 MCP 客户端实例
const globalMCPClient = createMCPClient({
  baseUrl: 'http://localhost:3001'
});

export default globalMCPClient;
```

### 2. 工具列表缓存

```typescript
// Hook 自动缓存工具列表
const { tools } = useMCPClient({ 
  autoConnect: true 
});
```

### 3. 并发控制

```typescript
// 使用 Promise.all 并发调用
const results = await Promise.all([
  mcp.callTool('tool1', args1),
  mcp.callTool('tool2', args2),
  mcp.callTool('tool3', args3),
]);
```

## 🔐 安全建议

1. **生产环境使用 HTTPS**
2. **添加身份验证**（在 MCP 请求头中）
3. **验证所有输入参数**
4. **实施速率限制**
5. **记录审计日志**

## 🎓 学习路径

1. ✅ 阅读 [MCP_QUICK_START.md](./MCP_QUICK_START.md)
2. ✅ 阅读 [MCP_STANDARD_USAGE.md](./MCP_STANDARD_USAGE.md)
3. ✅ 阅读 [MCP_COMPARISON.md](./MCP_COMPARISON.md)
4. ✅ 查看代码示例
5. ✅ 实际动手尝试

## 🆘 获取帮助

- 📖 查看文档：`docs/MCP_*.md`
- 🔍 查看示例：`teable-ui/src/components/AISidebar/`
- 🐛 查看日志：浏览器控制台和服务器输出
- 💬 提问：项目 Issue 或讨论区

## 🎉 总结

现在您拥有了：

- ✅ **标准 MCP 客户端库** - 可复用的核心功能
- ✅ **React Hooks** - 便捷的 React 集成
- ✅ **UI 组件** - 开箱即用的侧边栏
- ✅ **完整文档** - 从快速开始到深入使用
- ✅ **两种方式** - 原有方式 + 标准 MCP

**选择适合您项目的方式，开始构建强大的 AI 功能吧！** 🚀

---

**最后更新**: 2025-10-08  
**版本**: 1.0.0  
**维护者**: Teable Team

