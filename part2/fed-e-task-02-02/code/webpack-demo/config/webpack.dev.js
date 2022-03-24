const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = {
  // watch:true,
  mode: "development", // 使编译后的代码便于观察
  target: "web", //防止浏览器兼容在 mode:'development'时冲突导致热更新失效
  devtool: "cheap-module-source-map", // 控制是否生成以及如何生成
  devServer: {
    publicPath: "/", // 指定本服务所在目录,默认为'/'即当前项目所在根目录,此时静态资源将被输出到'/lg'下边(虚拟目录),此时 output 资源还是原来路径找不到,所以官方强烈建议 output.publicPath 和 devServer.publicPath 设为一致
    contentBase: path.resolve(__dirname, "public"), // 打包之后的资源如果依赖其他资源,告知去找的路径 ,此处值为绝对路径,此时强烈建议把 引用该不打包资源的路径'./'改为'/',
    watchContentBase: true,

    // 其他配置
    hot: true,
    hotOnly: true, // 只对修改的地方热更新而不刷新页面,不希望组件被其他组件的语法错误影响时使用
    port: 4000,
    open: false,
    compress: true, // 开启服务端gzip压缩,提升性能,请求头中会带有信息Content-Encoding:gzip
    historyApiFallback: true, // 任意 404 响应都可能需要被替代为 index.html. 前端找不到页面时, 会向后端请求数据Cannot GET /about,此时是请求不到的,
    // 代理设置
    proxy: {
      // 开发阶段无法直接请求后端接口,存在跨域问题
      "/api": {
        target: "https://api.github.com", // 将/api 字段的请求代理到 github
        pathRewrite: { "^/api": "" }, // 将请求地址中的/api 重写为""
        changeOrigin: true, // 解决跨域请求问题(切换源为 target,浏览器无法查看到该变化)
      },
    },
  },
  plugins: [new ReactRefreshWebpackPlugin()],
};
