import { createRouter, createWebHashHistory } from 'vue-router'
import BuilderView from '@/views/BuilderView.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: BuilderView },
    {
      path: '/admin',
      component: () => import('@/views/AdminView.vue'),
    },
  ],
})
