import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import { C_BQuestionS4 } from "@/entitys/question/BQuestionS4";

/**
 * 试卷题目S4模型
 */
export class QuestionS4Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目问题列表
   */
  questionList: C_BQuestionS4 = new C_BQuestionS4();
}
