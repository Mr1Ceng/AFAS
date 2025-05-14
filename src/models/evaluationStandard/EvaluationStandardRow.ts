import { generateColumns } from '@/utils/TableHelper';

/**
 * 测评标准配置数据
 */
export interface EvaluationStandardRow {
  levelCode: string; // 等级编码
  levelName: string; // 等级名称
  s1: number; // 视觉广度
  s2: number; // 视觉稳定性
  s3: number; // 视觉转移
  s4: number; // 手眼协调
  s5: number; // 视觉工作记忆
  t1: number; // 听觉集中
  t2: number; // 听觉分辨
  t3: number; // 听觉记忆
}

/**
 * 映射字段名称
 */
export const EvaluationStandardFieldMap: Record<keyof EvaluationStandardRow, string> = {
  levelCode: "等级编码",
  levelName: "等级名称",
  s1: "视觉广度",
  s2: "视觉稳定性",
  s3: "视觉转移",
  s4: "手眼协调",
  s5: "视觉工作记忆",
  t1: "听觉集中",
  t2: "听觉分辨",
  t3: "听觉记忆",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const EvaluationStandardColumns = generateColumns<EvaluationStandardRow>(EvaluationStandardFieldMap);
