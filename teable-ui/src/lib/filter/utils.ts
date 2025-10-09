/**
 * Filter 工具函数
 */

import type { IFilter, IFilterItem, FilterOperator } from './types'
import { FilterConjunction, FIELD_TYPE_OPERATORS } from './types'

/**
 * 获取字段类型支持的操作符
 */
export function getOperatorsForFieldType(fieldType: string): FilterOperator[] {
  return FIELD_TYPE_OPERATORS[fieldType] || FIELD_TYPE_OPERATORS.text
}

/**
 * 判断操作符是否需要值输入
 */
export function operatorNeedsValue(operator: FilterOperator): boolean {
  const noValueOperators = ['isEmpty', 'isNotEmpty']
  return !noValueOperators.includes(operator)
}

/**
 * 应用过滤器到数据
 */
export function applyFilter<T extends Record<string, any>>(
  data: T[],
  filter: IFilter | null,
  getFieldValue: (record: T, fieldId: string) => any
): T[] {
  if (!filter || !filter.filterSet.length) {
    return data
  }

  return data.filter(record => {
    const results = filter.filterSet.map(item => 
      evaluateFilterItem(record, item, getFieldValue)
    )

    // 根据连接符合并结果
    if (filter.conjunction === FilterConjunction.And) {
      return results.every(r => r)
    } else {
      return results.some(r => r)
    }
  })
}

/**
 * 评估单个过滤条件
 */
function evaluateFilterItem<T extends Record<string, any>>(
  record: T,
  item: IFilterItem,
  getFieldValue: (record: T, fieldId: string) => any
): boolean {
  const fieldValue = getFieldValue(record, item.fieldId)
  const { operator, value } = item

  // 空值检查
  const isEmpty = fieldValue === null || fieldValue === undefined || fieldValue === ''
  
  switch (operator) {
    case 'isEmpty':
      return isEmpty
    case 'isNotEmpty':
      return !isEmpty
    case 'is':
    case 'equal':
      return fieldValue == value  // 使用 == 允许类型转换
    case 'isNot':
    case 'notEqual':
      return fieldValue != value
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
    case 'doesNotContain':
      return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
    case 'startsWith':
      return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase())
    case 'endsWith':
      return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase())
    case 'greaterThan':
      return Number(fieldValue) > Number(value)
    case 'greaterThanOrEqual':
      return Number(fieldValue) >= Number(value)
    case 'lessThan':
      return Number(fieldValue) < Number(value)
    case 'lessThanOrEqual':
      return Number(fieldValue) <= Number(value)
    case 'isAfter':
      return new Date(fieldValue) > new Date(value)
    case 'isBefore':
      return new Date(fieldValue) < new Date(value)
    case 'isOnOrAfter':
      return new Date(fieldValue) >= new Date(value)
    case 'isOnOrBefore':
      return new Date(fieldValue) <= new Date(value)
    case 'hasAnyOf':
      if (!Array.isArray(fieldValue)) return false
      return Array.isArray(value) && value.some(v => fieldValue.includes(v))
    case 'hasAllOf':
      if (!Array.isArray(fieldValue)) return false
      return Array.isArray(value) && value.every(v => fieldValue.includes(v))
    case 'hasNoneOf':
      if (!Array.isArray(fieldValue)) return true
      return Array.isArray(value) && !value.some(v => fieldValue.includes(v))
    case 'isExactly':
      if (!Array.isArray(fieldValue)) return false
      return JSON.stringify([...fieldValue].sort()) === JSON.stringify([...value].sort())
    default:
      return true
  }
}

/**
 * 创建空的过滤器
 */
export function createEmptyFilter(): IFilter {
  return {
    conjunction: FilterConjunction.And,
    filterSet: []
  }
}

/**
 * 创建过滤条件项
 */
export function createFilterItem(fieldId: string, operator: FilterOperator, value: any = null): IFilterItem {
  return {
    fieldId,
    operator,
    value
  }
}

/**
 * 过滤器是否激活（有条件）
 */
export function isFilterActive(filter: IFilter | null): boolean {
  return !!(filter && filter.filterSet.length > 0)
}

/**
 * 获取过滤器描述文本
 */
export function getFilterDescription(filter: IFilter | null, fields: Array<{ id: string, name: string }>): string {
  if (!filter || !filter.filterSet.length) {
    return '添加过滤条件'
  }

  const count = filter.filterSet.length
  const firstField = fields.find(f => f.id === filter.filterSet[0].fieldId)
  
  if (count === 1 && firstField) {
    return `${firstField.name} 已过滤`
  }
  
  return `${count} 个过滤条件`
}

