# 字段类型和编辑器对齐 - 实现报告

## 执行摘要

本报告详细分析了参考项目（teable-develop）和新项目（grid-table-kanban）在字段类型和单元格编辑器方面的差异，并提供了具体的实现建议。

## 一、对比分析结果

### 1.1 字段类型支持情况

| 字段类型 | 参考项目 FieldType | 新项目 CellType | 编辑器状态 | 完整度 |
|---------|-------------------|----------------|-----------|-------|
| 单行文本 | SingleLineText | Text | ✅ TextEditor | 80% |
| 长文本 | LongText | Text | ✅ TextEditor | 80% |
| 数字 | Number | Number | ✅ TextEditor | 60% |
| 单选 | SingleSelect | Select | ✅ SelectEditor | 70% |
| 多选 | MultipleSelect | Select | ✅ SelectEditor | 70% |
| 用户 | User | User | ⚠️ UserEditor | 40% |
| 日期 | Date | Date | ⚠️ DateEditor | 50% |
| 评分 | Rating | Rating | ✅ RatingEditor | 90% |
| 勾选框 | Checkbox | Boolean | ✅ BooleanEditor | 90% |
| 附件 | Attachment | Attachment | ⚠️ AttachmentEditor | 60% |
| 关联 | Link | Link | ✅ LinkEditor | 70% |
| 按钮 | Button | Button | ✅ (无编辑器) | 90% |
| 公式 | Formula | - | ❌ 未实现 | 0% |
| 汇总 | Rollup | - | ❌ 未实现 | 0% |
| 创建时间 | CreatedTime | Date | ⚠️ 只读字段 | 50% |
| 修改时间 | LastModifiedTime | Date | ⚠️ 只读字段 | 50% |
| 创建人 | CreatedBy | User | ⚠️ 只读字段 | 50% |
| 修改人 | LastModifiedBy | User | ⚠️ 只读字段 | 50% |
| 自增数字 | AutoNumber | Number | ⚠️ 只读字段 | 80% |

**图例**：
- ✅ 实现完整
- ⚠️ 部分实现/需要改进
- ❌ 未实现

### 1.2 编辑器功能对比

#### DateEditor（日期编辑器）

**参考项目特性**：
- 完整的日历选择器（使用 date-fns 和 date-fns-tz）
- 时间选择器（支持小时:分钟格式）
- 时区支持
- 多种日期格式化选项
- "今天"快捷按钮
- 年/月/日视图切换
- 国际化支持（多语言）

**新项目现状**：
- 仅使用 HTML5 原生 `<input type="date">`
- 无时间选择功能
- 无时区处理
- 无格式化选项

**改进建议**：需要完全重写

#### SelectEditor（选择编辑器）

**参考项目特性**：
- 选项搜索功能
- 创建新选项（通过 temporaryPaste API）
- 选项颜色显示（背景色和文字色）
- 单选模式自动关闭
- 多选模式支持勾选/取消勾选
- 防止自动创建新选项的配置

**新项目现状**：
- 基本的搜索功能
- 选项颜色显示
- 单选/多选支持
- 缺少创建新选项功能

**改进建议**：中等改进

#### UserEditor（用户编辑器）

**参考项目特性**：
- 用户选择弹窗
- 用户搜索
- 显示用户头像（使用 Next.js 图片优化）
- 单选/多选模式
- 完整的用户对象支持

**新项目现状**：
- 仅支持逗号分隔的文本输入
- 无用户选择界面
- 无头像显示
- 功能极其简化

**改进建议**：需要完全重写

#### NumberEditor（数字编辑器）

**参考项目特性**：
- 数字格式化
- 右对齐显示
- 支持图表显示模式（环形图、条形图）
- 精度控制

**新项目现状**：
- 使用 TextEditor 处理
- 无格式化
- 无图表显示

**改进建议**：需要创建专用编辑器

#### AttachmentEditor（附件编辑器）

**参考项目特性**：
- 文件上传
- 文件预览
- 缩略图显示
- 多文件支持
- 拖拽上传

**新项目现状**：
- 有 AttachmentEditor 组件
- 需要验证完整功能

