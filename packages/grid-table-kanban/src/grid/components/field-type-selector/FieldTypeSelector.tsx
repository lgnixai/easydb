import { useMemo, useState } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { CellType } from '../../renderers/cell-renderer/interface';

export interface IFieldType {
  type: CellType;
  name: string;
  description: string;
  icon: string;
  // 旧系统字段类型（用于对齐显示与后续接入），例如 singleLineText、link 等
  legacyType?: string;
}

export interface IFieldTypeSelectorRef {
  show: (position: { x: number; y: number }) => void;
  hide: () => void;
}

export interface IFieldTypeSelectorProps {
  onSelect?: (fieldType: IFieldType) => void;
  onCancel?: () => void;
  currentType?: CellType;
  onHoverStateChange?: (hovered: boolean) => void;
}

// 对齐旧系统 FieldType 的顺序与命名（映射到当前可支持的 CellType）
export const FIELD_TYPES: IFieldType[] = [
  { legacyType: 'singleLineText', type: CellType.Text, name: '单行文本', description: '输入简短文本', icon: 'A' },
  { legacyType: 'longText', type: CellType.Text, name: '长文本', description: '多行文本', icon: '📝' },
  { legacyType: 'number', type: CellType.Number, name: '数字', description: '数值输入', icon: '#' },
  { legacyType: 'singleSelect', type: CellType.Select, name: '单选', description: '下拉单选', icon: '◯' },
  { legacyType: 'multipleSelect', type: CellType.Select, name: '多选', description: '多项选择', icon: '☑️' },
  { legacyType: 'user', type: CellType.User, name: '用户', description: '成员选择', icon: '👤' },
  { legacyType: 'date', type: CellType.Date, name: '日期', description: '日期/时间', icon: '📅' },
  { legacyType: 'rating', type: CellType.Rating, name: '评分', description: '星级评分', icon: '⭐' },
  { legacyType: 'checkbox', type: CellType.Boolean, name: '勾选', description: '是/否', icon: '✔︎' },
  { legacyType: 'attachment', type: CellType.Attachment, name: '附件', description: '文件上传', icon: '📎' },
  { legacyType: 'formula', type: CellType.Text, name: '公式', description: '根据公式计算', icon: 'ƒ' },
  { legacyType: 'link', type: CellType.Link, name: '关联', description: '与其他表建立关联', icon: '🔗' },
  { legacyType: 'rollup', type: CellType.Text, name: '汇总', description: '对关联结果汇总', icon: 'Σ' },
  { legacyType: 'createdTime', type: CellType.Date, name: '创建时间', description: '记录创建时间', icon: '🕒' },
  { legacyType: 'lastModifiedTime', type: CellType.Date, name: '修改时间', description: '记录上次修改', icon: '🕘' },
  { legacyType: 'createdBy', type: CellType.User, name: '创建人', description: '记录创建者', icon: '👤' },
  { legacyType: 'lastModifiedBy', type: CellType.User, name: '修改人', description: '记录最后修改者', icon: '👥' },
  { legacyType: 'autoNumber', type: CellType.Number, name: '自增数字', description: '自动递增编号', icon: '№' },
  { legacyType: 'button', type: CellType.Button, name: '按钮', description: '点击触发动作', icon: '⏺' },
];

const FieldTypeSelectorBase: ForwardRefRenderFunction<
  IFieldTypeSelectorRef,
  IFieldTypeSelectorProps
> = (props, ref) => {
  const { onSelect, onCancel, currentType, onHoverStateChange } = props;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [keyword, setKeyword] = useState('');

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

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return FIELD_TYPES;
    return FIELD_TYPES.filter(ft =>
      ft.name.toLowerCase().includes(k) || ft.legacyType?.toLowerCase().includes(k)
    );
  }, [keyword]);

  // 双列视图：直接对 filtered 进行双列网格展示（更贴近原版）

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl min-w-[640px]"
      style={{ left: position.x, top: position.y, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      onMouseEnter={() => onHoverStateChange?.(true)}
      onMouseLeave={() => onHoverStateChange?.(false)}
    >
      <div className="sticky top-0 z-10 bg-white px-4 pt-3 pb-2 border-b border-gray-100 rounded-t-xl">
        <div className="text-sm font-medium text-gray-700 mb-2">字段类型</div>
        <div className="relative">
          <input
            className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="px-3 pb-3 max-h-[calc(100vh-180px)] overflow-y-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {filtered.map((fieldType) => (
            <button
              key={fieldType.legacyType ?? fieldType.type}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors w-full ${currentType === fieldType.type ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => handleSelect(fieldType)}
            >
              <span className="text-lg w-6 text-center">{fieldType.icon}</span>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-gray-900">{fieldType.name}</div>
                <div className="text-[12px] text-gray-500">{fieldType.description}</div>
              </div>
              {currentType === fieldType.type && <span className="text-blue-600 text-sm">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 py-2 border-t border-gray-100 rounded-b-xl">
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
