import { generateColumns } from "@/utils/TableHelper";

/**
 * 试卷表数据
 */
export interface QuestionnaireRow {
  questionnaireId: string; // 试卷编码（QN开头的6位字母数字）
  questionnaireName: string; // 试卷名称
  versionName: string; // 试卷版本名称
  remark: string; // 备注
}

/**
 * 映射字段名称
 */
export const QuestionnaireFieldMap: Record<keyof QuestionnaireRow, string> = {
  questionnaireId: "试卷编码",
  questionnaireName: "试卷名称",
  versionName: "试卷版本名称",
  remark: "备注",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const QuestionnaireColumns = generateColumns<QuestionnaireRow>(QuestionnaireFieldMap);
