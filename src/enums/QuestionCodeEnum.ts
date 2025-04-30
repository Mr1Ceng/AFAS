/**
 * 枚举
 */
export enum QuestionCodeEnum {
  S1 = 'S1',
  S2 = 'S2',
  S3 = 'S3',
  S4 = 'S4',
  S5 = 'S5',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
}

/**
 * 备注映射
 */
export const QuestionCodeDescription: Record<QuestionCodeEnum, string> = {
  [QuestionCodeEnum.S1]: '视觉广度',
  [QuestionCodeEnum.S2]: '视觉稳定性',
  [QuestionCodeEnum.S3]: '视觉转移',
  [QuestionCodeEnum.S4]: '手眼协调',
  [QuestionCodeEnum.S5]: '视觉工作记忆',
  [QuestionCodeEnum.T1]: '听觉集中',
  [QuestionCodeEnum.T2]: '听觉分辨',
  [QuestionCodeEnum.T3]: '听觉记忆',
};
