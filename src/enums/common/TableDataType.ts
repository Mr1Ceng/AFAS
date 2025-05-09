/**
 * 表格数据类型枚举
 */
export enum TableDataType {
  STRING = 0,
  NUMBER = 1,
  BASE64IMAGE = 2,
}

/**
 * 备注映射
 */
export const SorterDescription: Record<TableDataType, string> = {
  [TableDataType.STRING]: '字符串',
  [TableDataType.NUMBER]: '数字',
  [TableDataType.BASE64IMAGE]: 'base64图片',
};
