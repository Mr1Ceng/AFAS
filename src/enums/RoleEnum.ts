/**
 * 角色枚举
 */
export enum RoleEnum {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

/**
 * 备注映射
 */
export const RoleDescription: Record<RoleEnum, string> = {
  [RoleEnum.STUDENT]: '学生',
  [RoleEnum.TEACHER]: '老师',
};
