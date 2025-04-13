import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const pinia = createPinia();
// 使用持久化插件
pinia.use(piniaPersistedstate);

const app = createApp(App)

app.use(pinia)
app.use(router)

app.use(Antd).mount('#app')
