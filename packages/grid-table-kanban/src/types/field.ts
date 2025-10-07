/**
 * Field and cell value types - aligned with @teable/core
 */

/**
 * Field Type Enum - 与参考项目对齐的字段类型定义
 */
export enum FieldType {
  SingleLineText = 'singleLineText',
  LongText = 'longText',
  User = 'user',
  Attachment = 'attachment',
  Checkbox = 'checkbox',
  MultipleSelect = 'multipleSelect',
  SingleSelect = 'singleSelect',
  Date = 'date',
  Number = 'number',
  Rating = 'rating',
  Formula = 'formula',
  Rollup = 'rollup',
  Link = 'link',
  CreatedTime = 'createdTime',
  LastModifiedTime = 'lastModifiedTime',
  CreatedBy = 'createdBy',
  LastModifiedBy = 'lastModifiedBy',
  AutoNumber = 'autoNumber',
  Button = 'button',
}

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

/**
 * Date field options
 */
export interface IDateFieldOptions {
  formatting?: {
    date: string;
    time: 'None' | 'HH:mm' | 'HH:mm:ss';
    timeZone?: string;
  };
}

/**
 * Number field options
 */
export interface INumberFieldOptions {
  precision?: number;
  showAs?: {
    type: 'ring' | 'bar';
    color: string;
    maxValue: number;
    showValue: boolean;
  };
}

/**
 * Select field options
 */
export interface ISelectFieldOptions {
  choices: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  preventAutoNewOptions?: boolean;
}

/**
 * User field options
 */
export interface IUserFieldOptions {
  isMultiple?: boolean;
  preventAutoNewOptions?: boolean;
}

/**
 * Link field options
 */
export interface ILinkFieldOptions {
  relationship: 'oneOne' | 'oneMany' | 'manyOne' | 'manyMany';
  foreignTableId: string;
  lookupFieldId?: string;
  symmetricFieldId?: string;
}

/**
 * Rating field options
 */
export interface IRatingFieldOptions {
  icon: string;
  color: string;
  max: number;
}

/**
 * Attachment field options
 */
export interface IAttachmentFieldOptions {
  // 可以扩展
}