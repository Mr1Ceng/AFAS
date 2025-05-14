import { type RouteRecordRaw, RouterView } from 'vue-router'

const routes: RouteRecordRaw = {
  path: 'setting',
  component: RouterView,
  children: [
    {
      path: 'user',
      name: 'S_User',
      component: () => import('@/views/settingManager/user/Index.vue')
    },
    {
      path: 'questionnaire',
      name: 'S_Questionnaire',
      component: () => import('@/views/settingManager/questionnaire/Index.vue')
    },
    {
      path: 'questionnaire/spiramaze',
      name: 'S_SpiralMaze',
      component: () => import('@/views/settingManager/questionnaire/SpiralMazeIndex.vue')
    },
    {
      path: 'questionnaire/standard',
      name: 'S_Standard',
      component: () => import('@/views/settingManager/questionnaire/EvaluationStandardIndex.vue')
    }
  ]
}

export default routes

