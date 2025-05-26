import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import type { C_BQuestionS3 } from "@/entitys/question/BQuestionS3";
import type { C_BQuestionS3A } from "@/entitys/question/BQuestionS3A";

/**
 * 试卷题目S3模型
 */
export class QuestionS3Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目问题列表
   */
  questionList: C_BQuestionS3[] = [];

  /**
   * 题目S3答案列表
   */
  bQuestionS3AList: C_BQuestionS3A[] = [];
}
