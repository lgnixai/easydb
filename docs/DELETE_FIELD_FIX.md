# 侧边栏 AI MCP 删除字段功能修复

## 问题描述

侧边栏 AI MCP 在删除字段时出现错误："未知操作: delete_field"，导致删除字段功能无法正常工作。

## 问题分析

通过代码分析发现，问题出现在以下几个地方：

1. **类型定义缺失**：`types.ts` 中的 `MCPAction` 类型没有包含 `delete_field`
2. **处理逻辑缺失**：`useMCPActions.ts` 中的 `executeAction` 函数没有处理 `delete_field` 操作
3. **标签缺失**：`getActionLabel` 函数没有 `delete_field` 的中文标签
4. **系统提示词缺失**：AI 配置中没有删除字段的操作说明和示例

## 修复方案

### 1. 更新类型定义

在 `src/components/AISidebar/types.ts` 中添加 `delete_field` 到 `MCPAction` 类型：

```typescript
export type MCPAction = 
  | 'create_space'
  | 'create_base'
  | 'create_table'
  | 'create_field'
  | 'create_fields_batch'
  | 'create_record'
  | 'list_tables'
  | 'get_base'
  | 'get_field'
  | 'delete_field'; // 新增
```

### 2. 添加处理逻辑

在 `src/components/AISidebar/hooks/useMCPActions.ts` 的 `executeAction` 函数中添加删除字段的处理：

```typescript
case 'delete_field': {
  await teable.deleteField(intent.params.field_id, intent.params.table_id);
  return { message: '字段删除成功' };
}
```

### 3. 添加中文标签

在 `getActionLabel` 函数中添加删除字段的标签：

```typescript
delete_field: '删除字段',
```

### 4. 更新系统提示词

在 `src/config/ai-sidebar.config.ts` 中：

- 在操作列表中添加删除字段说明
- 添加删除字段的示例

```typescript
6. 删除字段 (delete_field): 需要 field_id, table_id(可选)

示例5 - 删除字段：
用户: "删除年龄字段"
你的回复（纯JSON）:
{"action":"delete_field","params":{"field_id":"fld_age123","table_id":"${context.tableId}"},"requiresConfirmation":true,"confirmation":"将删除字段'年龄'，是否继续？","response":"好的，我将删除'年龄'字段"}
```

### 5. 更新测试

在测试文件中添加删除字段的测试用例：

```typescript
it('应该正确执行删除字段操作', async () => {
  const { result } = renderHook(() => useMCPActions());
  
  mockTeable.deleteField.mockResolvedValue(undefined);

  const intent = {
    action: 'delete_field' as const,
    params: { field_id: 'fld_123', table_id: 'tbl_123' },
    response: '好的'
  };

  await act(async () => {
    const response = await result.current.executeAction(intent);
    expect(response).toEqual({ message: '字段删除成功' });
  });

  expect(mockTeable.deleteField).toHaveBeenCalledWith('fld_123', 'tbl_123');
});
```

## 修复的文件列表

1. `src/components/AISidebar/types.ts` - 添加 delete_field 类型
2. `src/components/AISidebar/hooks/useMCPActions.ts` - 添加删除字段处理逻辑
3. `src/config/ai-sidebar.config.ts` - 更新系统提示词
4. `src/components/AISidebar/__tests__/useMCPActions.test.ts` - 添加测试用例
5. `jest.config.cjs` - 修复 Jest 配置
6. `package.json` - 移除重复的 Jest 配置

## 测试结果

所有测试用例通过，包括：
- ✅ 删除字段操作执行测试
- ✅ 删除字段标签测试
- ✅ 其他现有功能测试

## 使用方式

修复后，用户可以通过以下方式删除字段：

1. 在 AI 侧边栏中输入："删除年龄字段"
2. AI 会解析意图并生成确认对话框
3. 用户确认后，系统会调用 `teable.deleteField()` 方法删除字段
4. 显示删除成功的消息

## 技术细节

- 删除字段操作需要 `field_id` 参数（必需）
- `table_id` 参数是可选的，但建议提供以提高准确性
- 删除操作默认需要用户确认（`requiresConfirmation: true`）
- 支持中文错误消息和成功消息

## 注意事项

1. 删除字段是不可逆操作，建议在生产环境中谨慎使用
2. 确保在删除字段前检查是否有数据依赖
3. 建议在删除前先备份重要数据
