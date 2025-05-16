import { type RouteRecordRaw, RouterView } from 'vue-router'

import QuestionnaireView from '@/views/questionnaire/Index.vue'

const routes: RouteRecordRaw = {
  path: 'questionnaire',
  component: QuestionnaireView,
  children: [
    {
      path: 'test',
      name: 'Q_Test',
      component: () => import('@/views/questionnaire/test/Index.vue'),
      meta: { keepAlive: true }
    },
    {
      path: 'result/query/:importId?',
      name: 'Q_Query',
      component: () => import('@/views/questionnaire/result/Index.vue'),
      meta: { keepAlive: true },
      props: true
    },
    {
      path: 'result/import',
      name: 'Q_Import',
      component: () => import('@/views/questionnaire/result/Import.vue'),
      meta: { keepAlive: true }
    },
    {
      path: 'standard',
      name: 'Q_Standard',
      component: () => import('@/views/questionnaire/standard/Index.vue'),
      meta: { keepAlive: true }
    }
  ]
}

export default routes

