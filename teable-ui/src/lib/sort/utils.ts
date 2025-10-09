/**
 * Sort 工具函数
 */

import type { ISort, ISortItem, SortOrder } from './types'

/**
 * 应用排序到数据
 */
export function applySort<T extends Record<string, any>>(
  data: T[],
  sort: ISort | null,
  getFieldValue: (record: T, fieldId: string) => any
): T[] {
  if (!sort || !sort.sorts.length || sort.manualSort) {
    return data
  }

  // 创建副本避免修改原数组
  const sortedData = [...data]

  sortedData.sort((a, b) => {
    // 按照排序项顺序依次比较
    for (const sortItem of sort.sorts) {
      const aValue = getFieldValue(a, sortItem.fieldId)
      const bValue = getFieldValue(b, sortItem.fieldId)
      
      const compareResult = compareValues(aValue, bValue, sortItem.order)
      
      // 如果不相等，返回比较结果
      if (compareResult !== 0) {
        return compareResult
      }
      
      // 如果相等，继续比较下一个排序项
    }
    
    return 0
  })

  return sortedData
}

/**
 * 比较两个值
 */
function compareValues(a: any, b: any, order: SortOrder): number {
  // 处理 null/undefined
  const aIsEmpty = a === null || a === undefined || a === ''
  const bIsEmpty = b === null || b === undefined || b === ''

  if (aIsEmpty && bIsEmpty) return 0
  if (aIsEmpty) return order === 'asc' ? 1 : -1
  if (bIsEmpty) return order === 'asc' ? -1 : 1

  // 数字比较
  if (typeof a === 'number' && typeof b === 'number') {
    return order === 'asc' ? a - b : b - a
  }

  // 日期比较
  if (a instanceof Date && b instanceof Date) {
    const diff = a.getTime() - b.getTime()
    return order === 'asc' ? diff : -diff
  }

  // 尝试日期字符串比较
  const aDate = new Date(a)
  const bDate = new Date(b)
  if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
    const diff = aDate.getTime() - bDate.getTime()
    return order === 'asc' ? diff : -diff
  }

  // 字符串比较（默认）
  const aStr = String(a).toLowerCase()
  const bStr = String(b).toLowerCase()
  
  if (order === 'asc') {
    return aStr.localeCompare(bStr, 'zh-CN')
  } else {
    return bStr.localeCompare(aStr, 'zh-CN')
  }
}

/**
 * 创建空的排序配置
 */
export function createEmptySort(): ISort {
  return {
    sorts: [],
    manualSort: false
  }
}

/**
 * 创建排序项
 */
export function createSortItem(fieldId: string, order: SortOrder = 'asc'): ISortItem {
  return {
    fieldId,
    order
  }
}

/**
 * 排序是否激活（有排序条件）
 */
export function isSortActive(sort: ISort | null): boolean {
  return !!(sort && sort.sorts.length > 0 && !sort.manualSort)
}

/**
 * 获取排序描述文本
 */
export function getSortDescription(sort: ISort | null, fields: Array<{ id: string, name: string }>): string {
  if (!sort || !sort.sorts.length) {
    return '添加排序'
  }

  if (sort.manualSort) {
    return '手动排序'
  }

  const count = sort.sorts.length
  const firstField = fields.find(f => f.id === sort.sorts[0].fieldId)
  
  if (count === 1 && firstField) {
    return `按 ${firstField.name} 排序`
  }
  
  return `${count} 个排序条件`
}

/**
 * 切换字段排序
 * 
 * 如果字段未排序，添加升序
 * 如果字段升序，切换为降序
 * 如果字段降序，移除排序
 */
export function toggleFieldSort(
  sort: ISort | null,
  fieldId: string
): ISort {
  const currentSort = sort || createEmptySort()
  const existingIndex = currentSort.sorts.findIndex(s => s.fieldId === fieldId)

  if (existingIndex === -1) {
    // 未排序，添加升序
    return {
      ...currentSort,
      sorts: [...currentSort.sorts, createSortItem(fieldId, 'asc')],
      manualSort: false
    }
  }

  const existingItem = currentSort.sorts[existingIndex]
  
  if (existingItem.order === 'asc') {
    // 升序切换为降序
    const newSorts = [...currentSort.sorts]
    newSorts[existingIndex] = { ...existingItem, order: 'desc' }
    return {
      ...currentSort,
      sorts: newSorts,
      manualSort: false
    }
  } else {
    // 降序移除
    const newSorts = currentSort.sorts.filter((_, i) => i !== existingIndex)
    return {
      ...currentSort,
      sorts: newSorts,
      manualSort: false
    }
  }
}

/**
 * 获取字段的当前排序状态
 */
export function getFieldSortState(
  sort: ISort | null,
  fieldId: string
): { isSorted: boolean; order: SortOrder | null; index: number } {
  if (!sort || !sort.sorts.length) {
    return { isSorted: false, order: null, index: -1 }
  }

  const index = sort.sorts.findIndex(s => s.fieldId === fieldId)
  
  if (index === -1) {
    return { isSorted: false, order: null, index: -1 }
  }

  return {
    isSorted: true,
    order: sort.sorts[index].order,
    index
  }
}

