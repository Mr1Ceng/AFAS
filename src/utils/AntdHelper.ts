
import { pinyin } from "pinyin-pro";

const filterOption = (input: string, option: any) => {
  console.log(option);
  console.log(pinyin(option.label, { pattern: "first", toneType: "none" }))
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
    || pinyin(option.label, { separator: "", toneType: "none" }).toLowerCase().indexOf(input.toLowerCase()) >= 0
    || pinyin(option.label, { pattern: "first", separator: "", toneType: "none" }).toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

export { filterOption }