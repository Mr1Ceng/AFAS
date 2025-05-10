import { generateColumns } from '@/utils/TableHelper'

/**
 * 用户查询行数据
 */
export interface UserQueryRow {
  userId: string; // 用户编码
  userName: string; // 用户姓名
  nickName: string; // 昵称
  avatarUrl: string; // 用户头像
  gender: string; // 性别
  age: number; // 年龄
  password: string; // 登录密码
  account: string; // 用户名
  mobile: string; // 联系电话
  role: string; // 用户角色
  isDeveloper: boolean; // 是否开发者
}

/**
 * 映射字段名称
 */
export const UserFieldMap: Record<keyof UserQueryRow, string> = {
  userId: "用户编码",
  userName: "用户姓名",
  nickName: "昵称",
  avatarUrl: "用户头像",
  gender: "性别",
  age: "年龄",
  password: "登录密码",
  account: "用户名",
  mobile: "联系电话",
  role: "用户角色",
  isDeveloper: "是否开发者",
};

/**
 * 生成 Ant Design Table 组件的 `columns` 数组
 */
export const UserColumns = generateColumns<UserQueryRow>(UserFieldMap);
