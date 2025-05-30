import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import DefaultLayout from '../layout/components/default.vue'
import SettingRoutes from './settingManager/Index'
import QuestionnaireRoutes from './questionnaire/Index'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '/',
        redirect: { name: 'login' }
      },
      SettingRoutes,
      QuestionnaireRoutes
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/Index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
