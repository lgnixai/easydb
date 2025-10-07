import { useState } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { CellType } from '../../renderers/cell-renderer/interface';

export interface IFieldType {
  type: CellType;
  name: string;
  description: string;
  icon: string;
}

export interface IFieldTypeSelectorRef {
  show: (position: { x: number; y: number }) => void;
  hide: () => void;
}

export interface IFieldTypeSelectorProps {
  onSelect?: (fieldType: IFieldType) => void;
  onCancel?: () => void;
}

// 支持的字段类型配置
const FIELD_TYPES: IFieldType[] = [
  {
    type: CellType.Text,
    name: '文本',
    description: '单行文本输入',
    icon: 'A',
  },
  {
    type: CellType.Link,
    name: '链接',
    description: '网址链接',
    icon: '🔗',
  },
  {
    type: CellType.Number,
    name: '数字',
    description: '数值输入',
    icon: '#',
  },
  {
    type: CellType.Select,
    name: '选择',
    description: '下拉选择',
    icon: '▼',
  },
  {
    type: CellType.Date,
    name: '日期',
    description: '日期选择',
    icon: '📅',
  },
  {
    type: CellType.User,
    name: '用户',
    description: '用户选择',
    icon: '👤',
  },
  {
    type: CellType.Attachment,
    name: '附件',
    description: '文件上传',
    icon: '📎',
  },
  {
    type: CellType.Chart,
    name: '图表',
    description: '图表数据',
    icon: '📊',
  },
  {
    type: CellType.Boolean,
    name: '布尔',
    description: '是/否选择',
    icon: '☑️',
  },
  {
    type: CellType.Rating,
    name: '评分',
    description: '星级评分',
    icon: '⭐',
  },
];

const FieldTypeSelectorBase: ForwardRefRenderFunction<
  IFieldTypeSelectorRef,
  IFieldTypeSelectorProps
> = (props, ref) => {
  const { onSelect, onCancel } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    show: (pos: { x: number; y: number }) => {
      setPosition(pos);
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
    },
  }));

  const handleSelect = (fieldType: IFieldType) => {
    onSelect?.(fieldType);
    setIsVisible(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-64"
      style={{
        left: position.x,
        top: position.y,
        maxHeight: '400px',
        overflowY: 'auto',
      }}
    >
      <div className="text-sm font-medium text-gray-700 mb-2 px-2">选择字段类型</div>
      
      <div className="space-y-1">
        {FIELD_TYPES.map((fieldType) => (
          <button
            key={fieldType.type}
            className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
            onClick={() => handleSelect(fieldType)}
          >
            <span className="text-lg mr-3 w-6 text-center">{fieldType.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{fieldType.name}</div>
              <div className="text-xs text-gray-500">{fieldType.description}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="border-t border-gray-200 mt-2 pt-2">
        <button
          className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
          onClick={handleCancel}
        >
          取消
        </button>
      </div>
    </div>
  );
};

export const FieldTypeSelector = forwardRef(FieldTypeSelectorBase);
