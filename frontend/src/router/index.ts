import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), routes: [{
        path: '/', redirect: '/home',
    }, {
        path: '/home', name: 'home', component: () => {return import('@/components/Home.vue')}
    }, {
        path: '/player', name: 'player', component: () => {return import('@/components/Videoplayer.vue')}
    }, {
        path: '/login', name: 'login', component: () => {return import('@/components/Login.vue')}
    }, {
        path: '/register', name: 'register', component: () => {return import('@/components/Register.vue')}
    }, {
        path: '/upload', name: 'upload', component: () => {return import('@/components/User.vue')}
    }, {
        path: '/user', name: 'user', component: () => {return import('@/components/User.vue')}
    }, {
        path: '/edituser', name: 'edituser', component: () => {return import('@/components/EditUser.vue')}
    }, {
        path: '/about', name: 'about', component: () => {return import('@/components/About.vue')}
    }, {
        path: '/imprint', name: 'imprint', component: () => {return import('@/components/Imprint.vue')}
    }, {
        path: '/help', name: 'help', component: () => {return import('@/components/Help.vue')}
    },
    ], scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }

        return {top: 0};
    },
})

export default router
