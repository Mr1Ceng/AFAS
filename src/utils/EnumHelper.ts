// src/utils/enumHelper.ts

/**
 * 枚举辅助类
 * 提供对枚举和备注的操作方法
 */
export class EnumHelper {
  /**
   * 获取枚举的所有键值对
   * @param enumObj 枚举对象
   * @returns 键值对数组 [{ key: string; value: string }]
   */
  static getEnumKeyValuePairs<T extends object>(enumObj: T): { key: string; value: string }[] {
    return Object.entries(enumObj).map(([key, value]) => ({ key, value }));
  }

  /**
   * 获取枚举的所有备注信息
   * @param descriptions 备注映射
   * @returns 键值对数组 [{ value: string; description: string }]
   */
  static getEnumDescriptions<T extends Record<string, string>>(
    descriptions: T
  ): { value: string; description: string }[] {
    return Object.entries(descriptions).map(([key, description]) => ({
      value: key,
      description,
    }));
  }

  /**
   * 根据枚举值获取备注
   * @param descriptions 备注映射
   * @param value 枚举值
   * @returns 对应的备注信息
   */
  static getDescriptionByValue<T extends Record<string, string>>(
    descriptions: T,
    value: string
  ): string {
    return descriptions[value] || '';
  }

  /**
   * 根据枚举键获取备注
   * @param enumObj 枚举对象
   * @param descriptions 备注映射
   * @param key 枚举键
   * @returns 对应的备注信息
   */
  static getDescriptionByKey<T extends Record<string, string | number>, D extends Record<string, string>>(
    enumObj: T,
    descriptions: D,
    key: keyof T // 将 key 类型定义为 keyof T，确保类型安全
  ): string {
    const value = enumObj[key];
    return descriptions[value as string] || ''; // 强制将 value 转换为 string
  }
}
