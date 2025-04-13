import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    _selectedKeys1: 0,
    _selectedKeys2: [['Q_Test'],['S_User']],
    _openKeys: [['Q_Result'],['S_Test']],
  }),
  actions: {
    setter(selectedKeys1: number, selectedKeys2: string[], openKeys: string[]) {
      this._selectedKeys1 = selectedKeys1
      this._selectedKeys2[this._selectedKeys1] = selectedKeys2
      this._openKeys[this._selectedKeys1] = openKeys
    },
    getter() {
      return (this._selectedKeys1, this._selectedKeys2[this._selectedKeys1], this._openKeys[this._selectedKeys1])
    },
    getSelectedKeys2(selectedKeys1:number){
      if(selectedKeys1 == undefined){
        selectedKeys1 = this._selectedKeys1
      }
      return this._selectedKeys2[selectedKeys1]
    },
    getOpenKeys(selectedKeys1:number){
      if(selectedKeys1 == undefined){
        selectedKeys1 = this._selectedKeys1
      }
      return this._openKeys[selectedKeys1]
    }
  },
  persist: {
    // 持久化选项
    storage: window.localStorage, // 使用 localStorage
    key: 'menuStore', // 自定义键名
  },
})