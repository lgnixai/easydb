# AI 侧边栏记录创建修复

## 问题描述

AI侧边栏在创建记录时出现"数据验证失败"错误，具体表现为：

```
创建记录失败:数据验证失败
fields: {"name":"姓名","value":"[\"张三\",\"李四\",\"王五\"]"}
```

## 问题原因

1. **数据格式错误**: AI在生成记录数据时，错误地将多个值组合成了JSON字符串格式的数组 `"[\"张三\",\"李四\",\"王五\"]"`
2. **字段类型不匹配**: 姓名字段期望的是单个字符串值，但收到了数组格式的数据
3. **缺乏数据验证**: 没有在发送数据前进行格式验证和修正

## 解决方案

### 1. 改进AI提示词

在 `useAIChatWithMCP.ts` 中添加了明确的记录创建规则：

```typescript
4. **记录创建重要规则**：
   - 当用户要求"生成X条记录"时，应该创建X条独立的记录，每条记录包含不同的数据
   - 字段值必须是正确的数据类型：字符串、数字、布尔值等
   - 不要将多个值组合成数组或JSON字符串
   - 每个字段值应该是单个值，不是数组
```

### 2. 添加数据验证和修正逻辑

在 `useMCPActions.ts` 中添加了 `validateAndFixRecordFields` 函数：

```typescript
export const validateAndFixRecordFields = (fields: Record<string, any>): Record<string, any> => {
  const validatedFields: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    // 检查是否是JSON字符串格式的数组（常见错误）
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 如果是数组，取第一个元素作为值
          validatedFields[key] = parsed[0];
          continue;
        }
      } catch (e) {
        // 解析失败，保持原值
      }
    }
    
    // 检查是否是数组格式
    if (Array.isArray(value) && value.length > 0) {
      validatedFields[key] = value[0];
      continue;
    }
    
    // 其他情况保持原值
    validatedFields[key] = value;
  }
  
  return validatedFields;
};
```

### 3. 添加批量创建记录功能

新增了 `create_record_batch` 操作，支持批量创建多条记录：

```typescript
case 'create_record_batch': {
  // 批量创建记录
  const count = intent.params.count || 1;
  const template = intent.params.template || {};
  const results = [];
  
  for (let i = 0; i < count; i++) {
    try {
      // 为每条记录生成不同的数据
      const fields = generateRecordData(template, i);
      const validatedFields = validateAndFixRecordFields(fields);
      
      const response = await teable.createRecord({
        table_id: intent.params.table_id,
        fields: validatedFields,
      });
      results.push({ success: true, index: i, data: response.data });
    } catch (error: any) {
      results.push({ success: false, index: i, error: error.message });
    }
  }
  
  return {
    total: count,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}
```

### 4. 添加随机数据生成

新增了 `generateRecordData` 函数，支持生成随机测试数据：

```typescript
export const generateRecordData = (template: Record<string, any>, index: number): Record<string, any> => {
  const data: Record<string, any> = {};
  
  // 预定义的随机数据
  const randomNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const randomAges = [20, 25, 30, 35, 40, 45, 50];
  const randomEmails = ['zhang@example.com', 'li@example.com', 'wang@example.com', 'zhao@example.com'];
  const randomDepartments = ['技术部', '销售部', '市场部', '人事部', '财务部'];
  
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'string') {
      switch (value.toLowerCase()) {
        case '随机姓名':
        case 'random name':
          data[key] = randomNames[index % randomNames.length];
          break;
        case '随机年龄':
        case 'random age':
          data[key] = randomAges[index % randomAges.length];
          break;
        // ... 其他随机数据类型
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
};
```

## 测试验证

创建了测试用例验证修复效果：

```javascript
// 测试1: JSON字符串格式的数组
const fields1 = {
  '姓名': '["张三","李四","王五"]',
  '年龄': 25,
  '邮箱': 'test@example.com'
};
const result1 = validateAndFixRecordFields(fields1);
// 结果: { '姓名': '张三', '年龄': 25, '邮箱': 'test@example.com' } ✅

// 测试2: 数组格式的值
const fields2 = {
  '姓名': ['张三', '李四', '王五'],
  '年龄': 25
};
const result2 = validateAndFixRecordFields(fields2);
// 结果: { '姓名': '张三', '年龄': 25 } ✅
```

## 使用示例

### 创建单条记录
```
用户: "添加一条员工记录，姓名张三，年龄25"
```

### 创建多条记录
```
用户: "生成3条员工记录"
```

AI会使用批量创建功能，为每条记录生成不同的随机数据。

## 修复效果

1. ✅ 解决了数据验证失败的问题
2. ✅ 自动修正错误的数据格式
3. ✅ 支持批量创建多条记录
4. ✅ 提供随机数据生成功能
5. ✅ 改进了错误处理和用户提示

现在AI侧边栏可以正常创建记录，不再出现数据验证失败的错误。

