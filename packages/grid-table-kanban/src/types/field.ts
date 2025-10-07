/**
 * Field and cell value types - simplified from @teable/core
 */

/**
 * Button field options
 */
export interface IButtonFieldOptions {
  label: string;
  color?: string;
}

/**
 * Button field cell value
 */
export interface IButtonFieldCellValue {
  label?: string;
  disabled?: boolean;
}