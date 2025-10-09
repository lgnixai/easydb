# 删除记录功能实现指南

## 📋 概述

本指南详细说明了如何在 teable-ui 中实现删除记录功能，包括前端和后端的完整集成。

## 🎯 功能特性

### 前端功能
- ✅ 统一的删除记录 Hook (`useDeleteRecords`)
- ✅ 单条记录删除
- ✅ 批量记录删除
- ✅ 删除确认对话框
- ✅ 乐观更新（先更新UI，后调用API）
- ✅ 错误回滚机制
- ✅ Toast 通知提示

### 后端功能
- ✅ 单条删除 API: `DELETE /api/records/:id`
- ✅ 批量删除 API: `DELETE /api/records/bulk`
- ✅ 权限检查
- ✅ 软删除机制
- ✅ 变更追踪
- ✅ 版本历史

## 📦 核心组件

### 1. useDeleteRecords Hook

位置: `/src/hooks/useDeleteRecords.ts`

```typescript
import { useDeleteRecords } from '@/hooks/useDeleteRecords';

const { deleteRecords, deleteRecord, isDeleting, error } = useDeleteRecords({
  tableId: 'your-table-id',
  onSuccess: () => {
    console.log('删除成功');
  },
  onError: (error) => {
    console.error('删除失败:', error);
  },
  showConfirm: true, // 是否显示确认对话框
  confirmMessage: '确定要删除吗？' // 自定义确认消息
});
```

**API:**
- `deleteRecords(recordIds: string[])` - 批量删除
- `deleteRecord(recordId: string)` - 单条删除
- `isDeleting` - 删除状态
- `error` - 错误信息

### 2. DeleteConfirmDialog 组件

位置: `/src/components/DeleteConfirmDialog.tsx`

```typescript
<DeleteConfirmDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  onConfirm={handleDelete}
  count={selectedCount}
  title="确认删除"
  description="此操作无法撤销"
/>
```

### 3. 前端 API 客户端

位置: `/src/lib/teable-simple.ts`

```typescript
// 单条删除
await teable.deleteRecord({
  table_id: 'table-id',
  record_id: 'record-id'
});

// 批量删除
await teable.deleteRecords({
  table_id: 'table-id',
  record_ids: ['id1', 'id2', 'id3']
});
```

## 🔧 集成示例

### 在 AdvancedGlideGrid 中使用

```typescript
import { useDeleteRecords } from '@/hooks/useDeleteRecords';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

function MyGrid({ tableId }) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 初始化删除 Hook
  const { deleteRecords, isDeleting } = useDeleteRecords({
    tableId,
    showConfirm: false, // 使用自定义对话框
    onSuccess: () => {
      // 更新本地数据
      const updatedData = data.filter((_, idx) => 
        !selectedRows.includes(idx)
      );
      setData(updatedData);
      setSelectedRows([]);
    },
  });

  // 删除处理
  const handleDeleteConfirm = async () => {
    const recordIds = selectedRows.map(idx => data[idx].id);
    await deleteRecords(recordIds);
  };

  return (
    <>
      <button
        onClick={() => setShowDeleteDialog(true)}
        disabled={selectedRows.length === 0 || isDeleting}
      >
        删除选中 ({selectedRows.length})
      </button>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        count={selectedRows.length}
      />
    </>
  );
}
```

## 🖥️ 后端实现

### 1. 单条删除端点

**路径:** `DELETE /api/records/:id`

**Handler:** `server/internal/interfaces/http/record_handler.go`

```go
func (h *RecordHandler) DeleteRecord(c *gin.Context) {
    recordID := c.Param("id")
    userID, _ := c.Get("user_id")
    
    err := h.recordService.DeleteRecord(
        c.Request.Context(), 
        recordID, 
        userID.(string)
    )
    
    if err != nil {
        h.handleError(c, err)
        return
    }
    
    response.SuccessWithMessage(c, map[string]bool{
        "success": true
    }, "")
}
```

### 2. 批量删除端点

**路径:** `DELETE /api/records/bulk`

**请求体:**
```json
{
  "record_ids": ["id1", "id2", "id3"]
}
```

**Handler:** 逐条删除以保持权限检查和变更追踪

