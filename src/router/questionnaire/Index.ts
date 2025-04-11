import { type RouteRecordRaw, RouterView } from 'vue-router'

const routes: RouteRecordRaw = {
  path: 'questionnaire',
  component: RouterView,
  children: [
    {
      path: 'test',
      name: 'Q_Test',
      component: () => import('@/views/questionnaire/test/Index.vue')
    },
    {
      path: 'result/query',
      name: 'Q_Query',
      component: () => import('@/views/questionnaire/result/Index.vue')
    },
    {
      path: 'result/import',
      name: 'Q_Import',
      component: () => import('@/views/questionnaire/result/Import.vue')
    },
    {
      path: 'standard',
      name: 'Q_Standard',
      component: () => import('@/views/questionnaire/standard/Index.vue')
    }
  ]
}

export default routes

