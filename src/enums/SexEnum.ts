/**
 * 枚举
 */
export enum SexEnum {
  Male = 'MALE',
  Female = 'FEMALE',
}

/**
 * 备注映射
 */
export const SexDescription: Record<SexEnum, string> = {
  [SexEnum.Male]: '男',
  [SexEnum.Female]: '女',
};
