import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/**
 * routes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
const routes = [
    // handle invalid router
    // {
    //     path: '*', redirect: '/'
    // },

    // router list

    {
        path: '/',
        redirect: '/login'
    },

    {
        path: '/home',
        name: 'home',
        component: () => import('../views/HomePage.vue')
    },

    {
        path: '/home/:userId/',
        name: 'home',
        component: () => import('../views/HomePage.vue')
    },

    {
        path: '/home/:userId/:chatId',
        name: 'home',
        component: () => import('../views/HomePage.vue')
    },

    {
        path: '/home/:userId/c/:channelId',
        name: 'home',
        component: () => import('../views/HomePage.vue')
    },

    {
        path: '/home/:userId/o/:organizationId',
        name: 'home',
        component: () => import('../views/HomePage.vue')
    },

    {
        path: '/signup',
        name: 'signup',
        component: () => import('../views/SignUp.vue')
    },

    {
        path: '/login',
        name: 'login',
        component: () => import('../views/Login.vue')
    },

    {
        path: '/test',
        name: 'test',
        component: () => import('../views/TestView.vue')
    }


]

const router = new Router({
    routes,
    mode: "hash" // hash is the reason why router link has '#'
})

export default router


