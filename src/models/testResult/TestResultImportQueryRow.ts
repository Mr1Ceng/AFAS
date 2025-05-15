import { generateColumns } from '@/utils/TableHelper';

/**
 * 测试结果导入查询行数据
 */
export interface TestResultImportQueryRow {
  importId: string; // 导入编码
  importStamp: string; // 导入时间
  isSuccess: boolean; // 是否成功
  importResult: string; // 导入结果
  importCount: number; // 导入数量
  userId: string; // 导入者
  userName: string; // 导入者姓名
}

/**
 * 映射字段名称
 */
export const TestResultImportFieldMap: Record<keyof TestResultImportQueryRow, string> = {
  importId: "导入编码",
  importStamp: "导入时间",
  isSuccess: "是否成功",
  importResult: "导入结果",
  importCount: "导入数量",
  userId: "导入者",
  userName: "导入者姓名",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const TestResultImportColumns = generateColumns<TestResultImportQueryRow>(TestResultImportFieldMap);
