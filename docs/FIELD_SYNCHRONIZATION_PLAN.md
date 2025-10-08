# 字段类型和编辑器同步方案

## 问题分析

### 1. 字段类型定义差异

#### 参考项目 (teable-develop) 支持的字段类型：
```typescript
enum FieldType {
  SingleLineText = 'singleLineText',      // 单行文本
  LongText = 'longText',                  // 长文本
  User = 'user',                          // 用户
  Attachment = 'attachment',              // 附件
  Checkbox = 'checkbox',                  // 勾选框
  MultipleSelect = 'multipleSelect',      // 多选
  SingleSelect = 'singleSelect',          // 单选
  Date = 'date',                          // 日期
  Number = 'number',                      // 数字
  Rating = 'rating',                      // 评分
  Formula = 'formula',                    // 公式
  Rollup = 'rollup',                      // 汇总
  Link = 'link',                          // 关联
  CreatedTime = 'createdTime',            // 创建时间
  LastModifiedTime = 'lastModifiedTime',  // 修改时间
  CreatedBy = 'createdBy',                // 创建人
  LastModifiedBy = 'lastModifiedBy',      // 修改人
  AutoNumber = 'autoNumber',              // 自增数字
  Button = 'button',                      // 按钮
}
```

#### 新项目 (grid-table-kanban) 的 CellType：
```typescript
enum CellType {
  Text = 'Text',
  Link = 'Link',
  Number = 'Number',
  Select = 'Select',
  Image = 'Image',
  Chart = 'Chart',
  Rating = 'Rating',
  User = 'User',
  Boolean = 'Boolean',
  Loading = 'Loading',
  Button = 'Button',
  Date = 'Date',
  Attachment = 'Attachment',
}
```

### 2. 单元格编辑器实现差异

#### 参考项目的编辑器实现特点：
- 使用 `customEditor` 属性为特定字段类型提供定制编辑器
- 编辑器实现复杂，功能完善：
  - **GridDateEditor**: 包含输入框 + 日历弹窗，支持多种日期格式
  - **GridNumberEditor**: 数字输入，支持格式化显示
  - **GridSelectEditor**: 支持搜索、创建新选项、单选/多选
  - **GridUserEditor**: 用户选择器，支持搜索和多选
  - **GridAttachmentEditor**: 附件上传和预览
  - **GridLinkEditor**: 关联记录选择器

#### 新项目的编辑器现状：
- **DateEditor**: 简化版，只使用 HTML5 原生 date input
- **SelectEditor**: 基本实现，但功能较简单
- **UserEditor**: 非常简化，只支持逗号分隔的文本输入
- **AttachmentEditor**: 存在但需要验证功能完整性
- 缺少一些编辑器实现

### 3. 字段类型选择器差异

#### 参考项目：
- 使用 `useFieldStaticGetter` hook 获取字段类型的图标、标题、默认选项
- 每个字段类型都有对应的图标和国际化标题
- 字段类型按特定顺序排列

#### 新项目：
- `FieldTypeSelector` 已有基本实现
- 字段类型列表 `FIELD_TYPES` 已定义，包含 18 种类型
- 有搜索功能和双列网格显示

## 改进方案

### 阶段 1: 完善字段类型定义映射

创建一个完整的字段类型映射系统，将参考项目的 FieldType 映射到新项目的 CellType。

**需要的改进：**
1. 在 `types/field.ts` 中添加完整的 FieldType 枚举定义
2. 创建 FieldType 到 CellType 的映射表
3. 确保所有字段类型都有对应的处理逻辑

### 阶段 2: 增强单元格编辑器

逐个改进编辑器以匹配参考项目的功能：

#### 2.1 DateEditor 增强
- [ ] 添加日期格式化支持
- [ ] 实现日历弹窗组件
- [ ] 支持日期+时间模式
- [ ] 添加时区处理

#### 2.2 SelectEditor 增强
- [ ] 添加创建新选项功能
- [ ] 改进搜索体验
- [ ] 支持选项的颜色显示
- [ ] 优化单选/多选交互

#### 2.3 UserEditor 增强
- [ ] 实现用户选择器弹窗
- [ ] 添加用户搜索功能
- [ ] 显示用户头像
- [ ] 支持单选/多选模式

#### 2.4 NumberEditor 增强
- [ ] 添加数字格式化选项
- [ ] 支持精度设置
- [ ] 实现数字显示模式（环形/条形图）

