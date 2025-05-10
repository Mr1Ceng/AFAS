// TestResultQueryRow.ts
import { generateColumns } from '@/utils/TableHelper'
/**
 * 测试结果查询行数据
 */
export interface TestResultQueryRow {
  answerId: string; // 答案编码
  questionnaireId: string; // 试卷编码
  questionnaireName: string; // 试卷名称
  versionName: string; // 试卷版本
  userId: string; // 用户编码
  userName: string; // 用户姓名
  questionnaireDate: string; // 测评日期
  teacherId: string; // 测评老师
  teacherName: string; // 测评老师姓名
  status: string; // 状态
  radarImage: string; // 雷达图Base64
  sImage: string; // 视知觉结果图Base64
  sResult: string; // 视知觉结果
  tImage: string; // 听知觉结果图Base64
  tResult: string; // 听知觉结果
  weak: string; // 弱势
  advantage: string; // 优势
  remark: string; // 备注
  suggestedCourse: string; // 建议课程
  suggestedCourseName: string; // 建议课程名称
  levelCode: string; // 评测标准
  levelName: string; // 评测标准名称
}

/**
 * 映射字段名称
 */
export const TestResultFieldMap: Record<keyof TestResultQueryRow, string> = {
  answerId: "答案编码",
  questionnaireId: "试卷编码",
  questionnaireName: "试卷名称",
  versionName: "试卷版本",
  userId: "用户编码",
  userName: "用户姓名",
  questionnaireDate: "测评日期",
  teacherId: "测评老师",
  teacherName: "测评老师",
  status: "状态",
  radarImage: "雷达图",
  sImage: "视知觉图",
  sResult: "视知觉结果",
  tImage: "听知觉图",
  tResult: "听知觉结果",
  weak: "弱势",
  advantage: "优势",
  remark: "备注",
  suggestedCourse: "建议课程",
  suggestedCourseName: "建议课程",
  levelCode: "评测标准",
  levelName: "评测标准",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const TestResultColumns = generateColumns<TestResultQueryRow>(TestResultFieldMap);
