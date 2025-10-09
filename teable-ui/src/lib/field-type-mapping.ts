// 统一后端类型字符串到前端语义类型字符串（不依赖包内枚举，避免构建差异）
export type FrontFieldType =
  | 'singleLineText'
  | 'longText'
  | 'number'
  | 'singleSelect'
  | 'multipleSelect'
  | 'date'
  | 'user'
  | 'attachment'
  | 'checkbox'
  | 'rating'
  | 'link'
  | 'formula'
  | 'rollup'
  | 'lookup'
  | 'ai'
  | 'autoNumber'
  | 'createdTime'
  | 'lastModifiedTime'
  | 'lastModifiedBy';

export const mapBackendTypeToFieldType = (t: string): FrontFieldType => {
  const key = String(t || '').toLowerCase()
  switch (key) {
    case 'text':
    case 'singlelinetext':
      return 'singleLineText'
    case 'longtext':
      return 'longText'
    case 'number':
      return 'number'
    case 'select':
    case 'singleselect':
      return 'singleSelect'
    case 'multi_select':
    case 'multipleselect':
      return 'multipleSelect'
    case 'date':
    case 'datetime':
    case 'timestamp':
    case 'time':
      return 'date'
    case 'user':
    case 'created_by':
      return 'user'
    case 'attachment':
      return 'attachment'
    case 'checkbox':
      return 'checkbox'
    case 'rating':
      return 'rating'
    case 'link':
      return 'link'
    case 'formula':
      return 'formula'
    case 'rollup':
      return 'rollup'
    case 'lookup':
      return 'lookup'
    case 'ai':
    case 'virtual_ai':
      return 'ai'
    case 'auto_number':
    case 'autonumber':
      return 'autoNumber'
    case 'created_time':
    case 'createdtime':
      return 'createdTime'
    case 'last_modified_time':
    case 'lastmodifiedtime':
      return 'lastModifiedTime'
    case 'last_modified_by':
    case 'lastmodifiedby':
      return 'lastModifiedBy'
    default:
      return 'singleLineText'
  }
}

// 从后端字段数组构建 id->meta 的字典
export interface BackendFieldItem {
  id: string
  name: string
  type: string
  options?: unknown
  is_system?: boolean
  read_only?: boolean
}

export const buildFieldMetaById = (fields: BackendFieldItem[]) => {
  const meta: Record<string, { type: FrontFieldType; options?: unknown; readonly?: boolean }> = {}
  for (const f of fields || []) {
    meta[f.id] = {
      type: mapBackendTypeToFieldType(f.type),
      options: f.options,
      readonly: Boolean(f.is_system) || Boolean(f.read_only) || Boolean(f.is_computed),
    }
  }
  return meta
}


