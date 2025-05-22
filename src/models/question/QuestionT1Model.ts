import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import { C_BQuestionT1 } from "@/entitys/question/BQuestionT1";
import { type C_BQuestionT1Q } from "@/entitys/question/BQuestionT1Q";
import { type C_BQuestionT1A } from "@/entitys/question/BQuestionT1A";

/**
 * 试卷题目T1模型
 */
export class QuestionT1Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目标准答案信息
   */
  answerInfo: C_BQuestionT1 = new C_BQuestionT1();

  /**
   * 题目T1问题列表
   */
  bQuestionT1QList: C_BQuestionT1Q[] = [];

  /**
   * 题目T1答案列表
   */
  bQuestionT1AList: C_BQuestionT1A[] = [];
}
