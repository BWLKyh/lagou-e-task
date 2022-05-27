import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/pages/Home'

Vue.use(VueRouter)

export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history', // 兼容前后端,hash 服务端不支持
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
      },
      {
        path: '/about',
        name: 'about',
        component: () => import('@/pages/About'), // 异步懒加载
      },
      {
        path: '/posts',
        name: 'posts',
        component: () => import('@/pages/Posts'),
      },
      {
        path: '*',
        name: 'error404',
        component: () => import('@/pages/404'),
      },
    ],
  })
  return router
}
