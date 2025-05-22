import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import type { C_BQuestionS2 } from "@/entitys/question/BQuestionS2";

/**
 * 试卷题目S2模型
 */
export class QuestionS2Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目问题列表
   */
  questionList: C_BQuestionS2[] = [];
}
