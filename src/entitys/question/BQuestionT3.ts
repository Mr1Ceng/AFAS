/** BQuestionT3.ts */
/** 
 * 题目T3表接口
 */
export interface I_BQuestionT3 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 顺逆类型  */
  questionType: boolean;

  /** 题目序号  */
  questionSort: number;

  /** 级别  */
  level: number;

  /** 问题  */
  questionQ: string;

  /** 答案  */
  questionA: string;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目T3表类
 */
export class C_BQuestionT3 implements I_BQuestionT3 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 顺逆类型  */
  questionType: boolean = false;

  /** 题目序号  */
  questionSort: number = 0;

  /** 级别  */
  level: number = 0;

  /** 问题  */
  questionQ: string = "";

  /** 答案  */
  questionA: string = "";

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionT3>) {
    Object.assign(this, init);
  }
}