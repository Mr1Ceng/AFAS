/**
 * 性别枚举
 */
export enum GerderEnum {
  Male = 'MALE',
  Female = 'FEMALE',
}

/**
 * 备注映射
 */
export const GerderDescription: Record<GerderEnum, string> = {
  [GerderEnum.Male]: '男',
  [GerderEnum.Female]: '女',
};
