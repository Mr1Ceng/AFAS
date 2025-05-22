/** BQuestionS5.ts */
/** 
 * 题目S5表接口
 */
export interface I_BQuestionS5 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string;

  /** 图片编码  */
  imageId: string;

  /** 图片Base64  */
  image: string;

}


/** 
 * 题目S5表类
 */
export class C_BQuestionS5 implements I_BQuestionS5 {
  /** 题目编码;QS开头的6位字母数字组合  */
  questionId: string = "";

  /** 图片编码  */
  imageId: string = "";

  /** 图片Base64  */
  image: string = "";

  constructor(init?: Partial<I_BQuestionS5>) {
    Object.assign(this, init);
  }
}