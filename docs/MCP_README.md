# Teable MCP 集成文档

欢迎使用 Teable 的标准 MCP (Model Context Protocol) 集成！

## 🎯 什么是 MCP？

MCP (Model Context Protocol) 是 Anthropic 推出的开放标准，用于 AI 应用与外部工具的集成。通过 MCP，AI 可以安全、标准化地调用各种工具和服务。

## 📚 文档导航

### 🚀 快速开始
**→ [MCP_QUICK_START.md](./MCP_QUICK_START.md)**

5 分钟快速上手指南：
- ✅ 启动 MCP 服务器
- ✅ 配置前端环境
- ✅ 测试第一个 MCP 调用
- ✅ 常见问题解决

**适合**：首次使用者、快速验证

---

### 📖 完整使用文档
**→ [MCP_STANDARD_USAGE.md](./MCP_STANDARD_USAGE.md)**

深入的使用指南：
- 🏗️ 架构设计
- 🖥️ 后端服务器配置
- 🌐 前端客户端使用
- ⚙️ 高级配置
- 🔍 故障排查
- 📊 性能优化

**适合**：深入使用、生产部署

---

### 🔄 实现方式对比
**→ [MCP_COMPARISON.md](./MCP_COMPARISON.md)**

两种实现方式的对比：
- 📊 原有方式 vs 标准 MCP
- 🎯 使用场景推荐
- 🔄 迁移指南
- 📈 性能对比

**适合**：方案选择、技术决策

---

### 📦 集成总结
**→ [MCP_INTEGRATION_SUMMARY.md](./MCP_INTEGRATION_SUMMARY.md)**

完整的集成信息：
- 📦 新增文件列表
- 🎯 主要特性
- 📊 可用工具
- 🔧 配置选项
- 🐛 调试技巧

**适合**：系统了解、开发参考

---

## 🎨 两种使用方式

### 方式 1：原有方式（简单）

```typescript
import { AISidebar } from '@/components/AISidebar/AISidebar';

<AISidebar 
  spaceId={spaceId}
  baseId={baseId}
  tableId={tableId}
/>
```

**特点**：
- ✅ 简单快速
- ✅ 无需 MCP 服务器
- ⚠️ 非标准协议

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

**特点**：
- ✅ 符合 MCP 标准
- ✅ 工具管理规范
- ✅ 易于扩展
- ⚠️ 需要 MCP 服务器

## 🚀 30 秒快速体验

```bash
# 1. 启动 MCP 服务器
cd server/cmd/mcp && go run main.go -mode=http -port=3001

# 2. 测试服务器
curl http://localhost:3001/health

# 3. 在浏览器中使用
# 访问 Teable UI，AI 侧边栏会自动连接 MCP 服务器
```

## 📊 可用工具一览

| 分类 | 工具 | 描述 |
|-----|------|------|
| **用户** | `teable_user_register` | 注册新用户 |
| | `teable_user_login` | 用户登录 |
| | `teable_user_get` | 获取用户信息 |
| **空间** | `teable_space_create` | 创建工作空间 |
| **数据库** | `teable_base_create` | 创建数据库 |
| | `teable_base_get` | 获取数据库信息 |
| **表格** | `teable_table_create` | 创建表格 |
| | `teable_table_list` | 列出表格 |
| **字段** | `teable_field_create` | 创建字段 |
| | `teable_field_get` | 获取字段信息 |
| **记录** | `teable_record_create` | 创建记录 |

## 💡 使用示例

### 示例 1：创建空间

```typescript
const mcp = useMCPClient({ baseUrl: 'http://localhost:3001' });

const space = await mcp.callTool('teable_space_create', {
  name: '项目管理',
  description: '管理所有项目'
});
```

### 示例 2：AI 自然语言

```typescript
const chat = useAIChatWithMCP({ 
  mcpServerUrl: 'http://localhost:3001' 
});

// AI 会自动调用对应的 MCP 工具
await chat.sendMessage('创建一个员工管理空间');
```

### 示例 3：完整 UI

```typescript
<AISidebarWithMCP
  mcpServerUrl="http://localhost:3001"
  onActionComplete={() => console.log('完成')}
/>
```

## 🔧 技术栈

### 后端
- Go 1.21+
- [mcp-go](https://github.com/mark3labs/mcp-go) - MCP Go SDK
- Gin - HTTP 框架

### 前端
- React 18+
- TypeScript
- Ollama - 本地 LLM
- MCP Client - 标准客户端

## 🏗️ 架构图

```
┌─────────────────────────────────────────────────────┐
│                    Teable UI                        │
│                                                     │
│  ┌──────────────┐         ┌──────────────────┐    │
│  │ AI Sidebar   │────────▶│  Ollama LLM      │    │
│  │ (用户界面)    │         │  (意图分析)       │    │
│  └──────────────┘         └──────────────────┘    │
│         │                           │              │
│         │                           ▼              │
│         │                  ┌──────────────────┐   │
│         └─────────────────▶│  MCP Client      │   │
│                            │  (标准协议)       │   │
│                            └──────────────────┘   │
└────────────────────────────────┬───────────────────┘
                                 │ JSON-RPC
                                 ▼
┌─────────────────────────────────────────────────────┐
│                  MCP Server (Go)                    │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │ User Tools   │  │ Space Tools  │  │  ...    │  │
│  └──────────────┘  └──────────────┘  └─────────┘  │
│                                                     │
└────────────────────────────┬────────────────────────┘
                             │
                             ▼
                   ┌─────────────────┐
                   │  Teable Backend │
                   └─────────────────┘
```

## 🎓 学习路径

1. **第一步**：阅读 [快速开始](./MCP_QUICK_START.md)
2. **第二步**：尝试使用示例代码
3. **第三步**：阅读 [完整文档](./MCP_STANDARD_USAGE.md)
4. **第四步**：了解 [实现对比](./MCP_COMPARISON.md)
5. **第五步**：查看 [集成总结](./MCP_INTEGRATION_SUMMARY.md)

## 🤔 常见问题

### Q: 我应该选择哪种方式？

**A**: 
- 快速原型 → 原有方式
- 生产项目 → 标准 MCP
- 不确定 → 两种都试试

### Q: MCP 服务器必须运行吗？

**A**: 
- 使用标准 MCP → 必须
- 使用原有方式 → 不需要

### Q: 性能有影响吗？

**A**: 标准 MCP 增加约 20-25% 延迟，但对用户体验影响很小。

### Q: 可以自定义工具吗？

**A**: 可以！在 `server/cmd/mcp/main.go` 中注册新工具。

### Q: 支持流式响应吗？

**A**: 支持！使用 SSE 传输方式。

## 🆘 获取帮助

遇到问题？

1. 📖 查看文档（本目录下的 MD 文件）
2. 🔍 检查日志（浏览器控制台 + 服务器输出）
3. 🧪 运行测试命令
4. 💬 提交 Issue

## 📄 许可证

本项目遵循主项目许可证。

## 🙏 致谢

- [Anthropic](https://www.anthropic.com/) - MCP 协议设计
- [mcp-go](https://github.com/mark3labs/mcp-go) - Go SDK
- Teable 团队 - 项目支持

---

**开始探索 Teable 的 MCP 集成吧！** 🎉

**推荐起点**: [快速开始指南](./MCP_QUICK_START.md) →

