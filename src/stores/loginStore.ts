import { defineStore } from "pinia";

export const useLoginStore = defineStore("login", {
  state: () => ({
    account: "",
    isRemenber: false,
  }),
  actions: {
    setRemenber(account: string, isRemenber: boolean) {
      this.isRemenber = isRemenber;
      this.account = isRemenber ? account : '';
    },
  },
  persist: {
    // 持久化选项
    storage: window.localStorage, // 使用 localStorage
    key: 'loginStore', // 自定义键名
  },
});
