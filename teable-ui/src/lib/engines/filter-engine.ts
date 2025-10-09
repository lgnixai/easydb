/**
 * Filter Engine - 过滤引擎
 * 
 * 执行过滤逻辑，支持复杂的嵌套过滤条件
 */

import type { IFilter, IFilterItem, IFilterSet, FilterOperator, FilterValue } from '@/types/filter'
import { isFilterItem, isFilterSet } from '@/types/filter'

// ============== 类型定义 ==============

export interface IField {
  id: string
  name: string
  type: string
  [key: string]: any
}

export type RecordData = Record<string, any>

// ============== 过滤引擎 ==============

/**
 * 应用过滤器到记录列表
 */
export function applyFilter(
  records: RecordData[],
  filter: IFilter,
  fields: IField[]
): RecordData[] {
  if (!filter || !filter.filterSet || filter.filterSet.length === 0) {
    return records
  }

  const fieldMap = new Map(fields.map(f => [f.id, f]))

  return records.filter(record => {
    return evaluateFilterSet(record, filter, fieldMap)
  })
}

/**
 * 评估过滤集合
 */
function evaluateFilterSet(
  record: RecordData,
  filterSet: IFilterSet,
  fieldMap: Map<string, IField>
): boolean {
  const { conjunction, filterSet: items } = filterSet

  if (items.length === 0) return true

  const results = items.map(item => {
    if (isFilterItem(item)) {
      return evaluateFilterItem(record, item, fieldMap)
    } else if (isFilterSet(item)) {
      return evaluateFilterSet(record, item, fieldMap)
    }
    return true
  })

  // 根据连接符合并结果
  if (conjunction === 'and') {
    return results.every(r => r)
  } else {
    return results.some(r => r)
  }
}

/**
 * 评估单个过滤条件
 */
function evaluateFilterItem(
  record: RecordData,
  filterItem: IFilterItem,
  fieldMap: Map<string, IField>
): boolean {
  const { fieldId, operator, value } = filterItem
  const field = fieldMap.get(fieldId)
  
  if (!field) return true // 字段不存在，默认通过

  const cellValue = record[fieldId]
  
  return evaluateOperator(cellValue, operator, value, field)
}

/**
 * 评估操作符
 */
