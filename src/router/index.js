import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import HomeView from '../views/HomeView.vue'
import SnapshotsView from '../views/SnapshotsView.vue'
import LogsView from '../views/LogsView.vue'

const router = createRouter({
  // 브라우저에 자연스러운 주소 체계를 사용. /로 시작하는 주소 그거.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: HomeView,
    },
    {
      path: '/snapshots',
      name: 'snapshots',
      component: SnapshotsView,
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogsView,
    },
  ],
})

export default router