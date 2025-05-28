/** BQuestionT2.ts */
/** 
 * 题目T2表接口
 */
export interface I_BQuestionT2 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 题目  */
  question: string;

  /** 听不同题目数  */
  number1: number;

  /** 听相同题目数  */
  number2: number;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目T2表类
 */
export class C_BQuestionT2 implements I_BQuestionT2 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 题目  */
  question: string = "";

  /** 听不同题目数  */
  number1: number = 0;

  /** 听相同题目数  */
  number2: number = 0;

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionT2>) {
    Object.assign(this, init);
  }
}