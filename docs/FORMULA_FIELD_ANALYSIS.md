# 公式字段问题深度分析报告

## 📋 问题现状

用户报告：
1. 创建了"名次"公式字段（使用 RANK 函数）
2. 字段保存成功，但**表格中字段为空，没有计算结果**
3. 同样的问题也出现在 SUM 函数上

## 🔍 深入研究 teable-develop 项目

### 核心架构发现

#### 1. 公式计算流程

**后端计算架构**：
```typescript
// packages/core/src/formula/evaluate.ts
export const evaluate = (
  input: string,              // 公式表达式
  dependFieldMap: {...},      // 依赖字段映射
  record?: IRecord,           // 记录数据
  timeZone?: string           // 时区
): TypedValue => {
  // 使用 ANTLR4 解析公式
  const inputStream = CharStreams.fromString(input);
  const lexer = new FormulaLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new Formula(tokenStream);
  
  // 使用访问者模式计算结果
  const visitor = new EvalVisitor(dependFieldMap, record, timeZone);
  return visitor.visit(tree);
};
```

**计算服务流程**：
```typescript
// apps/nestjs-backend/src/features/calculation/reference.service.ts
private calculateFormula(field, fieldMap, recordItem) {
  const typedValue = evaluate(
    field.options.expression,  // ⚠️ 关键：从 options.expression 读取公式
    fieldMap,
    recordItem.record,
    field.options.timeZone
  );
  return typedValue.toPlain();
}
```

**计算触发机制**：
```typescript
// apps/nestjs-backend/src/features/calculation/field-calculation.service.ts
async calculateFields(tableId: string, fieldIds: string[], recordIds?: string[]) {
  // 1. 获取拓扑排序上下文
  const context = await this.getTopoOrdersContext(fieldIds);
  
  // 2. 批量计算字段
  await this.calculateChanges(tableId, context, recordIds);
}

// 按拓扑顺序计算每个字段
for (const order of topoOrders) {
  const field = fieldMap[order.id];
  if (field.type === FieldType.Formula) {
    await this.calculateFormula(field, fieldMap, recordItem);
  }
}
```

#### 2. 函数注册系统

**原始项目支持的函数**（packages/core/src/formula/functions/factory.ts）：
```typescript
export const FUNCTIONS: Record<FunctionName, FormulaFunc> = {
  // 数值函数
  [FunctionName.Sum]: new Sum(),
  [FunctionName.Average]: new Average(),
  [FunctionName.Max]: new Max(),
  [FunctionName.Min]: new Min(),
  // ... 其他函数
  
  // ⚠️ 没有 RANK、DENSE_RANK、ROW_NUMBER 函数！
};
```

### 🎯 问题根源分析

#### 问题1：RANK 函数不存在 ❌

- 原始 teable 项目**完全没有** RANK、DENSE_RANK、ROW_NUMBER 函数
- 函数枚举 `FunctionName` 中没有定义
- 函数工厂 `FUNCTIONS` 中没有注册
- 这就是为什么 RANK 字段为空的原因

#### 问题2：公式字段的 options.expression 未正确设置 ❌

**正确的字段结构**应该是：
```json
{
  "id": "fld_xxx",
  "name": "名次",
  "type": "formula",
  "options": {
    "expression": "RANK({分数}, DESC)"  // ⚠️ 关键：必须在 options 中
  }
}
```

**我们之前的错误做法**：
```json
{
  "id": "fld_xxx",
  "name": "名次",
  "type": "formula",
  "description": "RANK({分数}, DESC)",  // ❌ 错误：放在 description 中
  "options": null  // ❌ 错误：options 为空
}
```

#### 问题3：双重序列化问题 ❌

在 `useMCPActions.ts` 中发现的问题：
```typescript
// ❌ 错误：双重序列化
case 'update_field': {
  const response = await teable.updateField(field_id, {
    options: intent.params.options ? JSON.stringify(intent.params.options) : undefined,  // 第一次序列化
  });
}

// teable-simple.ts 中的 updateField 方法
async updateField(field_id, updates) {
  const payload = { ...updates };
  if (payload.options && typeof payload.options === 'object') {
    payload.options = JSON.stringify(payload.options);  // 第二次序列化 ❌
  }
}

// 结果：options 变成了 "{\\"expression\\":\\"RANK({分数})\\"}}" 而不是 {"expression":"RANK({分数})"}
```

## ✅ 解决方案

### 修复1：移除双重序列化

**修改文件**：`teable-ui/src/components/AISidebar/hooks/useMCPActions.ts`

```typescript
// ✅ 正确：直接传递对象，让 updateField 方法统一处理
case 'update_field': {
  const response = await teable.updateField(intent.params.field_id, {
    name: intent.params.name,
    type: intent.params.type,
    description: intent.params.description,
    // options 直接传递对象，在 updateField 方法中会自动序列化
    options: intent.params.options,
  });
  return response.data;
}
```

