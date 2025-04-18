
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

export { formattedText, getProperty }
