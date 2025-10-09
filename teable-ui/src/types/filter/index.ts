/**
 * Filter 系统类型定义
 * 
 * 基于 Teable 旧系统的 Filter 架构
 * 参考: packages/core/src/models/view/filter/
 */

// ============== 基础类型 ==============

/** 逻辑连接符 */
export type Conjunction = 'and' | 'or'

/** 过滤操作符 */
export type FilterOperator =
  // 基础比较
  | 'is'                    // 等于
  | 'isNot'                 // 不等于
  | 'isEmpty'               // 为空
  | 'isNotEmpty'            // 不为空
  
  // 文本操作
  | 'contains'              // 包含
  | 'doesNotContain'        // 不包含
  | 'startsWith'            // 开始于
  | 'endsWith'              // 结束于
  
  // 数字/日期比较
  | 'isGreater'             // 大于
  | 'isGreaterEqual'        // 大于等于
  | 'isLess'                // 小于
  | 'isLessEqual'           // 小于等于
  
  // 多选操作
  | 'isAnyOf'               // 是其中之一
  | 'isNoneOf'              // 不是其中任何一个
  | 'hasAnyOf'              // 包含其中之一（用于多选字段）
  | 'hasAllOf'              // 包含所有（用于多选字段）
  | 'hasNoneOf'             // 不包含任何（用于多选字段）
  
  // 日期操作
  | 'isToday'               // 是今天
  | 'isYesterday'           // 是昨天
  | 'isTomorrow'            // 是明天
  | 'isThisWeek'            // 是本周
  | 'isLastWeek'            // 是上周
  | 'isNextWeek'            // 是下周
  | 'isThisMonth'           // 是本月
  | 'isLastMonth'           // 是上月
  | 'isNextMonth'           // 是下月
  | 'isBefore'              // 在...之前
  | 'isAfter'               // 在...之后
  | 'isOnOrBefore'          // 在...或之前
  | 'isOnOrAfter'           // 在...或之后

/** 过滤值类型 */
export type FilterValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | number[] 
  | null

// ============== 核心接口 ==============

/** 过滤条件项 */
export interface IFilterItem {
  /** 字段 ID */
  fieldId: string
  
  /** 操作符 */
  operator: FilterOperator
  
  /** 值 */
  value: FilterValue
}

/** 过滤集合 */
export interface IFilterSet {
  /** 逻辑连接符 */
  conjunction: Conjunction
  
  /** 过滤项或子过滤集合 */
  filterSet: (IFilterItem | IFilterSet)[]
}

/** 完整过滤器（顶层） */
export type IFilter = IFilterSet | null

// ============== 字段类型过滤器映射 ==============

/** 字段类型 -> 可用操作符映射 */
export const FIELD_TYPE_OPERATORS: Record<string, FilterOperator[]> = {
  // 文本字段
  text: [
    'is',
    'isNot',
    'contains',
    'doesNotContain',
    'startsWith',
    'endsWith',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 数字字段
  number: [
    'is',
    'isNot',
    'isGreater',
    'isGreaterEqual',
    'isLess',
    'isLessEqual',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 单选字段
  singleSelect: [
    'is',
    'isNot',
    'isAnyOf',
    'isNoneOf',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 多选字段
  multipleSelect: [
    'hasAnyOf',
    'hasAllOf',
    'hasNoneOf',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 日期字段
  date: [
    'is',
    'isBefore',
    'isAfter',
    'isOnOrBefore',
    'isOnOrAfter',
    'isToday',
    'isYesterday',
    'isTomorrow',
    'isThisWeek',
    'isLastWeek',
    'isNextWeek',
    'isThisMonth',
    'isLastMonth',
    'isNextMonth',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 布尔字段
  checkbox: [
    'is',
  ],
  
  // 评分字段
  rating: [
    'is',
    'isNot',
    'isGreater',
    'isGreaterEqual',
    'isLess',
    'isLessEqual',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 用户字段
  user: [
    'is',
    'isNot',
    'isAnyOf',
    'isNoneOf',
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 附件字段
  attachment: [
    'isEmpty',
    'isNotEmpty',
  ],
  
  // 关联字段
  link: [
    'isEmpty',
    'isNotEmpty',
    'hasAnyOf',
    'hasNoneOf',
  ],
}

/** 操作符显示名称 */
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  // 基础比较
  is: '等于',
  isNot: '不等于',
  isEmpty: '为空',
  isNotEmpty: '不为空',
  
  // 文本操作
  contains: '包含',
  doesNotContain: '不包含',
  startsWith: '开始于',
  endsWith: '结束于',
  
  // 数字/日期比较
  isGreater: '大于',
  isGreaterEqual: '大于等于',
  isLess: '小于',
  isLessEqual: '小于等于',
  
  // 多选操作
  isAnyOf: '是其中之一',
  isNoneOf: '不是其中任何一个',
  hasAnyOf: '包含其中之一',
  hasAllOf: '包含所有',
  hasNoneOf: '不包含任何',
  
  // 日期操作
  isToday: '是今天',
  isYesterday: '是昨天',
  isTomorrow: '是明天',
  isThisWeek: '是本周',
  isLastWeek: '是上周',
  isNextWeek: '是下周',
  isThisMonth: '是本月',
  isLastMonth: '是上月',
  isNextMonth: '是下月',
  isBefore: '在...之前',
  isAfter: '在...之后',
  isOnOrBefore: '在...或之前',
  isOnOrAfter: '在...或之后',
}

/** 不需要值的操作符 */
export const OPERATORS_WITHOUT_VALUE: FilterOperator[] = [
  'isEmpty',
  'isNotEmpty',
  'isToday',
  'isYesterday',
  'isTomorrow',
  'isThisWeek',
  'isLastWeek',
  'isNextWeek',
  'isThisMonth',
  'isLastMonth',
  'isNextMonth',
]

/** 需要多个值的操作符 */
export const OPERATORS_WITH_MULTIPLE_VALUES: FilterOperator[] = [
  'isAnyOf',
  'isNoneOf',
  'hasAnyOf',
  'hasAllOf',
  'hasNoneOf',
]

// ============== 工具函数 ==============

/**
 * 获取字段类型对应的有效操作符
 */
export function getValidOperators(fieldType: string): FilterOperator[] {
  return FIELD_TYPE_OPERATORS[fieldType] || FIELD_TYPE_OPERATORS.text
}

/**
 * 检查操作符是否需要值
 */
export function operatorNeedsValue(operator: FilterOperator): boolean {
  return !OPERATORS_WITHOUT_VALUE.includes(operator)
}

/**
 * 检查操作符是否需要多个值
 */
export function operatorNeedsMultipleValues(operator: FilterOperator): boolean {
  return OPERATORS_WITH_MULTIPLE_VALUES.includes(operator)
}

/**
 * 创建空的过滤条件项
 */
export function createEmptyFilterItem(fieldId: string, fieldType: string): IFilterItem {
  const operators = getValidOperators(fieldType)
  return {
    fieldId,
    operator: operators[0],
    value: null,
  }
}

/**
 * 创建空的过滤器
 */
export function createEmptyFilter(): IFilterSet {
  return {
    conjunction: 'and',
    filterSet: [],
  }
}

/**
 * 判断是否是过滤项
 */
export function isFilterItem(item: IFilterItem | IFilterSet): item is IFilterItem {
  return 'fieldId' in item && 'operator' in item
}

/**
 * 判断是否是过滤集合
 */
export function isFilterSet(item: IFilterItem | IFilterSet): item is IFilterSet {
  return 'filterSet' in item && 'conjunction' in item
}