### 修复2：确保公式字段包含 expression

创建公式字段时，必须确保：
```typescript
const response = await teableClient.createField({
  table_id: 'tbl_xxx',
  name: '总分',
  type: 'formula',
  options: JSON.stringify({
    expression: 'SUM({数学}, {英语})'  // ⚠️ 必须包含 expression
  })
});
```

### 修复3：实现 RANK 函数（可选）

如果需要 RANK 函数，必须在核心库中实现：

**步骤1**：在 `packages/core/src/formula/functions/common.ts` 中添加枚举：
```typescript
export enum FunctionName {
  // ... 其他函数
  Rank = 'RANK',
  DenseRank = 'DENSE_RANK',
  RowNumber = 'ROW_NUMBER',
}
```

**步骤2**：在 `packages/core/src/formula/functions/numeric.ts` 中实现：
```typescript
export class Rank extends NumericFunc {
  name = FunctionName.Rank;
  acceptValueType = new Set([CellValueType.Number]);
  acceptMultipleValue = false;
  
  validateParams(params: TypedValue[]) {
    if (params.length < 1) {
      throw new Error(`${FunctionName.Rank} needs at least 1 param`);
    }
  }
  
  getReturnType(params?: TypedValue[]) {
    return { type: CellValueType.Number };
  }
  
  eval(params: TypedValue[], context: IFormulaContext): number {
    // ⚠️ 问题：RANK 函数需要访问所有记录来计算排名
    // 但 eval 方法只能访问当前记录
    // 这需要重新设计函数架构！
  }
}
```

**步骤3**：在 `packages/core/src/formula/functions/factory.ts` 中注册：
```typescript
export const FUNCTIONS: Record<FunctionName, FormulaFunc> = {
  // ... 其他函数
  [FunctionName.Rank]: new Rank(),
  [FunctionName.DenseRank]: new DenseRank(),
  [FunctionName.RowNumber]: new RowNumber(),
};
```

## ⚠️ RANK 函数的架构限制

### 核心问题

**现有公式系统的设计限制**：
- 所有公式函数的 `eval` 方法只能访问**当前记录**
- RANK 函数需要访问**所有记录**来计算排名
- 这是一个根本性的架构限制

### 两种可能的解决方案

#### 方案1：使用 Lookup 字段（推荐）
```
1. 创建一个数值字段（如"分数"）
2. 创建一个 Lookup 字段，引用所有记录的分数
3. 使用自定义逻辑计算排名
```

#### 方案2：扩展公式系统（复杂）
需要修改核心架构，允许某些函数访问全局上下文：
```typescript
interface IFormulaContext {
  record: IRecord;                    // 当前记录
  timeZone: string;
  dependencies: { [fieldId: string]: FieldCore };
  allRecords?: IRecord[];            // ⚠️ 新增：所有记录（仅用于特殊函数）
}
```

## 🧪 测试结论

### SUM 函数测试

**测试结果**：
1. ✅ SUM 函数在原始项目中存在并已注册
2. ❌ 但创建的公式字段**未显示在表格中**
3. ❌ **没有计算结果**

**原因**：
- options.expression 未正确设置
- 字段创建时 options 为 null

### RANK 函数测试

**测试结果**：
1. ❌ RANK 函数在原始项目中**完全不存在**
2. ❌ 即使正确设置 options，函数也无法执行

**原因**：
- 函数未实现
- 即使实现，也受到架构限制

## 📝 总结

### 核心问题

1. **公式字段的 options.expression 必须正确设置** ⭐⭐⭐
   - 这是公式能否计算的关键
   - 后端从 `field.options.expression` 读取公式
   
2. **双重序列化导致 options 格式错误** ⭐⭐
   - useMCPActions 中序列化了一次
   - updateField 方法中又序列化了一次
   - 已修复

3. **RANK 函数不存在** ⭐
   - 需要完整实现才能使用
   - 受到架构限制，实现困难

### 下一步行动

1. ✅ **已修复**：移除双重序列化
2. 🔄 **待测试**：使用正确的 options 格式创建公式字段
3. 🔄 **待验证**：SUM 函数是否能正常工作
4. ⏸️ **暂缓**：RANK 函数实现（需要架构级别的修改）

## 💡 建议

### 短期方案（立即可用）
使用现有的内置函数：
- ✅ SUM、AVERAGE、MAX、MIN 等数学函数
- ✅ IF、SWITCH 等逻辑函数
- ✅ CONCATENATE、LEFT、RIGHT 等文本函数

### 中期方案（需要开发）
实现简单的排名功能：
- 使用视图级别的排序功能
- 使用 ROW_NUMBER 类型的函数（不需要访问所有记录）

### 长期方案（需要架构重构）
扩展公式系统支持全局上下文函数：
- 修改 IFormulaContext 接口
- 实现特殊函数类别（WindowFunction）
- 支持 RANK、DENSE_RANK、LEAD、LAG 等窗口函数

