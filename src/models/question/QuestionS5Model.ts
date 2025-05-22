import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import type { C_BQuestionS5 } from "@/entitys/question/BQuestionS5";

/**
 * 试卷题目S5模型
 */
export class QuestionS5Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目问题列表
   */
  questionList: C_BQuestionS5[] = [];
}
