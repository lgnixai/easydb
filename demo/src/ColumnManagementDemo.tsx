import { useState, useRef } from 'react';
import { ColumnManagement, FieldTypeSelector, ColumnContextMenu, FieldPropertyEditor } from '../../packages/grid-table-kanban/src/grid/components';
import type { IGridColumn } from '../../packages/grid-table-kanban/src/grid/interface';
import type { IFieldType } from '../../packages/grid-table-kanban/src/grid/components/field-type-selector/FieldTypeSelector';
import type { IColumnManagementRef } from '../../packages/grid-table-kanban/src/grid/components/column-management/ColumnManagement';

export default function ColumnManagementDemo() {
  const [columns, setColumns] = useState<IGridColumn[]>([
    { id: 'col1', name: '标题', width: 180, isPrimary: true },
    { id: 'col2', name: '计数', width: 120 },
    { id: 'col3', name: '状态', width: 140 },
  ]);

  const columnManagementRef = useRef<IColumnManagementRef>(null);

  const handleAddColumn = (fieldType: IFieldType, insertIndex?: number) => {
    const newColumn: IGridColumn = {
      id: `col-${Date.now()}`,
      name: fieldType.name,
      width: 160,
      description: fieldType.description,
      icon: fieldType.icon,
    };

    if (insertIndex !== undefined) {
      setColumns((cols) => {
        const newCols = [...cols];
        newCols.splice(insertIndex, 0, newColumn);
        return newCols;
      });
    } else {
      setColumns((cols) => [...cols, newColumn]);
    }
  };

  const handleEditColumn = (columnIndex: number, updatedColumn: IGridColumn) => {
    setColumns((cols) =>
      cols.map((col, index) =>
        index === columnIndex ? { ...col, ...updatedColumn } : col
      )
    );
  };

  const handleDuplicateColumn = (columnIndex: number) => {
    const columnToDuplicate = columns[columnIndex];
    if (columnToDuplicate) {
      const duplicatedColumn = {
        ...columnToDuplicate,
        id: `col-${Date.now()}`,
        name: `${columnToDuplicate.name} (副本)`,
      };
      setColumns((cols) => {
        const newCols = [...cols];
        newCols.splice(columnIndex + 1, 0, duplicatedColumn);
        return newCols;
      });
    }
  };

  const handleDeleteColumn = (columnIndex: number) => {
    setColumns((cols) => cols.filter((_, index) => index !== columnIndex));
  };

  const showFieldTypeSelector = () => {
    // 在屏幕中央显示字段类型选择器
    columnManagementRef.current?.showFieldTypeSelector({
      x: window.innerWidth / 2 - 150,
      y: window.innerHeight / 2 - 200,
    });
  };

  const showColumnContextMenu = () => {
    // 在屏幕中央显示列右键菜单
    columnManagementRef.current?.showColumnContextMenu(
      {
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 150,
      },
      0 // 第一列
    );
  };

  const showFieldPropertyEditor = () => {
    // 显示字段属性编辑器
    if (columns[0]) {
      columnManagementRef.current?.showFieldPropertyEditor(columns[0], 0);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">列管理功能演示</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">当前列配置</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            {columns.map((column, index) => (
              <div key={column.id} className="bg-white p-3 rounded border">
                <div className="font-medium">{column.name}</div>
                <div className="text-sm text-gray-500">宽度: {column.width}px</div>
                {column.description && (
                  <div className="text-sm text-gray-500">{column.description}</div>
                )}
                {column.isPrimary && (
                  <div className="text-xs text-blue-600">主字段</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">功能测试</h2>
        <div className="flex space-x-4">
          <button
            onClick={showFieldTypeSelector}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            显示字段类型选择器
          </button>
          <button
            onClick={showColumnContextMenu}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            显示列右键菜单
          </button>
          <button
            onClick={showFieldPropertyEditor}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            显示字段属性编辑器
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">快速操作</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleAddColumn({ type: 'Text', name: '新文本列', description: '文本输入', icon: 'A' })}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            添加文本列
          </button>
          <button
            onClick={() => handleAddColumn({ type: 'Number', name: '新数字列', description: '数字输入', icon: '#' })}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            添加数字列
          </button>
          <button
            onClick={() => handleDuplicateColumn(0)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            复制第一列
          </button>
          <button
            onClick={() => handleDeleteColumn(columns.length - 1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            删除最后一列
          </button>
        </div>
      </div>

      <ColumnManagement
        ref={columnManagementRef}
        columns={columns}
        onAddColumn={handleAddColumn}
        onEditColumn={handleEditColumn}
        onDuplicateColumn={handleDuplicateColumn}
        onDeleteColumn={handleDeleteColumn}
      />
    </div>
  );
}
