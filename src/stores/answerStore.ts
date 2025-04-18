import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAnswerStore = defineStore('answer', {
  state: () => ({
    _answerId: "",
  }),
  actions: {
    setAnswerId(answerId: string) {
      this._answerId = answerId
    },
    getAnswerId() {
      return this._answerId
    },
  }
})