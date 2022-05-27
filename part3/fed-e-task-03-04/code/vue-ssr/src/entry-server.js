/**
 * 服务端启动入口
 */
import { createApp } from './app'
// export default (context) => {
//   // 因为有可能会是异步路由钩子或组件,所以我们将返回一个 Promise,
//   // 以便服务器能够等待所有内容在渲染前就已经准备就绪
//   return new Promise((resolve, reject) => {
//     const { app, router } = createApp()
//     // 设置服务器端 router 的位置
//     router.push(context.url)
//     // 等到 router 将可能的异步组件和钩子函数解析完
//     router.onReady(() => {
//       const matchedComponents = router.getMatchedComponents()
//       // 匹配不到的路由, 执行 reject 函数,并返回 404, 这里因为写了 404 页面所以不需要这里处理
//       if (!matchedComponents.length) {
//         return reject({ code: 404 })
//       }
//       // Promise 应该 resolve 应用程序实例,以便可以渲染
//       resolvue(app)
//     }, reject)
//   })
// }

// 清爽写法, async 函数默认返回 promise
export default async (context) => {
  // 因为有可能会是异步路由钩子或组件,所以我们将返回一个 Promise,
  // 以便服务器能够等待所有内容在渲染前就已经准备就绪
  const { app, router, store } = createApp()
  const meta = app.$meta()
  // 设置服务器端 router 的位置
  router.push(context.url)
  // 先拿页面后拿 meta 信息
  context.meta = meta
  // 等到 router 将可能的异步组件和钩子函数解析完

  // new Promise((resolve,reject)=>{
  //   router.onReady(resolve,reject)
  // }) // 等价于下面写法
  await new Promise(router.onReady.bind(router))
  // 不需要再写 onReady 里, 默认会把返回值处理成 promise

  // 服务端渲染完毕后调用
  context.rendered = () => {
    /**
     * Render会把 context.state数据对象内联到页面模板中
     * 最终发送给客户端的页面中就饿会包含一段脚本:window.__INITAL_STATE__=context.state(数据)
     * 客户端就把页面中的 window.__INITAL_STATE__拿出来填充到客户端 store 容器中
     */
    context.state = store.state
  }
  return app
}