function evaluateOperator(
  cellValue: any,
  operator: FilterOperator,
  filterValue: FilterValue,
  field: IField
): boolean {
  // 处理 null 和 undefined
  const isNull = cellValue === null || cellValue === undefined || cellValue === ''

  switch (operator) {
    // ===== 基础比较 =====
    case 'is':
      if (field.type === 'checkbox') {
        return cellValue === filterValue
      }
      return cellValue == filterValue

    case 'isNot':
      return cellValue != filterValue

    case 'isEmpty':
      return isNull

    case 'isNotEmpty':
      return !isNull

    // ===== 文本操作 =====
    case 'contains':
      if (isNull) return false
      return String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())

    case 'doesNotContain':
      if (isNull) return true
      return !String(cellValue).toLowerCase().includes(String(filterValue).toLowerCase())

    case 'startsWith':
      if (isNull) return false
      return String(cellValue).toLowerCase().startsWith(String(filterValue).toLowerCase())

    case 'endsWith':
      if (isNull) return false
      return String(cellValue).toLowerCase().endsWith(String(filterValue).toLowerCase())

    // ===== 数字/日期比较 =====
    case 'isGreater':
      if (isNull) return false
      return Number(cellValue) > Number(filterValue)

    case 'isGreaterEqual':
      if (isNull) return false
      return Number(cellValue) >= Number(filterValue)

    case 'isLess':
      if (isNull) return false
      return Number(cellValue) < Number(filterValue)

    case 'isLessEqual':
      if (isNull) return false
      return Number(cellValue) <= Number(filterValue)

    // ===== 多选操作 =====
    case 'isAnyOf':
      if (isNull) return false
      if (!Array.isArray(filterValue)) return false
      return filterValue.includes(cellValue)

    case 'isNoneOf':
      if (isNull) return true
      if (!Array.isArray(filterValue)) return true
      return !filterValue.includes(cellValue)

    case 'hasAnyOf': {
      if (isNull) return false
      if (!Array.isArray(cellValue)) return false
      if (!Array.isArray(filterValue)) return false
      return filterValue.some(v => cellValue.includes(v))
    }

    case 'hasAllOf': {
      if (isNull) return false
      if (!Array.isArray(cellValue)) return false
      if (!Array.isArray(filterValue)) return false
      return filterValue.every(v => cellValue.includes(v))
    }

    case 'hasNoneOf': {
      if (isNull) return true
      if (!Array.isArray(cellValue)) return true
      if (!Array.isArray(filterValue)) return true
      return !filterValue.some(v => cellValue.includes(v))
    }

    // ===== 日期操作 =====
    case 'isBefore':
      if (isNull) return false
      return new Date(cellValue) < new Date(filterValue as string)

    case 'isAfter':
      if (isNull) return false
      return new Date(cellValue) > new Date(filterValue as string)

    case 'isOnOrBefore':
      if (isNull) return false
      return new Date(cellValue) <= new Date(filterValue as string)

    case 'isOnOrAfter':
      if (isNull) return false
      return new Date(cellValue) >= new Date(filterValue as string)

    case 'isToday':
      if (isNull) return false
      return isToday(new Date(cellValue))

    case 'isYesterday':
      if (isNull) return false
      return isYesterday(new Date(cellValue))

    case 'isTomorrow':
      if (isNull) return false
      return isTomorrow(new Date(cellValue))

    case 'isThisWeek':
      if (isNull) return false
      return isThisWeek(new Date(cellValue))

    case 'isLastWeek':
      if (isNull) return false
      return isLastWeek(new Date(cellValue))

    case 'isNextWeek':
      if (isNull) return false
      return isNextWeek(new Date(cellValue))

    case 'isThisMonth':
      if (isNull) return false
      return isThisMonth(new Date(cellValue))

    case 'isLastMonth':
      if (isNull) return false
      return isLastMonth(new Date(cellValue))

    case 'isNextMonth':
      if (isNull) return false
      return isNextMonth(new Date(cellValue))

    default:
      return true
  }
}

// ============== 日期辅助函数 ==============

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

function isThisWeek(date: Date): boolean {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  
  return date >= startOfWeek && date < endOfWeek
}

function isLastWeek(date: Date): boolean {
  const today = new Date()
  const startOfLastWeek = new Date(today)
  startOfLastWeek.setDate(today.getDate() - today.getDay() - 7)
  startOfLastWeek.setHours(0, 0, 0, 0)
  
  const endOfLastWeek = new Date(startOfLastWeek)
  endOfLastWeek.setDate(startOfLastWeek.getDate() + 7)
  
  return date >= startOfLastWeek && date < endOfLastWeek
}

function isNextWeek(date: Date): boolean {
  const today = new Date()
  const startOfNextWeek = new Date(today)
  startOfNextWeek.setDate(today.getDate() - today.getDay() + 7)
  startOfNextWeek.setHours(0, 0, 0, 0)
  
  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 7)
  
  return date >= startOfNextWeek && date < endOfNextWeek
}

function isThisMonth(date: Date): boolean {
  const today = new Date()
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

function isLastMonth(date: Date): boolean {
  const today = new Date()
  const lastMonth = new Date(today)
  lastMonth.setMonth(today.getMonth() - 1)
  return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()
}

function isNextMonth(date: Date): boolean {
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(today.getMonth() + 1)
  return date.getMonth() === nextMonth.getMonth() && date.getFullYear() === nextMonth.getFullYear()
}

// ============== 辅助函数 ==============

/**
 * 统计符合过滤条件的记录数
 */
export function countFilteredRecords(
  records: RecordData[],
  filter: IFilter,
  fields: IField[]
): number {
  return applyFilter(records, filter, fields).length
}

/**
 * 检查记录是否符合过滤条件
 */
export function recordMatchesFilter(
  record: RecordData,
  filter: IFilter,
  fields: IField[]
): boolean {
  if (!filter || !filter.filterSet || filter.filterSet.length === 0) {
    return true
  }

  const fieldMap = new Map(fields.map(f => [f.id, f]))
  return evaluateFilterSet(record, filter, fieldMap)
}

