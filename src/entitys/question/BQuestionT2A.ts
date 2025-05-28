/** BQuestionT2A.ts */
/** 
 * 题目T2答案表接口
 */
export interface I_BQuestionT2A {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 题目序号  */
  questionSort: number;

  /** 答案序号  */
  answerSort: string;

  /** 答案  */
  answer: string;

  /** 是否为正确答案  */
  isTrue: boolean;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目T2答案表类
 */
export class C_BQuestionT2A implements I_BQuestionT2A {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 题目序号  */
  questionSort: number = 0;

  /** 答案序号  */
  answerSort: string = "";

  /** 答案  */
  answer: string = "";

  /** 是否为正确答案  */
  isTrue: boolean = false;

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionT2A>) {
    Object.assign(this, init);
  }
}