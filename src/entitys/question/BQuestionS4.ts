/** BQuestionS4.ts */
/** 
 * 题目S4表接口
 */
export interface I_BQuestionS4 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 间距  */
  spacing: number;

  /** 波动程度  */
  perturbation: number;

  /** 圈数  */
  ringNumber: number;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目S4表类
 */
export class C_BQuestionS4 implements I_BQuestionS4 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 间距  */
  spacing: number = 0;

  /** 波动程度  */
  perturbation: number = 0;

  /** 圈数  */
  ringNumber: number = 0;

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionS4>) {
    Object.assign(this, init);
  }
}