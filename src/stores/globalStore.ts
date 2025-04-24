import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    baseURL: "http://localhost:5165",
    isDarktheme: false,
  }),
  actions: {
    setBaseURL(value: string) {
      this.baseURL = value;
    },
    changeTheme() {
      this.isDarktheme = !this.isDarktheme;
    },
  },
});
