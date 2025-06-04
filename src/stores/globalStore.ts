import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    config: { baseURL: "" },
    isDarkTheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
  }),
  actions: {
    setConfig(value: any) {
      this.config = value;
    },
    changeTheme() {
      this.isDarkTheme = !this.isDarkTheme;
    },
  },
});