#### 2.5 AttachmentEditor 验证和增强
- [ ] 验证文件上传功能
- [ ] 实现文件预览
- [ ] 添加多文件支持
- [ ] 优化拖拽上传体验

### 阶段 3: 字段类型选择器对齐

#### 3.1 图标系统
- [ ] 为每个字段类型定义统一的图标
- [ ] 支持 Lookup 字段的特殊图标显示
- [ ] 支持 AI 配置字段的特殊标记

#### 3.2 字段创建交互
- [ ] 改进字段类型选择的用户体验
- [ ] 添加字段类型描述和预览
- [ ] 实现字段选项配置面板

### 阶段 4: 测试和验证

- [ ] 测试每个字段类型的编辑器
- [ ] 验证与参考项目的功能对齐度
- [ ] 性能优化
- [ ] 修复发现的 bug

## 具体实现建议

### 1. 创建字段类型映射系统

```typescript
// src/types/field.ts
export enum FieldType {
  SingleLineText = 'singleLineText',
  LongText = 'longText',
  User = 'user',
  Attachment = 'attachment',
  Checkbox = 'checkbox',
  MultipleSelect = 'multipleSelect',
  SingleSelect = 'singleSelect',
  Date = 'date',
  Number = 'number',
  Rating = 'rating',
  Formula = 'formula',
  Rollup = 'rollup',
  Link = 'link',
  CreatedTime = 'createdTime',
  LastModifiedTime = 'lastModifiedTime',
  CreatedBy = 'createdBy',
  LastModifiedBy = 'lastModifiedBy',
  AutoNumber = 'autoNumber',
  Button = 'button',
}

// FieldType 到 CellType 的映射
export const FIELD_TYPE_TO_CELL_TYPE_MAP: Record<FieldType, CellType> = {
  [FieldType.SingleLineText]: CellType.Text,
  [FieldType.LongText]: CellType.Text,
  [FieldType.User]: CellType.User,
  [FieldType.Attachment]: CellType.Attachment,
  [FieldType.Checkbox]: CellType.Boolean,
  [FieldType.MultipleSelect]: CellType.Select,
  [FieldType.SingleSelect]: CellType.Select,
  [FieldType.Date]: CellType.Date,
  [FieldType.Number]: CellType.Number,
  [FieldType.Rating]: CellType.Rating,
  [FieldType.Formula]: CellType.Text, // 根据计算结果类型动态确定
  [FieldType.Rollup]: CellType.Text,  // 根据汇总结果类型动态确定
  [FieldType.Link]: CellType.Link,
  [FieldType.CreatedTime]: CellType.Date,
  [FieldType.LastModifiedTime]: CellType.Date,
  [FieldType.CreatedBy]: CellType.User,
  [FieldType.LastModifiedBy]: CellType.User,
  [FieldType.AutoNumber]: CellType.Number,
  [FieldType.Button]: CellType.Button,
};
```

### 2. 增强编辑器实现参考

参考项目的编辑器都遵循以下模式：
1. 使用 `forwardRef` 和 `useImperativeHandle` 暴露 focus/setValue/saveValue 方法
2. 从 `record` 和 `field` 获取数据和配置
3. 使用 `record.updateCell` 更新单元格值
4. 编辑器位置通过 `useGridPopupPosition` 计算

### 3. 字段类型选择器优化

更新 `FieldTypeSelector` 以完全匹配参考项目的字段类型顺序和分类。

## 优先级

**高优先级（立即实施）：**
1. DateEditor 增强 - 日期是最常用的字段类型之一
2. SelectEditor 增强 - 选择字段使用频率高
3. UserEditor 增强 - 用户字段是协作场景必需的

**中优先级（尽快实施）：**
4. NumberEditor 增强
5. 字段类型映射系统完善
6. 字段类型选择器图标对齐

**低优先级（后续优化）：**
7. 公式和汇总字段支持
8. 特殊字段类型（CreatedTime, LastModifiedTime 等）
9. 性能优化和测试

## 下一步行动

1. 首先增强 DateEditor，实现日历弹窗功能
2. 然后改进 SelectEditor，添加选项创建和搜索
3. 重写 UserEditor，实现完整的用户选择器
4. 更新字段类型选择器，完善图标和分类
5. 全面测试并修复问题
