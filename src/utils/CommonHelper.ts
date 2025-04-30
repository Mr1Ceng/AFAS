
import dayjs from "dayjs";

// #region 通用方法
const formattedText = (text: string) => {
  if (text == undefined) {
    text = ""
  }
  return text
    .split("\n")
    .map(line => `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${line}`) // 添加两个空格缩进，使用 &nbsp; 防止HTML解析问题
    .join("<br>");
}

// 使用字符串键名获取属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // 使用索引签名
}
// #endregion


// 判断是否为日期字符串
const isDateString = (value: string): boolean => {
  // 日期格式匹配 "YYYY-MM-DD"
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // 日期时间格式匹配 "YYYY-MM-DD HH:mm:ss"
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

  // 如果匹配任意一种格式，返回 true
  return dateRegex.test(value) || dateTimeRegex.test(value);
};

// 遍历并处理返回数据
const processResponseData = (data: any): any => {
  if (Array.isArray(data)) {
    // 如果是数组，递归处理每一项
    return data.map(item => processResponseData(item));
  } else if (data !== null && typeof data === "object") {
    // 如果是对象，递归处理每个字段
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // 如果字段是日期字符串，转换为 dayjs 对象
        if (typeof value === "string" && isDateString(value)) {
          result[key] = dayjs(value);
        } else {
          // 其他字段递归处理
          result[key] = processResponseData(value);
        }
      }
    }
    return result;
  }
  // 如果是基本类型，直接返回
  return data;
};

export { formattedText, getProperty, processResponseData }
