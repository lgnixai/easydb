# 字段类型系统使用指南

## 概述

本指南介绍如何使用新的字段类型系统，包括字段类型定义、映射工具和字段类型选择器。

## 快速开始

### 1. 导入字段类型

```typescript
import { FieldType, IFieldTypeInfo, FIELD_TYPE_CONFIGS } from '@your-package/grid-table-kanban';
```

### 2. 使用字段类型枚举

```typescript
// 创建字段时使用字段类型
const field = {
  id: 'field1',
  name: '用户名',
  type: FieldType.SingleLineText,
  options: {}
};

// 判断字段类型
if (field.type === FieldType.Date) {
  // 处理日期字段
}
```

### 3. 使用字段类型映射工具

```typescript
import { 
  getCellTypeFromFieldType, 
  isReadonlyField,
  isComputedField,
  getDefaultFieldOptions 
} from '@your-package/grid-table-kanban';

// 获取字段类型对应的单元格类型
const cellType = getCellTypeFromFieldType(FieldType.Date);
// 返回: CellType.Date

// 判断是否为只读字段
const isReadonly = isReadonlyField(FieldType.CreatedTime);
// 返回: true

// 判断是否为计算字段
const isComputed = isComputedField(FieldType.Formula);
// 返回: true

// 获取字段类型的默认选项
const defaultOptions = getDefaultFieldOptions(FieldType.Rating);
// 返回: { icon: '⭐', color: '#FFD700', max: 5 }
```

### 4. 使用字段类型选择器

```typescript
import { FieldTypeSelector } from '@your-package/grid-table-kanban';
import { useRef, useState } from 'react';

function MyComponent() {
  const selectorRef = useRef<IFieldTypeSelectorRef>(null);
  const [currentFieldType, setCurrentFieldType] = useState<FieldType>();

  const handleAddField = () => {
    // 显示字段类型选择器
    selectorRef.current?.show({ x: 100, y: 100 });
  };

  const handleFieldTypeSelect = (fieldTypeInfo: IFieldTypeInfo) => {
    console.log('选择的字段类型:', fieldTypeInfo);
    setCurrentFieldType(fieldTypeInfo.fieldType);
    
    // 使用字段类型信息
    const { fieldType, cellType, name, category } = fieldTypeInfo;
    // ... 创建字段
  };

  return (
    <>
      <button onClick={handleAddField}>添加字段</button>
      
      <FieldTypeSelector
        ref={selectorRef}
        currentFieldType={currentFieldType}
        onSelect={handleFieldTypeSelect}
        onCancel={() => console.log('取消选择')}
        showSystemFields={true} // 是否显示系统字段
      />
    </>
  );
}
```

## 字段类型分类

### 基础字段（Basic）
适用于大多数常见场景：

- **SingleLineText** - 单行文本：适用于姓名、标题等短文本
- **LongText** - 长文本：适用于描述、备注等多行文本
- **Number** - 数字：适用于数量、金额等数值
- **SingleSelect** - 单选：从选项中选择一个
- **MultipleSelect** - 多选：从选项中选择多个
- **User** - 用户：选择协作成员
- **Date** - 日期：日期和时间
- **Rating** - 评分：星级评分
- **Checkbox** - 勾选：是/否选择
- **Attachment** - 附件：上传文件和图片

### 高级字段（Advanced）
用于复杂的业务逻辑：

- **Link** - 关联：关联其他表的记录
- **Formula** - 公式：使用公式自动计算（只读）
- **Rollup** - 汇总：汇总关联记录的值（只读）
- **Button** - 按钮：触发自定义操作

### 系统字段（System）
自动维护的元数据字段：

- **CreatedTime** - 创建时间：自动记录创建时间（只读）
- **LastModifiedTime** - 修改时间：自动记录修改时间（只读）
- **CreatedBy** - 创建人：自动记录创建者（只读）
- **LastModifiedBy** - 修改人：自动记录修改者（只读）
- **AutoNumber** - 自增数字：自动递增的编号（只读）

## 字段选项接口

### 日期字段选项

```typescript
import { IDateFieldOptions } from '@your-package/grid-table-kanban';

const dateOptions: IDateFieldOptions = {
  formatting: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm',
    timeZone: 'Asia/Shanghai'
  }
};
```

### 选择字段选项

```typescript
import { ISelectFieldOptions } from '@your-package/grid-table-kanban';

const selectOptions: ISelectFieldOptions = {
  choices: [
    { id: '1', name: '待处理', color: 'blue' },
    { id: '2', name: '进行中', color: 'yellow' },
    { id: '3', name: '已完成', color: 'green' },
  ],
  preventAutoNewOptions: false
};
```

### 数字字段选项

```typescript
import { INumberFieldOptions } from '@your-package/grid-table-kanban';

const numberOptions: INumberFieldOptions = {
  precision: 2,
  showAs: {
    type: 'bar',
    color: '#4CAF50',
    maxValue: 100,
    showValue: true
  }
};
```

### 用户字段选项

```typescript
import { IUserFieldOptions } from '@your-package/grid-table-kanban';

const userOptions: IUserFieldOptions = {
  isMultiple: true,
  preventAutoNewOptions: false
};
```

