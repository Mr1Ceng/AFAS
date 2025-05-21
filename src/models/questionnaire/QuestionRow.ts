import { generateColumns } from "@/utils/TableHelper";

/**
 * 题目基本信息表
 */
export interface QuestionRow {
  questionId: string; // 题目编码（QS开头的6位字母数字组合）
  questionCode: string; // 题目类型
  questionName: string; // 题目名称
  questionnaireId: string; // 试卷编码（QN开头的6位字母数字）
  precautions: string; // 注意事项
  instruction: string; // 指导语
  instruction2: string; // 指导语
  instruction3: string; // 指导语
  instruction4: string; // 指导语
}

/**
 * 映射字段名称
 */
export const QuestionFieldMap: Record<keyof QuestionRow, string> = {
  questionId: "题目编码",
  questionCode: "题目类型",
  questionName: "题目名称",
  questionnaireId: "试卷编码",
  precautions: "注意事项",
  instruction: "指导语",
  instruction2: "指导语",
  instruction3: "指导语",
  instruction4: "指导语",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const QuestionColumns = generateColumns<QuestionRow>(QuestionFieldMap);
