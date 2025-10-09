import { useCallback, useState } from 'react';
import teable, { ensureLogin } from '@/lib/teable-simple';
import { useToast } from './use-toast';

export interface DeleteRecordsOptions {
  tableId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  confirmMessage?: string;
  showConfirm?: boolean;
}

export interface DeleteRecordsResult {
  deleteRecords: (recordIds: string[]) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
  isDeleting: boolean;
  error: Error | null;
}

/**
 * 统一的删除记录Hook
 * 参考 teable-develop 的实现模式
 */
export function useDeleteRecords(options: DeleteRecordsOptions): DeleteRecordsResult {
  const { tableId, onSuccess, onError, confirmMessage, showConfirm = true } = options;
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const deleteRecords = useCallback(
    async (recordIds: string[]) => {
      if (recordIds.length === 0) {
        return;
      }

      // 确认对话框
      if (showConfirm) {
        const message =
          confirmMessage ||
          `确定要删除 ${recordIds.length} 条记录吗？此操作可能无法撤销。`;
        if (!window.confirm(message)) {
          return;
        }
      }

      setIsDeleting(true);
      setError(null);

      try {
        await ensureLogin();

        // 如果只有一条记录，使用单条删除API
        if (recordIds.length === 1) {
          await teable.deleteRecord({ table_id: tableId, record_id: recordIds[0] });
        } else {
          // 批量删除
          await teable.deleteRecords({ table_id: tableId, record_ids: recordIds });
        }

        toast({
          title: '删除成功',
          description: `成功删除 ${recordIds.length} 条记录`,
        });

        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('删除失败');
        setError(error);
        
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive',
        });

        onError?.(error);
      } finally {
        setIsDeleting(false);
      }
    },
    [tableId, confirmMessage, showConfirm, onSuccess, onError, toast]
  );

  const deleteRecord = useCallback(
    async (recordId: string) => {
      await deleteRecords([recordId]);
    },
    [deleteRecords]
  );

  return {
    deleteRecords,
    deleteRecord,
    isDeleting,
    error,
  };
}

