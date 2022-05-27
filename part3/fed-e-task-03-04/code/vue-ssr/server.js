const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')

const server = express()
// 当访问/dist 下的资源时,强制去 dist 目录中查找并返回, 仅处理物理磁盘中的资源文件
server.use('/dist', express.static('./dist'))

const isProd = process.env.NODE_ENV === 'production'

let renderer
let onReady
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest,
  })
} else {
  // 开发模式->监视打包构建->重新生成 Renderer 渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest,
    })
  })
}

// const render = (req, res) => {
//   renderer.renderToString(
//     {
//       title: '测试标题',
//       meta: `<meta name="description" content="测试媒体">`,
//       url: req.url, // rendertoString第一个参数就是entry-server 中的参数 context, 是创建的 vue 实例,所以在此处设置 url
//     },
//     (err, html) => {
//       if (err) {
//         return res.status(500).end('Internal Server Error.')
//       }
//       res.setHeader('Content-Type', 'text/html; charset=utf8')
//       res.end(html)
//     }
//   )
// }

const render = async (req, res) => {
  try {
    const html = await renderer.renderToString({
      title: '测试标题',
      meta: `<meta name="description" content="测试媒体">`,
      url: req.url,
    })
    res.setHeader('Content-Type', 'text/html; charset=utf8')
    res.end(html)
  } catch (err) {
    console.log('有错误', err)
    res.status(500).end('Internal Server Error.')
  }
}

// 让所有路由进入此处,所以用*取代/
server.get(
  '*',
  isProd
    ? render
    : async (req, res) => {
        await onReady
        render(req, res)
      }
)
server.listen(3000, () => {
  console.log('server running at port 3000.')
})
