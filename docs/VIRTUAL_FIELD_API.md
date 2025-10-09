# 虚拟字段 API 文档

## 概述

本文档描述虚拟字段相关的 API 端点，包括计算、刷新和状态查询。

## API 端点

### 1. 更新记录（含虚拟字段触发）

**端点:** `PUT /api/records/:id/with-virtual-fields`

**说明:** 更新记录并自动触发相关虚拟字段重算

**请求参数:**
```json
{
  "field_name": "new_value",
  "another_field": 123
}
```

**Query 参数:**
- `table_id` (必需): 表格ID

**响应:**
```json
{
  "data": {
    "id": "rec123",
    "field_name": "new_value",
    "another_field": 123,
    "virtual_total": 1500.00,  // 虚拟字段值（已更新）
    "virtual_count": 5
  },
  "meta": {
    "virtual_fields_updated": true  // 标识虚拟字段已更新
  }
}
```

**示例:**
```bash
curl -X PUT "http://localhost:8080/api/records/rec123/with-virtual-fields?table_id=tbl456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"price": 100, "quantity": 5}'
```

---

### 2. 刷新单个虚拟字段

**端点:** `POST /api/records/:id/fields/:field_id/refresh`

**说明:** 强制刷新指定虚拟字段的值

**Query 参数:**
- `table_id` (必需): 表格ID

**响应:**
```json
{
  "data": {
    "id": "rec123",
    "virtual_field_value": 1500.00
  },
  "meta": {
    "refreshed": true,
    "field_id": "fld789",
    "calculated_at": "2024-01-01T12:00:00Z"
  }
}
```

**示例:**
```bash
curl -X POST "http://localhost:8080/api/records/rec123/fields/fld789/refresh?table_id=tbl456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. 批量刷新虚拟字段

**端点:** `POST /api/records/batch-refresh-virtual-fields`

**说明:** 批量刷新多条记录的虚拟字段

**Query 参数:**
- `table_id` (必需): 表格ID

**请求参数:**
```json
{
  "record_ids": ["rec123", "rec456", "rec789"]
}
```

**响应:**
```json
{
  "message": "Virtual fields refreshed successfully",
  "count": 3,
  "details": {
    "success": 3,
    "failed": 0
  }
}
```

**示例:**
```bash
curl -X POST "http://localhost:8080/api/records/batch-refresh-virtual-fields?table_id=tbl456" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"record_ids": ["rec123", "rec456"]}'
```

---

### 4. 获取虚拟字段状态

**端点:** `GET /api/records/:id/fields/:field_id/status`

**说明:** 查询虚拟字段的计算状态和缓存信息

**响应:**
```json
{
  "record_id": "rec123",
  "field_id": "fld789",
  "status": "cached",           // idle | calculating | cached | error
  "cached_at": "2024-01-01T12:00:00Z",
  "expires_at": "2024-01-01T12:05:00Z",
  "ttl_seconds": 300,
  "value": 1500.00,
  "calculation_time_ms": 45
}
```

**状态说明:**
- `idle`: 未计算
- `calculating`: 计算中
- `cached`: 已缓存
- `error`: 计算错误

**示例:**
```bash
curl "http://localhost:8080/api/records/rec123/fields/fld789/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. 清除虚拟字段缓存

**端点:** `DELETE /api/records/:id/fields/:field_id/cache`

**说明:** 清除指定虚拟字段的缓存

**响应:**
```json
{
  "message": "Cache cleared successfully",
  "record_id": "rec123",
  "field_id": "fld789"
}
```

**示例:**
```bash
curl -X DELETE "http://localhost:8080/api/records/rec123/fields/fld789/cache" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 前端集成示例

### React Hook 使用

```tsx
import { useVirtualFieldSync, useVirtualFieldUpdate } from '@/hooks/useVirtualFieldSync'

function RecordEditor({ recordId, tableId }) {
  // 虚拟字段同步
  const { status, refreshField, refreshAllFields } = useVirtualFieldSync({
    recordId,
    tableId,
    virtualFieldIds: ['total_amount', 'average_rating'],
  })

  // 虚拟字段更新
  const { updateRecord } = useVirtualFieldUpdate({
    tableId,
    onVirtualFieldUpdated: (fieldId, value) => {
      console.log(`虚拟字段 ${fieldId} 更新为:`, value)
    },
  })

  const handleUpdate = async () => {
    await updateRecord(recordId, {
      price: 100,
      quantity: 5,
    })
    // 虚拟字段会自动刷新
  }

  return (
    <div>
      <button onClick={handleUpdate}>更新记录</button>
      <button onClick={refreshAllFields}>刷新虚拟字段</button>
      
      {/* 显示状态 */}
      <VirtualFieldSyncIndicator
        status={status.total_amount?.status || 'idle'}
        lastUpdated={status.total_amount?.lastUpdated}
        onRefresh={() => refreshField('total_amount')}
      />
    </div>
  )
}
```

### 手动刷新

```tsx
import axios from 'axios'

