const path = require("path");
const { DefinePlugin } = require("webpack");

const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin"); // 15+版本需要
module.exports = {
  // watch:true,
  mode: "development", // 使编译后的代码便于观察
  target: "web", //防止浏览器兼容在 mode:'development'时冲突导致热更新失效
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
  resolve: {
    extensions: [".js", ".json", ".ts", ".jsx", ".vue"], // 没有扩展名时的补充设置
    alias: {
      "@": path.resolve(__dirname, "src"), // 路径别名
    },
  },
  entry: "./src/index.js", // 可使用相对路径
  devtool: " source-map", // 控制是否生成以及如何生成
  output: {
    filename: "build.js",
    path: path.resolve(__dirname, "dist"), // 必须使用绝对路径
    // assetModuleFilename:'img/[name].[hash:4][ext]' // 使用 webpack5 内置模块处理时可在此处统一指定输出路径及名称
    publicPath: "/", // index.html内部引用路径, 不写就是空字符串.默认会补'/',如果不想自动补,可以写'/',但如果此时执行 build 无法直接访问静态资源,可以改成'./'(相对路径),此时开发环境找不到,  域名+publicPath+filename,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader", //从右往左,从上往下
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  // require('autoprefixer'),
                  require("postcss-preset-env"),
                  // 'postcss-preset-env' 简写
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1, // 导入 css 文件时,向前 1 步处理
            },
          },
          "postcss-loader", //将配置写入 postcss.config.js 中后就可省略上面的配置
          "less-loader",
        ],
      },
      {
        test: /\.(png|svg|gif|jpe?g)$/,
        // use: ["file-loader"],
        // js  require 引入时不加.default 的写法
        // use: [{
        //     loader:"file-loader",
        //     options:{
        //         esModule:false // 不转为 esModule
        //     }
        // }],

        // md4 哈希生成的默认名称,可指定
        use: [
          {
            loader: "file-loader",
            options: {
              /*
                    常见占位符
                    [ext]:扩展名
                    [name]:文件名
                    [hash]:文件内容
                    [contentHash]:与 hash 相同
                    [hash:<length>]
                     */
              name: "img/[name].[hash:6].[ext]",
              // outputPath:'img'
              limit: 25 * 1024, //超过 25k 文件直接拷贝,否则转 base64uri
            },
          },
        ],
      },
      {
        // 第二种用法(file-loader)
        test: /\.(png|svg|gif|jpe?g)$/,
        type: "asset/resource",
        generator: {
          filename: "img/[name].[hash:4][ext]",
        },
      },
      {
        // 第三种用法(url-loader)
        test: /\.(png|svg|gif|jpe?g)$/,
        type: "asset/inline",
      },
      {
        // 第四种用法(根据图片大小判断)
        test: /\.(png|svg|gif|jpe?g)$/,
        type: "asset",
        generator: {
          filename: "img/[name].[hash:4][ext]",
        },
        parser: {
          dataUrlCondition: {
            maxSize: 30 * 1024,
          },
        },
      },
      {
        test: /\.(ttf|woff2?)$/,
        type: "asset/resource",
        generator: {
          filename: "font/[name].[hash:3][ext]",
        },
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              // plugins:[
              //   ' @babel/plugin-transform-arrow-functions',
              //   '@babel/plugin-transform-block-scoping '
              // ],
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: "chrome 91",
                  },
                ],
              ], // 会根据.browserslistrc 文件中的配置确定是否要转换,可自设 targets
            },
          },
        ],
      },
      {
        // 写入配置文件后
        test: /\.js$/,
        exclude: /node_modules/, // 忽略依赖中的 js
        use: ["babel-loader"],
      },
      // 将之前的匹配 js 处理规则去掉
      {
        test: /\.jsx?$/,
        use: ["babel-loader"],
      },
      {
        test: /\.vue$/,
        use: ["vue-loader"],
      },
      {
        test: /\.ts$/,
        // use:["ts-loader"] // 只是将 ts 转换为 js,没有转换高级语法
        use: ["babel-loader"],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "html-webpack-plugin",
      template: "./public/index.html",
    }),
    new DefinePlugin({
      BASE_URL: '"./"',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          globOptions: {
            ignore: ["**/index.html"], // 从 from 指定的 目录开始查找资源
          },
        },
      ],
    }),
    new ReactRefreshWebpackPlugin(),
    new VueLoaderPlugin(),
  ],
};
