import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    baseURL: "http://localhost:5165",
  }),
  actions: {
    setBaseURL(value: string) {
      this.baseURL = value;
    },
  },
});
