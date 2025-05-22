/** BQuestionS2.ts */
/** 
 * 题目S2表接口
 */
export interface I_BQuestionS2 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 行号  */
  gridRow: number;

  /** 列号  */
  gridColumn: number;

  /** 格子值  */
  gridValue: number;

  /** 是否为正确答案  */
  isTrue: boolean;

}


/** 
 * 题目S2表类
 */
export class C_BQuestionS2 implements I_BQuestionS2 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 行号  */
  gridRow: number = 0;

  /** 列号  */
  gridColumn: number = 0;

  /** 格子值  */
  gridValue: number = 0;

  /** 是否为正确答案  */
  isTrue: boolean = false;

  constructor(init?: Partial<I_BQuestionS2>) {
    Object.assign(this, init);
  }
}