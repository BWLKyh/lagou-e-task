const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')

const resolve = (file) => path.resolve(__dirname, file) // 获得绝对安全的文件路径

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise((r) => (ready = r))
  // 监视构建->更新 renderer
  let template
  let serverBundle
  let clientManifest

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }
  // 监视构建 template -> 调用 update-> 更新 Renderer 渲染器
  const templatePath = path.resolve(__dirname, '../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  // fs.watch, fs.watchFile可以监视, 更推荐chokidar
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()
  })

  // 监视构建 serverBundle -> 调用 update-> 更新 Renderer 渲染器
  const serverConfig = require('./webpack.server.config')
  const serverCompiler = webpack(serverConfig)
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent', // 关闭日志输出,由 FriendlyErrorsWebpackPlugin 处理
  })
  serverCompiler.hooks.done.tap('server', () => {
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(
        resolve('../dist/vue-ssr-server-bundle.json'),
        'utf-8'
      )
    )
    console.log('服务端')
    update()
  })
  /**
   * devMiddleware自动监视,以下步骤不需要
   */
  // serverCompiler.watch({}, (err, stats) => {
  //   //自动监视资源变动
  //   if (err) throw err // 配置错误等
  //   if (stats.hasErrors()) return // 自己 代码错误,但不需要中断退出
  //   serverBundle = JSON.parse(
  //     fs.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8')
  //   )
  //   update()
  // })

  // 监视构建 clientManifest -> 调用 update-> 更新 Renderer 渲染器

  const clientConfig = require('./webpack.client.config')
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?quiet=true&reload=true', // 和服务端交互处理热更新的一个客户端脚本, 配置参数使关闭日志, 如果热更新卡住直接刷新页面
    clientConfig.entry.app,
  ]
  clientConfig.output.filename = '[name].js' // 热更新下确保一致的 hash
  const clientCompiler = webpack(clientConfig)
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath, // 配置前置路径
    logLevel: 'silent', // 关闭日志输出,由 FriendlyErrorsWebpackPlugin 处理
  })
  clientCompiler.hooks.done.tap('client', () => {
    clientManifest = JSON.parse(
      clientDevMiddleware.fileSystem.readFileSync(
        resolve('../dist/vue-ssr-client-manifest.json'),
        'utf-8'
      )
    )
    console.log('客户端')
    update()
  })
  server.use(
    hotMiddleware(clientCompiler, {
      log: false, // 关闭热更新日志
    })
  )
  // 重要: 将 clientDevMiddleware 挂载到 Express 服务中,提供对其内部如内存中数据的访问, 否则无法访问 dist 目录
  server.use(clientDevMiddleware)
  return onReady
}
