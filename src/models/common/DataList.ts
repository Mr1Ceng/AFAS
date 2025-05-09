/**
 * 查询的数据模型
 */
export interface DataList<T> {
  /**
   * 总记录数
   */
  count: number;

  /**
   * Data数组
   */
  data: T[];
}
