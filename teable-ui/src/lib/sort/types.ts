/**
 * Sort 类型定义
 * 
 * 支持多字段排序
 */

// 排序方向
export enum SortOrder {
  Asc = 'asc',   // 升序
  Desc = 'desc', // 降序
}

// 单个排序项
export interface ISortItem {
  fieldId: string
  order: SortOrder
}

// 排序配置
export interface ISort {
  sorts: ISortItem[]
  manualSort?: boolean  // 是否手动排序
}

// 排序选项显示
export const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  [SortOrder.Asc]: '升序 ↑',
  [SortOrder.Desc]: '降序 ↓',
}

