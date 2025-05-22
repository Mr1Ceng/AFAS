/** BQuestionS3.ts */
/** 
 * 题目S3表接口
 */
export interface I_BQuestionS3 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 行号  */
  gridRow: number;

  /** 列号  */
  gridColumn: number;

  /** 格子值  */
  gridValue: number;

}


/** 
 * 题目S3表类
 */
export class C_BQuestionS3 implements I_BQuestionS3 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 行号  */
  gridRow: number = 0;

  /** 列号  */
  gridColumn: number = 0;

  /** 格子值  */
  gridValue: number = 0;

  constructor(init?: Partial<I_BQuestionS3>) {
    Object.assign(this, init);
  }
}