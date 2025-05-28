/** BQuestionT2Q.ts */
/** 
 * 题目T2问题表接口
 */
export interface I_BQuestionT2Q {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 题目序号  */
  questionSort: number;

  /** 问题甲  */
  questionQ1: string;

  /** 问题乙  */
  questionQ2: string;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目T2问题表类
 */
export class C_BQuestionT2Q implements I_BQuestionT2Q {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 题目序号  */
  questionSort: number = 0;

  /** 问题甲  */
  questionQ1: string = "";

  /** 问题乙  */
  questionQ2: string = "";

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionT2Q>) {
    Object.assign(this, init);
  }
}