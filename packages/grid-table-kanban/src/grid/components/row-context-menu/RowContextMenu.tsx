import { useState } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef, useImperativeHandle } from 'react';

export interface IRowContextMenuRef {
  show: (position: { x: number; y: number }, rowIndex: number) => void;
  hide: () => void;
}

export interface IRowContextMenuProps {
  onDeleteRow?: (rowIndex: number) => void;
}

const RowContextMenuBase: ForwardRefRenderFunction<IRowContextMenuRef, IRowContextMenuProps> = (props, ref) => {
  const { onDeleteRow } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rowIndex, setRowIndex] = useState(-1);

  useImperativeHandle(ref, () => ({
    show: (pos: { x: number; y: number }, rIndex: number) => {
      setPosition(pos);
      setRowIndex(rIndex);
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
      setRowIndex(-1);
    },
  }));

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40"
      style={{ left: position.x, top: position.y }}
    >
      <button
        className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm text-red-600"
        onClick={() => {
          onDeleteRow?.(rowIndex);
          setIsVisible(false);
        }}
      >
        <span className="mr-3 w-4 text-center">🗑</span>
        删除记录
      </button>
    </div>
  );
};

export const RowContextMenu = forwardRef(RowContextMenuBase);



