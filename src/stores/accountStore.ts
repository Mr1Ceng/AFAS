import { defineStore } from "pinia";

export const useAccountStore = defineStore("account", {
  state: () => ({
    account: "",
    isRemenber: false,
    token: "",
    user: {
      userName: '',
      userId: '',
      userAccount: '',
      nickName: '',
      avatarUrl: '',
      gender: '',
      age: 0,
      mobile: '',
      isDeveloper: false,
      isStaff: false,
    }
  }),
  actions: {
    setRemenber(account: string, isRemenber: boolean) {
      this.isRemenber = isRemenber;
      this.account = isRemenber ? account : '';
    },
    setToken(value: string) {
      this.token = value;
    },
    setUser(value: any) {
      this.user = value;
    },
  },
  persist: {
    // 持久化选项
    storage: window.localStorage, // 使用 localStorage
    key: 'accountStore', // 自定义键名
  },
});
