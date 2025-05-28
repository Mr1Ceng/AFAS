/** BQuestionS1.ts */
/** 
 * 题目S1表接口
 */
export interface I_BQuestionS1 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 格子类型;SMALL、MIDDLE、LARGE  */
  gridType: string;

  /** 格子值  */
  gridValue: number;

  /** 格子排序  */
  gridSort: number;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目S1表类
 */
export class C_BQuestionS1 implements I_BQuestionS1 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 格子类型;SMALL、MIDDLE、LARGE  */
  gridType: string = "";

  /** 格子值  */
  gridValue: number = 0;

  /** 格子排序  */
  gridSort: number = 0;

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionS1>) {
    Object.assign(this, init);
  }
}