### 关联字段选项

```typescript
import { ILinkFieldOptions } from '@your-package/grid-table-kanban';

const linkOptions: ILinkFieldOptions = {
  relationship: 'manyOne',
  foreignTableId: 'table123',
  lookupFieldId: 'field456',
  symmetricFieldId: 'field789'
};
```

### 评分字段选项

```typescript
import { IRatingFieldOptions } from '@your-package/grid-table-kanban';

const ratingOptions: IRatingFieldOptions = {
  icon: '⭐',
  color: '#FFD700',
  max: 5
};
```

## 完整示例

### 创建带有字段类型的表格

```typescript
import { 
  FieldType, 
  getCellTypeFromFieldType,
  getDefaultFieldOptions,
  FieldTypeSelector 
} from '@your-package/grid-table-kanban';

interface Field {
  id: string;
  name: string;
  fieldType: FieldType;
  cellType: CellType;
  options: unknown;
}

function TableBuilder() {
  const [fields, setFields] = useState<Field[]>([]);
  const selectorRef = useRef<IFieldTypeSelectorRef>(null);

  const addField = (fieldTypeInfo: IFieldTypeInfo) => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      name: `新${fieldTypeInfo.name}`,
      fieldType: fieldTypeInfo.fieldType,
      cellType: fieldTypeInfo.cellType,
      options: getDefaultFieldOptions(fieldTypeInfo.fieldType)
    };
    
    setFields(prev => [...prev, newField]);
  };

  return (
    <div>
      <button onClick={() => selectorRef.current?.show({ x: 200, y: 100 })}>
        添加字段
      </button>
      
      <div>
        {fields.map(field => (
          <div key={field.id}>
            {field.name} - {field.fieldType}
          </div>
        ))}
      </div>
      
      <FieldTypeSelector
        ref={selectorRef}
        onSelect={addField}
        showSystemFields={true}
      />
    </div>
  );
}
```

## 最佳实践

### 1. 使用枚举而非字符串

❌ 不推荐：
```typescript
const fieldType = 'singleLineText';
```

✅ 推荐：
```typescript
const fieldType = FieldType.SingleLineText;
```

### 2. 使用工具函数进行类型转换

❌ 不推荐：
```typescript
let cellType: CellType;
if (fieldType === 'singleLineText' || fieldType === 'longText') {
  cellType = CellType.Text;
} else if (fieldType === 'number') {
  cellType = CellType.Number;
}
// ... 很多 if-else
```

✅ 推荐：
```typescript
const cellType = getCellTypeFromFieldType(fieldType);
```

### 3. 使用类型定义

❌ 不推荐：
```typescript
const options = {
  formatting: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm'
  }
};
```

✅ 推荐：
```typescript
const options: IDateFieldOptions = {
  formatting: {
    date: 'YYYY-MM-DD',
    time: 'HH:mm',
    timeZone: 'Asia/Shanghai'
  }
};
```

### 4. 利用分类信息

```typescript
import { FIELD_TYPE_CONFIGS } from '@your-package/grid-table-kanban';

// 只显示基础字段
const basicFields = FIELD_TYPE_CONFIGS.filter(f => f.category === 'basic');

// 过滤掉只读字段
const editableFields = FIELD_TYPE_CONFIGS.filter(f => !f.isReadonly);

// 按分类分组
const fieldsByCategory = FIELD_TYPE_CONFIGS.reduce((acc, field) => {
  if (!acc[field.category]) acc[field.category] = [];
  acc[field.category].push(field);
  return acc;
}, {} as Record<string, IFieldTypeInfo[]>);
```

## 常见问题

### Q: 如何判断一个字段是否可以编辑？

```typescript
import { isReadonlyField } from '@your-package/grid-table-kanban';

const canEdit = !isReadonlyField(field.type);
```

### Q: 如何获取所有非系统字段？

```typescript
import { FIELD_TYPE_CONFIGS } from '@your-package/grid-table-kanban';

const nonSystemFields = FIELD_TYPE_CONFIGS.filter(f => f.category !== 'system');
```

### Q: 如何为字段类型添加自定义图标？

目前图标是在 `FIELD_TYPE_CONFIGS` 中定义的。如果需要自定义，可以创建一个映射：

```typescript
const customIcons: Record<FieldType, string> = {
  [FieldType.SingleLineText]: '📝',
  [FieldType.Number]: '🔢',
  // ... 其他字段类型
};

const icon = customIcons[fieldType] || '📄';
```

### Q: 如何扩展字段类型？

如果需要添加新的字段类型：

1. 在 `FieldType` 枚举中添加新类型
2. 在 `FIELD_TYPE_TO_CELL_TYPE_MAP` 中添加映射
3. 在 `FIELD_TYPE_CONFIGS` 中添加配置
4. 在 `getDefaultFieldOptions` 中添加默认选项

## 参考

- [字段同步方案](../FIELD_SYNCHRONIZATION_PLAN.md)
- [实现报告](../IMPLEMENTATION_REPORT.md)
- [完成总结](../SYNCHRONIZATION_SUMMARY.md)
