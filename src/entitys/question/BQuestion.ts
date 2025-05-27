/** BQuestion.ts */
/** 
 * 题目基本信息表接口
 */
export interface I_BQuestion {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 题目类型  */
  questionCode: string;

  /** 题目名称  */
  questionName: string;

  /** 试卷编码;QN开头的6位字母数字  */
  questionnaireId: string;

  /** 注意事项  */
  precautions: string;

  /** 指导语1  */
  instruction: string;

  /** 指导语2  */
  instruction2: string;

  /** 指导语3  */
  instruction3: string;

  /** 指导语4  */
  instruction4: string;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目基本信息表类
 */
export class C_BQuestion implements I_BQuestion {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 题目类型  */
  questionCode: string = "";

  /** 题目名称  */
  questionName: string = "";

  /** 试卷编码;QN开头的6位字母数字  */
  questionnaireId: string = "";

  /** 注意事项  */
  precautions: string = "";

  /** 指导语1  */
  instruction: string = "";

  /** 指导语2  */
  instruction2: string = "";

  /** 指导语3  */
  instruction3: string = "";

  /** 指导语4  */
  instruction4: string = "";

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestion>) {
    Object.assign(this, init);
  }
}