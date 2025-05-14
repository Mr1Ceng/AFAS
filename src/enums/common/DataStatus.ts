/**
 * 数据状态枚举
 */
export enum DataStatusEnum {
  Inactive = 'INACTIVE',
  Active = 'ACTIVE',
  Draft = 'DRAFT',
}

/**
 * 备注映射
 */
export const DataStatusDescription: Record<DataStatusEnum, string> = {
  [DataStatusEnum.Inactive]: '无效的',
  [DataStatusEnum.Active]: '有效的',
  [DataStatusEnum.Draft]: '草稿',
};
