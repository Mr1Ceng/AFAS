import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import { type C_BQuestionT3 } from "@/entitys/question/BQuestionT3";

/**
 * 试卷题目T3模型
 */
export class QuestionT3Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目问题列表
   */
  questionList: C_BQuestionT3[] = [];
}
