/**
 * 排序方式枚举
 */
export enum Sorter {
  ASC = 0,
  DESC = 1
}

/**
 * 备注映射
 */
export const SorterDescription: Record<Sorter, string> = {
  [Sorter.ASC]: '正序',
  [Sorter.DESC]: '倒序',
};