```go
func (h *RecordHandler) BulkDeleteRecords(c *gin.Context) {
    var req recdomain.BulkDeleteRequest
    // ...绑定请求
    
    userID, _ := c.Get("user_id")
    
    for _, recordID := range req.RecordIDs {
        if err := h.recordService.DeleteRecord(
            c.Request.Context(), 
            recordID, 
            userID.(string)
        ); err != nil {
            h.handleError(c, err)
            return
        }
    }
    
    response.SuccessWithMessage(c, map[string]interface{}{
        "success": true,
        "deleted_count": len(req.RecordIDs),
    }, "")
}
```

### 3. 删除服务逻辑

**位置:** `server/internal/application/record_service.go`

```go
func (s *RecordService) DeleteRecord(
    ctx context.Context, 
    recordID string, 
    userID string
) error {
    // 1. 获取记录
    rec, err := s.recordRepo.GetByID(ctx, recordID)
    
    // 2. 权限检查
    err = s.checkPermission(
        ctx, 
        userID, 
        rec.TableID, 
        permission.ActionRecordDelete
    )
    
    // 3. 软删除
    rec.SoftDelete()
    err = s.recordRepo.Update(ctx, rec)
    
    // 4. 记录变更事件
    changeEvent := rec.CreateChangeEvent("delete", oldData, userID)
    s.changeTracker.TrackChange(ctx, changeEvent)
    
    // 5. 创建版本历史
    s.versionManager.CreateVersion(ctx, rec, "delete", userID)
    
    return nil
}
```

## 🧪 测试

### 测试页面

访问: `/delete-test` 

**测试步骤:**
1. 页面加载后自动初始化测试表
2. 选择一行或多行记录
3. 点击"删除选中"按钮
4. 确认删除对话框
5. 观察删除结果
6. 点击"刷新数据"验证后端状态

### 手动测试

```typescript
// 1. 单条删除
await teable.deleteRecord({
  table_id: 'test-table',
  record_id: 'record-1'
});

// 2. 批量删除
await teable.deleteRecords({
  table_id: 'test-table',
  record_ids: ['record-1', 'record-2', 'record-3']
});
```

## 🔐 权限控制

删除操作需要 `record|delete` 权限：

```go
// 后端权限检查
err := s.checkPermission(
    ctx, 
    userID, 
    tableID, 
    permission.ActionRecordDelete
)
```

## 📊 数据流

### 删除流程

```
1. 用户选择记录
   ↓
2. 点击删除按钮
   ↓
3. 显示确认对话框
   ↓
4. 确认删除
   ↓
5. 乐观更新UI（立即从本地数据中移除）
   ↓
6. 调用后端 API
   ↓
7. 后端权限检查
   ↓
8. 软删除记录
   ↓
9. 记录变更追踪
   ↓
10. 创建版本历史
    ↓
11. 返回成功
    ↓
12. 显示成功提示
```

### 错误回滚

如果 API 调用失败，会自动回滚本地数据：

```typescript
try {
  // 乐观更新
  setData(newData);
  
  // API 调用
  await deleteRecords(recordIds);
} catch (error) {
  // 回滚
  setData(originalData);
  showError(error);
}
```

## 🎨 UI/UX 特性

1. **加载状态** - 删除时显示"删除中..."
2. **禁用状态** - 未选中时禁用删除按钮
3. **确认对话框** - 防止误删除
4. **Toast 通知** - 成功/失败提示
5. **实时更新** - 乐观更新提升体验

## 📝 注意事项

1. **软删除** - 后端使用软删除，记录不会真正删除
2. **权限检查** - 每条记录都会检查权限
3. **批量操作** - 逐条删除以保持完整的追踪记录
4. **错误处理** - 失败时会回滚本地状态
5. **版本历史** - 删除操作会记录在版本历史中

## 🔗 参考

- teable-develop 删除实现: `/apps/nextjs-app/src/features/app/blocks/view/grid/hooks/useSelectionOperation.ts`
- 后端删除服务: `/server/internal/application/record_service.go`
- 前端 Hook: `/src/hooks/useDeleteRecords.ts`
- 确认对话框: `/src/components/DeleteConfirmDialog.tsx`

## 🚀 下一步

- [ ] 添加撤销删除功能
- [ ] 支持拖拽删除
- [ ] 批量操作进度提示
- [ ] 删除统计和报告

