/** BQuestionT1A.ts */
/** 
 * 题目T1答案表接口
 */
export interface I_BQuestionT1A {
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

}


/** 
 * 题目T1答案表类
 */
export class C_BQuestionT1A implements I_BQuestionT1A {
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

  constructor(init?: Partial<I_BQuestionT1A>) {
    Object.assign(this, init);
  }
}