async function refreshVirtualField(recordId: string, fieldId: string, tableId: string) {
  const response = await axios.post(
    `/api/records/${recordId}/fields/${fieldId}/refresh`,
    {},
    { params: { table_id: tableId } }
  )
  
  return response.data
}
```

### 批量刷新

```tsx
async function batchRefreshVirtualFields(tableId: string, recordIds: string[]) {
  const response = await axios.post(
    `/api/records/batch-refresh-virtual-fields`,
    { record_ids: recordIds },
    { params: { table_id: tableId } }
  )
  
  return response.data
}
```

---

## WebSocket 实时推送（可选）

对于需要实时更新的场景，可以使用 WebSocket 推送虚拟字段更新：

### 连接

```javascript
const ws = new WebSocket('ws://localhost:8080/ws')

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  
  if (message.type === 'virtual_field_updated') {
    console.log('虚拟字段更新:', message.data)
    // 更新 UI
  }
}
```

### 消息格式

```json
{
  "type": "virtual_field_updated",
  "data": {
    "record_id": "rec123",
    "table_id": "tbl456",
    "fields": {
      "total_amount": 1500.00,
      "average_rating": 4.5
    },
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

---

## 性能优化建议

### 1. 批量操作

尽量使用批量 API 而不是循环调用单个 API：

```tsx
// ❌ 不推荐
for (const recordId of recordIds) {
  await refreshVirtualField(recordId, fieldId, tableId)
}

// ✅ 推荐
await batchRefreshVirtualFields(tableId, recordIds)
```

### 2. 缓存策略

利用缓存减少不必要的计算：

```tsx
// 检查缓存状态
const status = await getVirtualFieldStatus(recordId, fieldId)

if (status.status === 'cached' && !isExpired(status.expires_at)) {
  // 使用缓存值
  return status.value
} else {
  // 刷新
  return await refreshVirtualField(recordId, fieldId, tableId)
}
```

### 3. 条件刷新

只在必要时刷新虚拟字段：

```tsx
const handleUpdate = async (updatedFields: string[]) => {
  await updateRecord(recordId, updates)
  
  // 只刷新受影响的虚拟字段
  const affectedVirtualFields = getAffectedVirtualFields(updatedFields)
  
  for (const fieldId of affectedVirtualFields) {
    await refreshField(fieldId)
  }
}
```

---

## 错误处理

### 错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数 |
| 404 | 记录或字段不存在 | 验证ID |
| 500 | 计算失败 | 查看错误详情，可能需要修复字段配置 |
| 503 | 服务暂时不可用 | 稍后重试 |

### 错误响应格式

```json
{
  "error": "计算虚拟字段失败",
  "details": {
    "field_id": "fld789",
    "error_type": "formula_error",
    "message": "表达式语法错误: {invalid_field}"
  }
}
```

### 前端错误处理

```tsx
try {
  await updateRecord(recordId, updates)
} catch (error) {
  if (error.response?.status === 500) {
    // 虚拟字段计算失败
    console.error('虚拟字段计算失败:', error.response.data.details)
    // 显示错误提示
    toast.error('虚拟字段计算失败，请检查配置')
  } else {
    // 其他错误
    toast.error('更新失败')
  }
}
```

---

## 监控和调试

### 性能监控

记录虚拟字段计算耗时：

```tsx
const startTime = Date.now()
await refreshVirtualField(recordId, fieldId, tableId)
const duration = Date.now() - startTime

console.log(`虚拟字段计算耗时: ${duration}ms`)
```

### 调试工具

使用浏览器开发者工具查看 API 调用：

```tsx
// 在控制台查看虚拟字段状态
window.debugVirtualFields = async (recordId: string) => {
  const fields = await getVirtualFields(recordId)
  
  for (const field of fields) {
    const status = await getVirtualFieldStatus(recordId, field.id)
    console.table({
      field: field.name,
      status: status.status,
      cached_at: status.cached_at,
      value: status.value,
    })
  }
}
```

