import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DefaultLayout from '../layout/components/default.vue'
import SettingRoutes from './settingManager/Index'
import QuestionnaireRoutes from './questionnaire/Index'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: 'home',
        name: 'home',
        component: HomeView
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