**改进建议**：需要验证和测试

### 1.3 字段类型选择器对比

**参考项目**：
- 使用 `useFieldStaticGetter` hook
- 每个字段类型有图标、标题、默认选项
- 支持 Lookup 字段的特殊图标
- 支持 AI 配置字段的标记
- 国际化标题

**新项目**：
- `FieldTypeSelector` 组件已实现
- `FIELD_TYPES` 数组包含 18 种类型
- 有图标和描述
- 双列网格显示
- 搜索功能

**改进建议**：需要图标系统对齐

## 二、核心问题

### 2.1 架构问题

1. **缺少字段类型系统**：新项目缺少与参考项目对应的 FieldType 枚举
2. **编辑器映射不完整**：没有清晰的 FieldType → Editor 映射机制
3. **缺少字段选项系统**：每个字段类型应该有对应的 options 类型定义

### 2.2 功能缺陷

1. **DateEditor 功能严重不足**：无日历、无时间、无时区
2. **UserEditor 过于简化**：无法满足用户选择的基本需求
3. **NumberEditor 不存在**：数字字段应该有专门的编辑器
4. **缺少计算字段支持**：Formula 和 Rollup 未实现

## 三、实施方案

### 3.1 短期目标（1-2周）

#### 阶段 1：增强现有编辑器
1. **DateEditor 改进**
   - 集成日历组件（可使用 react-day-picker 或类似库）
   - 添加时间选择器
   - 实现日期格式化
   - 添加"今天"快捷按钮

2. **SelectEditor 改进**
   - 添加创建新选项功能
   - 优化搜索体验
   - 完善颜色显示

3. **创建 NumberEditor**
   - 数字输入验证
   - 格式化显示
   - 右对齐布局

#### 阶段 2：重写关键编辑器
4. **UserEditor 重写**
   - 创建用户选择弹窗
   - 实现用户搜索
   - 添加头像显示
   - 支持单选/多选

### 3.2 中期目标（2-4周）

5. **完善字段类型系统**
   - 添加 FieldType 枚举
   - 创建 FieldType → CellType 映射
   - 定义各字段类型的 options 接口

6. **优化字段类型选择器**
   - 对齐图标系统
   - 添加字段类型分组
   - 改进用户体验

7. **AttachmentEditor 验证和改进**
   - 验证现有功能
   - 添加缺失特性
   - 优化用户体验

### 3.3 长期目标（1-2月）

8. **实现计算字段**
   - Formula 字段支持
   - Rollup 字段支持

9. **实现系统字段**
   - CreatedTime, LastModifiedTime
   - CreatedBy, LastModifiedBy
   - AutoNumber

10. **性能优化和测试**
    - 全面测试所有字段类型
    - 性能优化
    - 修复 bug

## 四、具体实现建议

### 4.1 文件结构建议

```
packages/grid-table-kanban/src/
├── types/
│   ├── field.ts                    # FieldType 枚举和映射
│   └── field-options.ts            # 各字段类型的 options 接口
├── grid/components/editor/
│   ├── enhanced/                   # 增强版编辑器
│   │   ├── DateEditorEnhanced.tsx
│   │   ├── SelectEditorEnhanced.tsx
│   │   ├── UserEditorEnhanced.tsx
│   │   └── NumberEditorEnhanced.tsx
│   └── ...                         # 现有编辑器
└── utils/
    └── field-mapping.ts            # 字段类型映射工具函数
```

### 4.2 关键代码模板

#### FieldType 定义

