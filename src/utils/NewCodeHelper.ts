import { ulid } from 'ulid';
import { v4 as uuidv4 } from 'uuid';

/**
 * 【HEX】36位全小写字符串
 */
export const UUID = () => uuidv4().toLowerCase();

/**
 * 【HEX】26位全大写字符串
 */
export const ULID = () => ulid().toUpperCase();

/**
 * 【UUID】32位大写字符串
 */
export const KeyId = () => uuidv4().replace(/-/g, "").toUpperCase();

/**
 * 【ULID】26位大写字符串
 */
export const UlidKey = () => ULID();

/**
 * 【ULID】25位大写字符串（113年内不会重复）
 */
export const Ul25Key = () => ULID().substring(1, 26);

/**
 * 【ULID】24位大写字符串（8.7年后可能重复）
 */
export const Ul24Key = () => ULID().substring(2, 26);

/**
 * 【HEX】4位小写字符串
 */
export const Mark = () => getUpper(4);

/**
 * 【HEX】18位小写字符串
 */
export const Key = () => getLower(18);

/**
 * 【HEX】32位小写字符串
 */
export const Secret = () => getLower(32);

/**
 * 【HEX】32位小写字符串
 */
export const Token = () => getLower(32);

/**
 * 【数字】获取6位数字验证码
 */
export const NumberToken = () => getNumber(6);

/**
 * 获取12位含数字和大小写字母的随机字符
 */
export const Password = () => getString(12);

/**
 * 获取4位长度的当前年份字符串【yyyy】
 */
export const CurrentYear = () => new Date().getFullYear().toString();

/**
 * 获取6位长度的当前月份字符串【yyyyMM】
 */
export const CurrentMonth = () => new Date().toISOString().slice(0, 7).replace("-", "");

/**
 * 获取8位长度的当前日期字符串【yyyyMMdd】
 */
export const CurrentDay = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");

/**
 * 获取14位长度的当前时间字符串【yyyyMMddHHmmss】
 */
export const CurrentTime = () => new Date().toISOString().slice(0, 19).replace(/[-T]/g, "");

/**
 * 【HEX】获取指定长度的小写字符串
 */
export function getLower(length: number): string {
  let str = "";
  while (str.length < length) {
    str += uuidv4().replace(/-/g, "");
  }
  return str.substring(0, length);
}

/**
 * 【HEX】获取指定长度的大写字符串
 */
export function getUpper(length: number): string {
  return getLower(length).toUpperCase();
}

/**
 * 【数字】获取指定长度的数字
 */
export function getNumber(length: number): string {
  let str = "";
  while (str.length < length + 3) {
    str += uuidv4().replace(/-/g, "").replace(/[a-f]/g, "");
  }
  return str.substring(3, 3 + length);
}

//#region getString

function getString(length: number, allowNumber = true, allowUpper = true, allowLower = true, onlyHex = false, allowChar = false): string {
  const numbers = "0123456789";
  const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
  const hexChars = "0123456789ABCDEFabcdef";
  const specialChars = "!=.?";

  let charPool = "";
  if (allowNumber) charPool += numbers;
  if (allowUpper) charPool += upperCaseLetters;
  if (allowLower) charPool += lowerCaseLetters;
  if (onlyHex) charPool = hexChars;
  if (allowChar) charPool += specialChars;

  let result = "";
  while (result.length < length) {
    const randomIndex = Math.floor(Math.random() * charPool.length);
    result += charPool[randomIndex];
  }

  return result;
}

/**
 * 获取随机字符串
 */
export function getRandomString(length: number, allowNumber = true, allowUpper = true, allowLower = true): string {
  return getString(length, allowNumber, allowUpper, allowLower, false, false);
}

/**
 * 获取16进制随机字符串
 */
export function getHexString(length: number, allowNumber = true, allowUpper = true, allowLower = true): string {
  return getString(length, allowNumber, allowUpper, allowLower, true, false);
}

/**
 * 获取含特殊符号的随机字符串
 */
export function getCharString(length: number, allowNumber = true, allowUpper = true, allowLower = true): string {
  return getString(length, allowNumber, allowUpper, allowLower, false, true);
}

//#endregion
