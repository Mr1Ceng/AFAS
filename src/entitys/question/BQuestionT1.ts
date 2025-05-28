/** BQuestionT1.ts */
/** 
 * 题目T1表接口
 */
export interface I_BQuestionT1 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 数字题  */
  numberQuestion: string;

  /** 故事题  */
  storyQuestion: string;

  /** 数字题1答案  */
  number1: number;

  /** 数字题2答案  */
  number2: number;

  /** 故事题答案  */
  number3: number;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目T1表类
 */
export class C_BQuestionT1 implements I_BQuestionT1 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 数字题  */
  numberQuestion: string = "";

  /** 故事题  */
  storyQuestion: string = "";

  /** 数字题1答案  */
  number1: number = 0;

  /** 数字题2答案  */
  number2: number = 0;

  /** 故事题答案  */
  number3: number = 0;

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionT1>) {
    Object.assign(this, init);
  }
}