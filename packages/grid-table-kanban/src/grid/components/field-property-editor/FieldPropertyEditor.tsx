import { useState, useEffect } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import type { IGridColumn } from '../../interface';
import type { CellType } from '../../renderers/cell-renderer/interface';
import { Input } from '../../../ui';

export interface IFieldPropertyEditorRef {
  show: (column: IGridColumn, columnIndex: number) => void;
  hide: () => void;
}

export interface IFieldPropertyEditorProps {
  onSave?: (columnIndex: number, updatedColumn: IGridColumn) => void;
  onCancel?: () => void;
}

const FieldPropertyEditorBase: ForwardRefRenderFunction<
  IFieldPropertyEditorRef,
  IFieldPropertyEditorProps
> = (props, ref) => {
  const { onSave, onCancel } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [columnIndex, setColumnIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    width: 150,
    description: '',
    icon: '',
    isPrimary: false,
    customTheme: undefined,
  });

  useImperativeHandle(ref, () => ({
    show: (column: IGridColumn, colIndex: number) => {
      setColumnIndex(colIndex);
      setFormData({
        name: column.name || '',
        width: column.width || 150,
        description: column.description || '',
        icon: column.icon || '',
        isPrimary: column.isPrimary || false,
        customTheme: column.customTheme,
      });
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
      setColumnIndex(-1);
    },
  }));

  const handleSave = () => {
    if (columnIndex >= 0) {
      const updatedColumn: IGridColumn = {
        id: `col-${Date.now()}`, // 生成新的ID
        name: formData.name,
        width: formData.width,
        description: formData.description,
        icon: formData.icon,
        isPrimary: formData.isPrimary,
        customTheme: formData.customTheme,
      };
      onSave?.(columnIndex, updatedColumn);
    }
    setIsVisible(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">编辑字段属性</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              字段名称
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入字段名称"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              列宽 (像素)
            </label>
            <Input
              type="number"
              value={formData.width}
              onChange={(e) => setFormData(prev => ({ ...prev, width: parseInt(e.target.value) || 150 }))}
              min="50"
              max="500"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入字段描述"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图标
            </label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="输入图标名称"
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
              设为主字段
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export const FieldPropertyEditor = forwardRef(FieldPropertyEditorBase);
