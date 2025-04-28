import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    baseURL: "http://localhost:5000",
    isDarktheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
    token: "",
  }),
  actions: {
    setBaseURL(value: string) {
      this.baseURL = value;
    },
    setToken(value: string) {
      this.token = value;
    },
    changeTheme() {
      this.isDarktheme = !this.isDarktheme;
    },
  },
});
