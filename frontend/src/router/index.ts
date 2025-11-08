import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: () => import('../components/Home.vue'),
    },
    {
      path: '/player',
      name: 'player',
      component: () => import('../components/Videoplayer.vue'),
    },
  ],
})

export default router
