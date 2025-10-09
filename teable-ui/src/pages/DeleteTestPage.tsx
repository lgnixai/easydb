import React, { useState, useEffect } from 'react';
import { AdvancedGlideGrid } from '@/components/AdvancedGlideGrid';
import teable, { ensureLogin } from '@/lib/teable-simple';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface TestRecord {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  progress: number;
  tags: string[];
  rating: number;
  lastActive: Date;
  customData: any;
}

/**
 * 删除功能测试页面
 * 验证前后端集成
 */
export const DeleteTestPage: React.FC = () => {
  const [tableId, setTableId] = useState<string>('');
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化并创建测试表
  const initializeTestTable = async () => {
    setLoading(true);
    setError(null);

    try {
      await ensureLogin();

      // 这里假设你有一个测试表ID，或者创建一个新表
      // 为了测试，我们使用固定的表ID
      const testTableId = 'test-delete-table-001';
      setTableId(testTableId);

      // 加载记录
      await loadRecords(testTableId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载记录
  const loadRecords = async (tid: string) => {
    try {
      const result = await teable.listRecords({ table_id: tid, limit: 100 });
      
      // 转换为测试格式
      const testRecords: TestRecord[] = result.data.map((record: any) => ({
        id: record.id,
        name: record.name || '未知',
        avatar: record.avatar || '👤',
        status: record.status || 'offline',
        progress: record.progress || 0,
        tags: record.tags || [],
        rating: record.rating || 0,
        lastActive: record.lastActive ? new Date(record.lastActive) : new Date(),
        customData: record.customData || {},
      }));

      setRecords(testRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载记录失败');
    }
  };

  // 处理数据变更
  const handleDataChange = (newData: TestRecord[]) => {
    setRecords(newData);
  };

  // 刷新数据
  const refreshData = () => {
    if (tableId) {
      loadRecords(tableId);
    }
  };

  useEffect(() => {
    initializeTestTable();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>删除功能测试页面</CardTitle>
          <CardDescription>
            测试前后端集成的删除记录功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm">
              <span className="font-medium">表ID:</span> {tableId || '未初始化'}
            </div>
            <div className="text-sm">
              <span className="font-medium">记录数:</span> {records.length}
            </div>
            <Button onClick={refreshData} disabled={!tableId || loading}>
              刷新数据
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">操作说明：</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>在表格中选择一行或多行记录（点击行即可选中）</li>
                <li>点击"删除选中"按钮</li>
                <li>确认删除对话框</li>
                <li>观察记录是否成功删除</li>
                <li>点击"刷新数据"验证后端数据是否已删除</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {tableId && !loading && (
        <AdvancedGlideGrid
          tableId={tableId}
          initialData={records}
          onDataChange={handleDataChange}
        />
      )}
    </div>
  );
};

