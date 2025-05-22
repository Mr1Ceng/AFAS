import { type I_BQuestion, C_BQuestion } from "@/entitys/question/BQuestion";
import { C_BQuestionT2 } from "@/entitys/question/BQuestionT2";
import { type C_BQuestionT2Q } from "@/entitys/question/BQuestionT2Q";
import { type C_BQuestionT2A } from "@/entitys/question/BQuestionT2A";

/**
 * 试卷题目T2模型
 */
export class QuestionT2Model {
  /**
   * 题目基本信息
   */
  questionInfo: I_BQuestion = new C_BQuestion();

  /**
   * 题目标准答案信息
   */
  answerInfo: C_BQuestionT2 = new C_BQuestionT2();

  /**
   * 题目T2问题列表
   */
  bQuestionT2QList: C_BQuestionT2Q[] = [];

  /**
   * 题目T2答案列表
   */
  bQuestionT2AList: C_BQuestionT2A[] = [];
}
