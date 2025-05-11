import { generateColumns } from '@/utils/TableHelper';

/**
 * 螺旋迷宫配置数据
 */
export interface SpiralMazeRow {
  age: number; // 年龄
  spacing: number; // 间距
  perturbation: number; // 波动程度
  ringNumber: number; // 圈数
}

/**
 * 映射字段名称
 */
export const SpiralMazeFieldMap: Record<keyof SpiralMazeRow, string> = {
  age: "年龄",
  spacing: "间距",
  perturbation: "波动程度",
  ringNumber: "圈数",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const SpiralMazeColumns = generateColumns<SpiralMazeRow>(SpiralMazeFieldMap);
