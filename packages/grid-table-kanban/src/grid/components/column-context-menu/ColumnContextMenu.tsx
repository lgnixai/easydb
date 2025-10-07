import { useState } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef, useImperativeHandle } from 'react';

export interface IColumnContextMenuRef {
  show: (position: { x: number; y: number }, columnIndex: number) => void;
  hide: () => void;
}

export interface IColumnContextMenuProps {
  onEditField?: (columnIndex: number) => void;
  onDuplicateField?: (columnIndex: number) => void;
  onInsertFieldLeft?: (columnIndex: number) => void;
  onInsertFieldRight?: (columnIndex: number) => void;
  onFilterByField?: (columnIndex: number) => void;
  onSortByField?: (columnIndex: number) => void;
  onGroupByField?: (columnIndex: number) => void;
  onFreezeToField?: (columnIndex: number) => void;
  onHideField?: (columnIndex: number) => void;
  onDeleteField?: (columnIndex: number) => void;
}

const ColumnContextMenuBase: ForwardRefRenderFunction<
  IColumnContextMenuRef,
  IColumnContextMenuProps
> = (props, ref) => {
  const {
    onEditField,
    onDuplicateField,
    onInsertFieldLeft,
    onInsertFieldRight,
    onFilterByField,
    onSortByField,
    onGroupByField,
    onFreezeToField,
    onHideField,
    onDeleteField,
  } = props;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [columnIndex, setColumnIndex] = useState(-1);

  useImperativeHandle(ref, () => ({
    show: (pos: { x: number; y: number }, colIndex: number) => {
      setPosition(pos);
      setColumnIndex(colIndex);
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
      setColumnIndex(-1);
    },
  }));

  const handleAction = (action: () => void) => {
    action();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const menuItems = [
    {
      label: '编辑字段',
      icon: '✓',
      onClick: () => handleAction(() => onEditField?.(columnIndex)),
    },
    {
      label: '复制字段',
      icon: '□',
      onClick: () => handleAction(() => onDuplicateField?.(columnIndex)),
    },
    {
      label: '← 在左侧插入字段',
      icon: '←',
      onClick: () => handleAction(() => onInsertFieldLeft?.(columnIndex)),
    },
    {
      label: '→ 在右侧插入字段',
      icon: '→',
      onClick: () => handleAction(() => onInsertFieldRight?.(columnIndex)),
    },
    {
      label: '按此字段筛选',
      icon: '🔍',
      onClick: () => handleAction(() => onFilterByField?.(columnIndex)),
    },
    {
      label: '↓↑ 按此字段排序',
      icon: '↓↑',
      onClick: () => handleAction(() => onSortByField?.(columnIndex)),
    },
    {
      label: '按此字段分组',
      icon: '≡',
      onClick: () => handleAction(() => onGroupByField?.(columnIndex)),
    },
    {
      label: '冻结至此字段',
      icon: '⊞',
      onClick: () => handleAction(() => onFreezeToField?.(columnIndex)),
    },
    {
      label: '隐藏字段',
      icon: '👁',
      onClick: () => handleAction(() => onHideField?.(columnIndex)),
    },
    {
      label: '删除字段',
      icon: '🗑',
      onClick: () => handleAction(() => onDeleteField?.(columnIndex)),
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
            item.className || 'text-gray-700'
          }`}
          onClick={item.onClick}
        >
          <span className="mr-3 w-4 text-center">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
};

export const ColumnContextMenu = forwardRef(ColumnContextMenuBase);