```typescript
// types/field.ts
export enum FieldType {
  SingleLineText = 'singleLineText',
  LongText = 'longText',
  Number = 'number',
  SingleSelect = 'singleSelect',
  MultipleSelect = 'multipleSelect',
  User = 'user',
  Date = 'date',
  Rating = 'rating',
  Checkbox = 'checkbox',
  Attachment = 'attachment',
  Link = 'link',
  Formula = 'formula',
  Rollup = 'rollup',
  CreatedTime = 'createdTime',
  LastModifiedTime = 'lastModifiedTime',
  CreatedBy = 'createdBy',
  LastModifiedBy = 'lastModifiedBy',
  AutoNumber = 'autoNumber',
  Button = 'button',
}

export const fieldTypeToCellType: Record<FieldType, CellType> = {
  [FieldType.SingleLineText]: CellType.Text,
  [FieldType.LongText]: CellType.Text,
  [FieldType.Number]: CellType.Number,
  [FieldType.SingleSelect]: CellType.Select,
  [FieldType.MultipleSelect]: CellType.Select,
  [FieldType.User]: CellType.User,
  [FieldType.Date]: CellType.Date,
  [FieldType.Rating]: CellType.Rating,
  [FieldType.Checkbox]: CellType.Boolean,
  [FieldType.Attachment]: CellType.Attachment,
  [FieldType.Link]: CellType.Link,
  [FieldType.Formula]: CellType.Text, // 根据返回类型动态确定
  [FieldType.Rollup]: CellType.Text,  // 根据汇总类型动态确定
  [FieldType.CreatedTime]: CellType.Date,
  [FieldType.LastModifiedTime]: CellType.Date,
  [FieldType.CreatedBy]: CellType.User,
  [FieldType.LastModifiedBy]: CellType.User,
  [FieldType.AutoNumber]: CellType.Number,
  [FieldType.Button]: CellType.Button,
};
```

#### 增强版 DateEditor 框架

```typescript
// 需要安装: npm install react-day-picker date-fns date-fns-tz
import { forwardRef, useState, useRef, useImperativeHandle } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const DateEditorEnhanced = forwardRef((props, ref) => {
  const { cell, onChange, isEditing } = props;
  const [date, setDate] = useState(cell.data);
  const [time, setTime] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  useImperativeHandle(ref, () => ({
    focus: () => { /* ... */ },
    setValue: (value) => { /* ... */ },
    saveValue: () => { /* ... */ },
  }));
  
  return (
    <div>
      <input type="text" /* ... */ />
      {showCalendar && (
        <div className="calendar-popup">
          <DayPicker /* ... */ />
          <input type="time" /* ... */ />
          <button onClick={() => /* 设置为今天 */}>今天</button>
        </div>
      )}
    </div>
  );
});
```

## 五、风险和依赖

### 5.1 技术依赖

- **react-day-picker** 或 **@teable/ui-lib Calendar** - 日历组件
- **date-fns** 和 **date-fns-tz** - 日期处理和时区支持
- 可能需要的其他 UI 组件库

### 5.2 潜在风险

1. **API 不兼容**：新项目的数据更新 API 可能与参考项目不同
2. **性能问题**：复杂编辑器可能影响表格渲染性能
3. **测试覆盖**：需要大量测试确保功能正确

### 5.3 资源需求

- **开发时间**：预计 4-6 周
- **测试时间**：预计 1-2 周
- **文档更新**：需要更新组件文档

## 六、结论

新项目的字段类型和编辑器系统已经有了良好的基础，但在以下几个关键领域需要重大改进：

1. **DateEditor** - 需要完全重写
2. **UserEditor** - 需要完全重写  
3. **NumberEditor** - 需要创建
4. **SelectEditor** - 需要中等改进

建议优先实施短期目标，快速提升用户体验，然后逐步完善中长期目标，最终实现与参考项目完全对齐。

## 附录 A：参考资源

- 参考项目编辑器路径：`teable-develop/packages/sdk/src/components/grid-enhancements/editor/`
- 参考项目字段类型定义：`teable-develop/packages/core/src/models/field/constant.ts`
- 参考项目字段静态信息：`teable-develop/packages/sdk/src/hooks/use-field-static-getter.ts`

## 附录 B：测试检查清单

- [ ] 每种字段类型的创建
- [ ] 每种字段类型的编辑
- [ ] 每种字段类型的显示
- [ ] 单选/多选切换
- [ ] 日期格式化
- [ ] 时区处理
- [ ] 数字格式化
- [ ] 用户头像显示
- [ ] 附件上传和预览
- [ ] 性能测试（大量数据）
- [ ] 边界情况处理