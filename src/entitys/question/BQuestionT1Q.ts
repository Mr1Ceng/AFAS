/** BQuestionT1Q.ts */
/** 
 * 题目T1问题表接口
 */
export interface I_BQuestionT1Q {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 题目序号  */
  questionSort: number;

  /** 问题;Number1、Number2、Story  */
  questionType: string;

  /** 问题  */
  questionQ: string;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目T1问题表类
 */
export class C_BQuestionT1Q implements I_BQuestionT1Q {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 题目序号  */
  questionSort: number = 0;

  /** 问题;Number1、Number2、Story  */
  questionType: string = "";

  /** 问题  */
  questionQ: string = "";

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionT1Q>) {
    Object.assign(this, init);
  }
}