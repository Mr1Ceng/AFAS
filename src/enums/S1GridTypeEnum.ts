/**
 * 枚举
 */
export enum S1GridTypeEnum {
  small = 'SMALL',
  middle = 'MIDDLE',
  large = 'LARGE',
}

/**
 * 备注映射
 */
export const S1GridTypeDescription: Record<S1GridTypeEnum, string> = {
  [S1GridTypeEnum.small]: '小图',
  [S1GridTypeEnum.middle]: '中图',
  [S1GridTypeEnum.large]: '大图',
};
