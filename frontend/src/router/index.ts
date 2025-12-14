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
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/Register.vue'),
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('../components/Upload.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../components/User.vue'),
    },
    {
      path: '/edituser',
      name: 'edituser',
      component: () => import('../components/EditUser.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0 };
  },
})

export default router
