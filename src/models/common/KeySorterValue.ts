import { Sorter } from '@/enums/common/Sorter'

/**
 * 排序字段
 */
export class KeySorterValue {
  /**
   * 字段
   */
  key: string;

  /**
   * 排序方式
   */
  value: Sorter;

  /**
   * 构造函数（默认排序方式为 ASC）
   */
  constructor();
  constructor(key: string);
  constructor(key: string, value: Sorter);
  constructor(key: string = "", value: Sorter = Sorter.ASC) {
    this.key = key;
    this.value = value;
  }
}