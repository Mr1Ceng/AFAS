
/**
 * 生成 Ant Design Table 的 columns 配置
 * @param instance 示例对象，用于推断数据类型
 * @param fieldMap 字段名称映射，用于指定 title
 * @returns columns 数组
 */
export const generateColumns = <T>(fieldMap: Record<keyof T, string>) => {
  return Object.entries(fieldMap).map(([key, title]) => ({
    title,
    dataIndex: key,
    ellipsis: true,
  }));
};