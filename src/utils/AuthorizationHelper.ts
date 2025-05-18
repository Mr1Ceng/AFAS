import _ from "lodash";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from 'uuid';

const TerminalKey = 'fb78e6c9c1e444319b';
const TerminalSecret = '28ea6c66bd504e8583f7c76380789cc7';

/**
 * 使用 Lodash 和 CryptoJS 计算 SHA256 哈希
 * @param input 输入字符串
 * @returns SHA256 哈希值（全大写）
 */
function encryptSHA256(input: string): string {
  // 使用 Lodash 清理输入数据（例如去除空格）
  const cleanedInput = _.trim(input);

  // 使用 CryptoJS 计算 SHA256 哈希
  const hash = CryptoJS.SHA256(cleanedInput).toString(CryptoJS.enc.Hex);

  // 转换为全大写
  return hash.toUpperCase();
}

/**
 * 获取认证字符串
 * @param key 认证密钥
 * @param secret 加密密钥
 * @param keyId 非必须，UserId
 * @param token 非必须，认证 Token
 * @returns Base64 编码的认证字符串
 */
function getAuthorizationString(keyId: string = "", token: string = ""): string {
  // 生成随机字符串
  const random = uuidv4();

  // 获取当前时间戳（以毫秒为单位）
  const timeStamp = Date.now().toString();

  // 计算签名：SHA256 加密
  const signature = encryptSHA256(random + timeStamp + TerminalSecret);

  // 拼接初始字符串
  let text = `${TerminalKey}|${random}|${timeStamp}|${signature}`;

  // 处理 keyId
  if (keyId !== "") {
    if (keyId.includes('|')) {
      throw new Error("账号包含非法字符");
    }
    text += `|${keyId}`;
  }

  // 处理 token
  if (token !== "") {
    if (token.length !== 32) {
      throw new Error("非法的 Token 格式");
    }
    text += `|${token}`;
  }

  // 转换为 Base64 编码
  return btoa(text);
}

export { getAuthorizationString }


