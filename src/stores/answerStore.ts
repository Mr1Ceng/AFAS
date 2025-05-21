import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAnswerStore = defineStore('answer', {
  state: () => ({
    _answerId: "",
    _user: {
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
    },
  }),
  actions: {
    setAnswerId(answerId: string) {
      this._answerId = answerId
    },
    setUser(user: any) {
      this._user = user
    },
  }
})