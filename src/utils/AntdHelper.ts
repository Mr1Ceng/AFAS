
import { pinyin } from "pinyin-pro";

const filterOption = (input: string, option: any) => {
  console.log(option);
  console.log(pinyin(option.label, { pattern: "first", toneType: "none" }))
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
    || pinyin(option.label, { separator: "", toneType: "none" }).toLowerCase().indexOf(input.toLowerCase()) >= 0
    || pinyin(option.label, { pattern: "first", separator: "", toneType: "none" }).toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

const validateEmpty = (fieldName: string) => {
  return async (_rule: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    if (typeof value == "number" && value === 0) {
      return Promise.reject(new Error(`${fieldName} 不能为零`));
    }
    else if (typeof value == "string" && value.trim() === "") {
      return Promise.reject(new Error(`${fieldName} 不能为空`));
    }
    return Promise.resolve();
  };
};

export { filterOption, validateEmpty }