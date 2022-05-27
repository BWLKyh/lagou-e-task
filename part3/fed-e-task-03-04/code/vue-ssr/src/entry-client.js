/**
 * 客户端入口
 */
import { createApp } from './app'
// 客户端特定引导逻辑
const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// 这里假定 App.vue模板中根元素具有`id=app`
// 处理路由时,仍要在挂载 app 前调用 router.onReady,因为路由器必须要提前解析路由配置中的异步组件,才能正确调用组件中可能存在的路由钩子,所以此处使用 onReady
router.onReady(() => {
  app.$mount('#app')
})
