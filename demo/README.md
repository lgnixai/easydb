# Grid Table Kanban - Demo 演示项目

<div align="center">

![Grid Table Kanban](https://img.shields.io/badge/Grid%20Table%20Kanban-Demo-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.3-3178c6)
![Vite](https://img.shields.io/badge/Vite-Latest-646cff)

**🎯 完整功能演示 | 📝 简单示例 | 🚀 高性能表格组件**

[功能列表](#功能展示) • [快速开始](#快速开始) • [详细文档](./DEMO_FEATURES.md)

</div>

---

## 📋 项目简介

这是 **Grid Table Kanban** 组件的完整功能演示项目，展示了所有核心功能和高级特性。

### 🎯 两种演示模式

#### 1. **简单示例 (Simple Demo)** 📝
- 快速了解组件基本用法
- 展示核心功能
- 代码简洁易懂
- 适合初学者

#### 2. **完整功能示例 (Full Featured Demo)** 🎯
- 展示所有高级特性
- 完整的实际应用场景
- 包含最佳实践
- 适合深入学习

---

## ✨ 功能展示

### 核心功能 ⭐

| 功能 | 简单示例 | 完整示例 | 说明 |
|------|:--------:|:--------:|------|
| 🎨 多种单元格类型 | ✅ | ✅ | 文本、链接、选择、评分、布尔值等 |
| ✏️ 单元格编辑 | ✅ | ✅ | 双击或 Enter 进入编辑模式 |
| ➕ 添加行/列 | ✅ | ✅ | 动态添加数据 |
| 🔀 拖拽排序 | ✅ | ✅ | 拖动行头或列头重新排列 |
| 📏 调整列宽 | ✅ | ✅ | 拖动列边界调整宽度 |
| ❄️ 列冻结 | ✅ | ✅ | 冻结左侧列 |
| 🎯 多选操作 | ✅ | ✅ | 支持多种选择模式 |
| 📁 分组功能 | ✅ | ✅ | 按列值分组显示 |

### 高级功能 🚀

| 功能 | 简单示例 | 完整示例 | 说明 |
|------|:--------:|:--------:|------|
| 🗑️ 批量删除 | ❌ | ✅ | 选中多行/列后删除 |
| 📋 复制粘贴 | ❌ | ✅ | Ctrl+C/V 操作 |
| ↩️ 撤销重做 | ❌ | ✅ | Ctrl+Z/Y 历史记录 |
| 🔍 搜索高亮 | ❌ | ✅ | 全局搜索并高亮 |
| 📊 统计行 | ❌ | ✅ | 显示列统计信息 |
| 👥 协作光标 | ❌ | ✅ | 显示其他用户位置 |
| ⌨️ 键盘导航 | ✅ | ✅ | 方向键、Tab 等快捷键 |
| 📱 触摸支持 | ✅ | ✅ | 支持触摸设备 |

---

## 🚀 快速开始

### 1️⃣ 安装依赖

```bash
cd leven/demo
pnpm install
```

### 2️⃣ 启动开发服务器

```bash
pnpm dev
```

### 3️⃣ 打开浏览器

访问: **http://localhost:5173**

---

## 📸 截图预览

### 完整功能示例

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Grid Table - Full Featured Demo                        │
├─────────────────────────────────────────────────────────────┤
│ [数据] [视图] [交互] [历史] [搜索]                          │
├─────────────────────────────────────────────────────────────┤
│ ┌───┬────────┬──────────┬────────┬──────────┬──────────┐   │
│ │ ☑ │ Name   │ Email    │ Status │ Priority │ Rating   │   │
│ ├───┼────────┼──────────┼────────┼──────────┼──────────┤   │
│ │ ☐ │ Task 1 │ user1@.. │ TODO   │ HIGH     │ ⭐⭐⭐⭐ │   │
│ │ ☐ │ Task 2 │ user2@.. │ DOING  │ MEDIUM   │ ⭐⭐⭐   │   │
│ │ ☐ │ Task 3 │ user3@.. │ DONE   │ LOW      │ ⭐⭐     │   │
│ └───┴────────┴──────────┴────────┴──────────┴──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 操作指南

### 基础操作

#### 导航
- **鼠标滚轮**: 垂直滚动
- **Shift + 滚轮**: 水平滚动
- **方向键**: 移动光标
- **Page Up/Down**: 翻页

#### 选择
- **单击**: 选中单元格
- **拖动**: 选择区域
- **Shift + 点击**: 选择区间
- **Ctrl + 点击**: 多选

#### 编辑
- **双击**: 编辑单元格
- **Enter**: 编辑/确认
- **Esc**: 取消编辑
- **Tab**: 下一个单元格

### 快捷键

| 快捷键 | 功能 | 示例 |
|--------|------|------|
| `Ctrl + C` | 复制 | 完整示例 |
| `Ctrl + V` | 粘贴 | 完整示例 |
| `Ctrl + Z` | 撤销 | 完整示例 |
| `Ctrl + Y` | 重做 | 完整示例 |
| `Delete` | 删除 | 两种示例 |
| `Enter` | 编辑 | 两种示例 |
| `Esc` | 取消 | 两种示例 |
| `方向键` | 导航 | 两种示例 |

---

## 📁 项目结构

```
leven/demo/
├── src/
│   ├── App.tsx                 # 主应用 - Demo 切换器
│   ├── SimpleDemo.tsx          # 简单示例
│   ├── FullFeaturedDemo.tsx    # 完整功能示例
│   ├── main.tsx                # 入口文件
│   ├── App.css                 # 样式
│   └── index.css               # 全局样式
├── public/                     # 静态资源
├── package.json                # 依赖配置
├── vite.config.ts              # Vite 配置
├── tailwind.config.js          # Tailwind 配置
├── README.md                   # 本文档
└── DEMO_FEATURES.md            # 详细功能说明
```

---

## 💡 代码示例

### 最简单的用法

```tsx
import { Grid, CellType } from '@teable/grid-table-kanban'

function SimpleGrid() {
  const columns = [
    { id: 'name', name: 'Name', width: 200 },
    { id: 'age', name: 'Age', width: 100 },
  ]

  const getCellContent = ([colIndex, rowIndex]) => {
    return {
      type: CellType.Text,
      data: `Cell ${colIndex}-${rowIndex}`,
    }
  }

  return (
    <Grid
      columns={columns}
      rowCount={100}
      getCellContent={getCellContent}
    />
  )
}
```

### 带编辑功能

```tsx
function EditableGrid() {
  const [data, setData] = useState([...])

  const handleCellEdited = ([colIndex, rowIndex], newValue) => {
    setData(prev => {
      const newData = [...prev]
      newData[rowIndex][colIndex] = newValue
      return newData
    })
  }

  return (
    <Grid
      columns={columns}
      rowCount={data.length}
      getCellContent={getCellContent}
      onCellEdited={handleCellEdited}
    />
  )
}
```

### 完整配置

```tsx
function FullFeaturedGrid() {
  return (
    <Grid
      // 基础配置
      columns={columns}
      rowCount={rowCount}
      
      // 交互配置
      draggable={DraggableType.All}
      selectable={SelectableType.All}
      freezeColumnCount={1}
      
      // 高级功能
      groupPoints={groupPoints}
      columnStatistics={statistics}
      collaborators={collaborators}
      searchCursor={searchCursor}
      
      // 事件回调
      getCellContent={getCellContent}
      onCellEdited={handleCellEdited}
      onRowOrdered={handleRowOrdered}
      onColumnOrdered={handleColumnOrdered}
      onColumnResize={handleColumnResize}
      onCopy={handleCopy}
      onPaste={handlePaste}
      onUndo={handleUndo}
      onRedo={handleRedo}
    />
  )
}
```

---

## 🎯 学习路径

### 第一步: 了解基础
1. 运行 **简单示例**
2. 查看 `SimpleDemo.tsx` 源码
3. 理解基本的 props 和 callbacks
4. 尝试修改数据和配置

### 第二步: 探索功能
1. 切换到 **完整功能示例**
2. 体验所有交互功能
3. 查看控制台的日志输出
4. 阅读 [功能文档](./DEMO_FEATURES.md)

### 第三步: 深入学习
1. 查看 `FullFeaturedDemo.tsx` 源码
2. 理解数据管理策略
3. 学习最佳实践
4. 参考 [API 文档](../packages/grid-table-kanban/README.md)

### 第四步: 实践应用
1. 在自己的项目中集成
2. 根据需求定制功能
3. 优化性能
4. 处理边界情况

---

## 🔧 技术栈

- **React 18.3.1** - UI 框架
- **TypeScript 5.4.3** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Grid Table Kanban** - 表格组件

---

## 📚 相关文档

- 📖 [详细功能说明](./DEMO_FEATURES.md)
- 📖 [组件 API 文档](../packages/grid-table-kanban/README.md)
- 📖 [快速开始指南](../packages/grid-table-kanban/QUICKSTART.md)
- 📖 [项目完成报告](../packages/grid-table-kanban/PROJECT_COMPLETION.md)

---

## 💡 提示和技巧

### 性能优化
- ✅ 使用虚拟滚动处理大数据集
- ✅ 合理使用 `memo` 避免不必要的重渲染
- ✅ 在 `getCellContent` 中避免复杂计算
- ✅ 使用分组减少渲染行数

### 用户体验
- ✅ 提供清晰的加载状态
- ✅ 显示操作反馈
- ✅ 支持撤销误操作
- ✅ 使用协作光标

### 开发调试
- ✅ 使用浏览器开发者工具
- ✅ 查看控制台日志
- ✅ 使用 React DevTools
- ✅ 监控性能指标

---

## 🐛 常见问题

### Q: 为什么数据没有更新？
A: 确保在 `onCellEdited` 等回调中正确更新了外部状态。

### Q: 如何处理大量数据？
A: 使用虚拟滚动，Grid 默认已启用，只需传入总行数即可。

### Q: 如何自定义单元格渲染？
A: 在 `getCellContent` 中返回不同的 cell type 和数据。

### Q: 如何实现数据持久化？
A: 在编辑回调中将数据保存到后端或本地存储。

### Q: 如何添加自定义列？
A: 修改 `columns` 数组，并在 `getCellContent` 中处理新列。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 如何贡献
1. Fork 本项目
2. 创建 Feature 分支
3. 提交代码
4. 创建 Pull Request

---

## 📄 许可证

MIT License

---

## 🙏 致谢

感谢所有贡献者和用户的支持！

---

<div align="center">

**🎉 享受使用 Grid Table Kanban！**

[⬆ 返回顶部](#grid-table-kanban---demo-演示项目)

</div>