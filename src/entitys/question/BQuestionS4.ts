/** BQuestionS4.ts */
/** 
 * 题目S4表接口
 */
export interface I_BQuestionS4 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

}


/** 
 * 题目S4表类
 */
export class C_BQuestionS4 implements I_BQuestionS4 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  constructor(init?: Partial<I_BQuestionS4>) {
    Object.assign(this, init);
  }
}