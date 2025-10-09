import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  DataEditor, 
  GridCellKind, 
  GridColumn, 
  Item, 
  GridCell, 
  EditableGridCell,
  CompactSelection,
  type DataEditorRef
} from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useDeleteRecords } from '@/hooks/useDeleteRecords';

// 高级数据类型
interface AdvancedDataRow {
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

// 示例数据
const advancedSampleData: AdvancedDataRow[] = [
  {
    id: '1',
    name: '张三',
    avatar: '👨‍💻',
    status: 'online',
    progress: 75,
    tags: ['React', 'TypeScript'],
    rating: 4.5,
    lastActive: new Date('2024-01-15'),
    customData: { department: 'Engineering', level: 'Senior' }
  },
  {
    id: '2',
    name: '李四',
    avatar: '👩‍🎨',
    status: 'away',
    progress: 60,
    tags: ['Design', 'UI/UX'],
    rating: 4.2,
    lastActive: new Date('2024-01-14'),
    customData: { department: 'Design', level: 'Mid' }
  },
  {
    id: '3',
    name: '王五',
    avatar: '👨‍💼',
    status: 'offline',
    progress: 90,
    tags: ['Management', 'Strategy'],
    rating: 4.8,
    lastActive: new Date('2024-01-13'),
    customData: { department: 'Management', level: 'Director' }
  }
];

export interface AdvancedGlideGridProps {
  tableId?: string;
  initialData?: AdvancedDataRow[];
  onDataChange?: (data: AdvancedDataRow[]) => void;
}

export const AdvancedGlideGrid: React.FC<AdvancedGlideGridProps> = ({ 
  tableId = 'demo', 
  initialData,
  onDataChange 
}) => {
  const [data, setData] = useState<AdvancedDataRow[]>(initialData || advancedSampleData);
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<CompactSelection>(CompactSelection.empty());
  const dataEditorRef = useRef<DataEditorRef>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 排序状态
  const [sortBy, setSortBy] = useState<{ id: string | null; dir: 'asc' | 'desc' } | null>(null);

  // 删除记录Hook
  const { deleteRecords, isDeleting } = useDeleteRecords({
    tableId,
    showConfirm: false, // 使用自定义对话框
    onSuccess: () => {
      // 删除成功后，从本地数据中移除
      const selectedIndices = Array.from(selectedRows);
      const updatedData = data.filter((_, index) => !selectedIndices.includes(index));
      setData(updatedData);
      setSelectedRows(CompactSelection.empty());
      onDataChange?.(updatedData);
    },
  });

  // 高级列定义（可变状态，支持列宽调整）
  const [columns, setColumns] = useState<GridColumn[]>([
    {
      title: 'ID',
      id: 'id',
      width: 60,
    },
    {
      title: '头像',
      id: 'avatar',
      width: 80,
    },
    {
      title: '姓名',
      id: 'name',
      width: 120,
    },
    {
      title: '状态',
      id: 'status',
      width: 100,
    },
    {
      title: '进度',
      id: 'progress',
      width: 120,
    },
    {
      title: '标签',
      id: 'tags',
      width: 200,
    },
    {
      title: '评分',
      id: 'rating',
      width: 100,
    },
    {
      title: '最后活跃',
      id: 'lastActive',
      width: 150,
    }
  ]);

  // 过滤数据
  const filteredData = useMemo(() => {
    if (!searchText) return data;
    
    return data.filter(row => 
      row.name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
    );
  }, [data, searchText]);

  const displayedData = useMemo(() => {
    if (!sortBy || !sortBy.id) return filteredData;
    const dir = sortBy.dir === 'asc' ? 1 : -1;
    const id = sortBy.id;
    const sorted = [...filteredData].sort((a, b) => {
      const av = (a as any)[id];
      const bv = (b as any)[id];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * dir;
      if (bv == null) return 1 * dir;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      const as = av instanceof Date ? av.getTime() : String(av).toLowerCase();
      const bs = bv instanceof Date ? bv.getTime() : String(bv).toLowerCase();
      if (typeof as === 'number' && typeof bs === 'number') return (as - bs) * dir;
      return String(as).localeCompare(String(bs)) * dir;
    });
    return sorted;
  }, [filteredData, sortBy]);

  // 获取单元格内容
  const getCellContent = useCallback((cell: Item): GridCell => {
    const [col, row] = cell;
    const dataRow = displayedData[row];
    
    if (!dataRow) {
      return {
        kind: GridCellKind.Loading,
        allowOverlay: false,
      };
    }

    const columnId = columns[col]?.id;
    
    switch (columnId) {
      case 'id':
        return {
          kind: GridCellKind.Text,
          data: dataRow.id,
          displayData: dataRow.id,
          allowOverlay: false,
          readonly: true,
        };
      
      case 'avatar':
        return {
          kind: GridCellKind.Text,
          data: dataRow.avatar,
          displayData: dataRow.avatar,
          allowOverlay: false,
          readonly: true,
        };
      
      case 'name':
        return {
          kind: GridCellKind.Text,
          data: dataRow.name,
          displayData: dataRow.name,
          allowOverlay: true,
        };
      
      case 'status':
        return {
          kind: GridCellKind.Text,
          data: dataRow.status,
          displayData: dataRow.status,
          allowOverlay: true,
        };
      
      case 'progress':
        return {
          kind: GridCellKind.Number,
          data: dataRow.progress,
          displayData: `${dataRow.progress}%`,
          allowOverlay: true,
        };
      
      case 'tags':
        return {
          kind: GridCellKind.Text,
          data: dataRow.tags.join(', '),
          displayData: dataRow.tags.join(', '),
          allowOverlay: true,
        };
      
      case 'rating':
        return {
          kind: GridCellKind.Number,
          data: dataRow.rating,
          displayData: dataRow.rating.toString(),
          allowOverlay: true,
        };
      
      case 'lastActive':
        return {
          kind: GridCellKind.Text,
          data: dataRow.lastActive.toLocaleDateString(),
          displayData: dataRow.lastActive.toLocaleDateString(),
          allowOverlay: true,
        };
      
      default:
        return {
          kind: GridCellKind.Text,
          data: '',
          displayData: '',
          allowOverlay: false,
        };
    }
  }, [displayedData, columns]);

  // 单元格编辑处理
  const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
    const [col, row] = cell;
    const columnId = columns[col]?.id;
    
    if (!columnId) return;

    setData(prevData => {
      const newData = [...prevData];
      const originalRowIndex = data.findIndex(d => d.id === filteredData[row].id);
      
      if (originalRowIndex === -1) return prevData;
      
      const updatedRow = { ...newData[originalRowIndex] };
      
      switch (columnId) {
        case 'name':
          if (newValue.kind === GridCellKind.Text) {
            updatedRow.name = newValue.data;
          }
          break;
        
        case 'rating':
          if (newValue.kind === GridCellKind.Number) {
            updatedRow.rating = newValue.data;
          }
          break;
      }
      
      newData[originalRowIndex] = updatedRow;
      return newData;
    });
  }, [columns, data, filteredData]);

  // 行选择处理
  const onGridSelectionChange = useCallback((newSelection: any) => {
    if (newSelection?.rows) {
      setSelectedRows(newSelection.rows);
    }
  }, []);

  // 拖拽处理 - 暂时禁用
  // const onDragStart = useCallback((event: React.DragEvent) => {
  //   if (selectedRows.length > 0) {
  //     const selectedData = Array.from(selectedRows).map(index => filteredData[index]);
  //     event.dataTransfer.setData('application/json', JSON.stringify(selectedData));
  //   }
  // }, [selectedRows, filteredData]);

  // 搜索功能
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  // 添加新行
  const addNewRow = useCallback(() => {
    const newRow: AdvancedDataRow = {
      id: (data.length + 1).toString(),
      name: '新用户',
      avatar: '👤',
      status: 'offline',
      progress: 0,
      tags: [],
      rating: 0,
      lastActive: new Date(),
      customData: {}
    };
    
    setData(prev => [...prev, newRow]);
  }, [data.length]);

  // 列宽调整
  const onColumnResize = useCallback((column: GridColumn, newSize: number, colIndex: number) => {
    setColumns(prev => prev.map((c, i) => i === colIndex ? { ...c, width: newSize } : c));
  }, []);

  // 点击表头排序
  const onHeaderClicked = useCallback((colIndex: number) => {
    const col = columns[colIndex];
    if (!col) return;
    setSortBy(prev => {
      if (!prev || prev.id !== col.id) return { id: col.id, dir: 'asc' };
      return { id: col.id, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  }, [columns]);

  // 处理删除确认
  const handleDeleteConfirm = useCallback(async () => {
    const selectedIndices = Array.from(selectedRows);
    const recordIdsToDelete = selectedIndices.map(index => data[index].id);
    
    if (recordIdsToDelete.length > 0) {
      await deleteRecords(recordIdsToDelete);
    }
  }, [selectedRows, data, deleteRecords]);

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Glide Data Grid 高级功能示例</h2>
        <p className="text-gray-600 mb-4">
          展示自定义单元格、拖拽、搜索、行选择等高级功能
        </p>
        
        {/* 控制面板 */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">搜索:</label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索姓名或标签..."
                className="px-3 py-1 border rounded-md"
              />
            </div>
            
            <button
              onClick={addNewRow}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              添加新行
            </button>

            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={selectedRows.length === 0 || isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isDeleting ? '删除中...' : `删除选中 (${selectedRows.length})`}
            </button>
            
            <div className="text-sm text-gray-600">
              已选择 {selectedRows.length} 行
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>功能说明：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>状态列：显示在线状态指示器</li>
              <li>进度列：可视化进度条</li>
              <li>标签列：多标签显示</li>
              <li>支持行选择和拖拽</li>
              <li>实时搜索过滤</li>
            </ul>
          </div>
        </div>
      </div>

      <div 
        className="border rounded-lg overflow-hidden" 
        style={{ height: '600px' }}
      >
        <DataEditor
          ref={dataEditorRef}
          getCellContent={getCellContent}
          columns={columns}
          rows={displayedData.length}
          
          // 编辑功能
          onCellEdited={onCellEdited}
          onCellActivated={(cell: Item) => {
            console.log('Cell activated:', cell);
          }}
          
          // 行选择
          rowSelect="multi"
          onGridSelectionChange={onGridSelectionChange}
          
          // 列宽调整 & 表头点击排序
          onColumnResize={onColumnResize}
          onHeaderClicked={onHeaderClicked}
          
          // 主题配置
          theme={{
            accentColor: "#0ea5e9",
            accentFg: "#ffffff",
            accentLight: "#e0f2fe",
            textDark: "#1f2937",
            textMedium: "#6b7280",
            textLight: "#9ca3af",
            textBubble: "#ffffff",
            bgIconHeader: "#6b7280",
            fgIconHeader: "#ffffff",
            textHeader: "#374151",
            textHeaderSelected: "#1f2937",
            bgCell: "#ffffff",
            bgCellMedium: "#f9fafb",
            bgHeader: "#f3f4f6",
            bgHeaderHasFocus: "#e5e7eb",
            bgHeaderHovered: "#e5e7eb",
            bgBubble: "#1f2937",
            bgBubbleSelected: "#111827",
            bgSearchResult: "#fef3c7",
            borderColor: "#e5e7eb",
            drilldownBorder: "#d1d5db",
            linkColor: "#0ea5e9",
            headerFontStyle: "600 14px",
            baseFontStyle: "14px",
            fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
          }}
          
          // 其他配置
          smoothScrollX={true}
          smoothScrollY={true}
          overscrollX={0}
          overscrollY={0}
          gridSelection={{
            columns: CompactSelection.empty(),
            rows: selectedRows,
          }}
        />
      </div>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        count={selectedRows.length}
      />
    </div>
  );
};
