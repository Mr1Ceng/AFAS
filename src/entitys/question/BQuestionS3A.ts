/** BQuestionS3A.ts */
/** 
 * 题目S3答案表接口
 */
export interface I_BQuestionS3A {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 格子值;1-9数字  */
  gridValue: number;

  /** 格子图标  */
  gridIcon: string;

  [key: string]: any; // 允许任意属性

}


/** 
 * 题目S3答案表类
 */
export class C_BQuestionS3A implements I_BQuestionS3A {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 格子值;1-9数字  */
  gridValue: number = 0;

  /** 格子图标  */
  gridIcon: string = "";

  [key: string]: any; // 允许任意属性

  constructor(init?: Partial<I_BQuestionS3A>) {
    Object.assign(this, init);
  }
}