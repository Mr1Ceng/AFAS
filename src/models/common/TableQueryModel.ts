import { KeySorterValue } from './KeySorterValue'
/**
 * 提交表格查询的数据模型
 */
export interface TableQueryModel {
  /**
   * 页码索引（从0开始，0是第一页）
   */
  index: number;

  /**
   * 页面大小（0表示不分页）
   */
  size: number;

  /**
   * 排序字段
   */
  sorter?: KeySorterValue;
}

/**
 * 提交表格查询的数据模型（带查询字段）
 * @typeparam T 查询字段类型
 */
export interface TableQueryModelWithData<T> extends TableQueryModel {
  /**
   * 查询数据模型
   */
  data?: T;
}

/**
 * 提交表格查询的数据模型（带查询字段和过滤字段）
 * @typeparam T 查询字段类型
 * @typeparam F 过滤字段类型
 */
export interface TableQueryModelWithDataAndFilter<T, F> extends TableQueryModel {
  /**
   * 过滤数据模型
   */
  filter?: F;

  /**
   * 查询数据模型
   */
  data?: T;
}
