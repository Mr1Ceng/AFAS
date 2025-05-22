import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import type { C_BQuestionS1 } from "@/entitys/question/BQuestionS1";

/**
 * 试卷题目S1模型
 */
export class QuestionS1Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目问题列表
   */
  questionList: C_BQuestionS1[] = [];
}
