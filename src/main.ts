import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate';

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue';

const pinia = createPinia();
// 使用持久化插件
pinia.use(piniaPersistedstate);

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { far } from '@fortawesome/free-regular-svg-icons';

/* add icons to the library */
library.add(far)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia)
app.use(router)

app.use(Antd).mount('#app')
