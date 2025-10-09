/**
 * Filter 类型定义
 * 
 * 基于旧系统实现，简化适配新系统
 */

// 过滤操作符
export enum FilterOperator {
  // 通用
  Is = 'is',
  IsNot = 'isNot',
  IsEmpty = 'isEmpty',
  IsNotEmpty = 'isNotEmpty',
  
  // 文本
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  
  // 数字
  Equal = 'equal',
  NotEqual = 'notEqual',
  GreaterThan = 'greaterThan',
  GreaterThanOrEqual = 'greaterThanOrEqual',
  LessThan = 'lessThan',
  LessThanOrEqual = 'lessThanOrEqual',
  
  // 日期
  IsAfter = 'isAfter',
  IsBefore = 'isBefore',
  IsOnOrAfter = 'isOnOrAfter',
  IsOnOrBefore = 'isOnOrBefore',
  IsWithin = 'isWithin',
  
  // 数组/多选
  HasAnyOf = 'hasAnyOf',
  HasAllOf = 'hasAllOf',
  HasNoneOf = 'hasNoneOf',
  IsExactly = 'isExactly',
}

// 连接符
export enum FilterConjunction {
  And = 'and',
  Or = 'or',
}

// 过滤条件项
export interface IFilterItem {
  fieldId: string
  operator: FilterOperator
  value: any
}

// 过滤配置
export interface IFilter {
  conjunction: FilterConjunction
  filterSet: IFilterItem[]
}

// 字段类型到操作符的映射
export const FIELD_TYPE_OPERATORS: Record<string, FilterOperator[]> = {
  text: [
    FilterOperator.Is,
    FilterOperator.IsNot,
    FilterOperator.Contains,
    FilterOperator.DoesNotContain,
    FilterOperator.StartsWith,
    FilterOperator.EndsWith,
    FilterOperator.IsEmpty,
    FilterOperator.IsNotEmpty,
  ],
  number: [
    FilterOperator.Equal,
    FilterOperator.NotEqual,
    FilterOperator.GreaterThan,
    FilterOperator.GreaterThanOrEqual,
    FilterOperator.LessThan,
    FilterOperator.LessThanOrEqual,
    FilterOperator.IsEmpty,
    FilterOperator.IsNotEmpty,
  ],
  singleSelect: [
    FilterOperator.Is,
    FilterOperator.IsNot,
    FilterOperator.IsEmpty,
    FilterOperator.IsNotEmpty,
  ],
  multipleSelect: [
    FilterOperator.HasAnyOf,
    FilterOperator.HasAllOf,
    FilterOperator.HasNoneOf,
    FilterOperator.IsExactly,
    FilterOperator.IsEmpty,
    FilterOperator.IsNotEmpty,
  ],
  date: [
    FilterOperator.Is,
    FilterOperator.IsNot,
    FilterOperator.IsBefore,
    FilterOperator.IsAfter,
    FilterOperator.IsOnOrBefore,
    FilterOperator.IsOnOrAfter,
    FilterOperator.IsWithin,
    FilterOperator.IsEmpty,
    FilterOperator.IsNotEmpty,
  ],
  checkbox: [
    FilterOperator.Is,
  ],
  rating: [
    FilterOperator.Equal,
    FilterOperator.NotEqual,
    FilterOperator.GreaterThan,
    FilterOperator.LessThan,
    FilterOperator.IsEmpty,
    FilterOperator.IsNotEmpty,
  ],
}

// 操作符显示名称
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  [FilterOperator.Is]: '等于',
  [FilterOperator.IsNot]: '不等于',
  [FilterOperator.IsEmpty]: '为空',
  [FilterOperator.IsNotEmpty]: '不为空',
  [FilterOperator.Contains]: '包含',
  [FilterOperator.DoesNotContain]: '不包含',
  [FilterOperator.StartsWith]: '开头是',
  [FilterOperator.EndsWith]: '结尾是',
  [FilterOperator.Equal]: '=',
  [FilterOperator.NotEqual]: '≠',
  [FilterOperator.GreaterThan]: '>',
  [FilterOperator.GreaterThanOrEqual]: '≥',
  [FilterOperator.LessThan]: '<',
  [FilterOperator.LessThanOrEqual]: '≤',
  [FilterOperator.IsAfter]: '晚于',
  [FilterOperator.IsBefore]: '早于',
  [FilterOperator.IsOnOrAfter]: '不早于',
  [FilterOperator.IsOnOrBefore]: '不晚于',
  [FilterOperator.IsWithin]: '在范围内',
  [FilterOperator.HasAnyOf]: '包含任一',
  [FilterOperator.HasAllOf]: '包含全部',
  [FilterOperator.HasNoneOf]: '不包含',
  [FilterOperator.IsExactly]: '完全匹配',
}

