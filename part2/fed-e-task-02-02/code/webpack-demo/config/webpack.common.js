const HtmlWebpackPlugin = require("html-webpack-plugin");
const resolveApp = require("./paths");
const { merge } = require("webpack-merge");
// 导入其他配置
const prodConfig = require("./webpack.prod");
const devConfig = require("./webpack.dev");
// 定义对象保存 base 配置信息
const commonConfig = {
  entry: "./src/index.js", // 文件位置更改后使用相对路径的不出错
  // context: 默认值是 script 指令中的/config/webpack.common.js 中的/(文件所在文件夹所在文件夹目录),因为 entry 相对路径是相对于 context 而言的,所以上面 entry 不修改不出错
  resolve: {
    extensions: [".js", ".json", ".ts", ".jsx", ".vue"], // 没有扩展名时的补充设置
    alias: {
      // "@": path.resolve(__dirname, "../src"), // 需改:"src"=>"../src"
      "@": resolveApp("./src"),
    },
  },
  output: {
    filename: "build.js",
    //   path: path.resolve(__dirname, "../dist"), // 必须使用绝对路径
    "@": resolveApp("./dist"),
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
    new HtmlWebpackPlugin({
      title: "html-webpack-plugin",
      template: "./public/index.html",
    }),
    // new DefinePlugin({
    //   BASE_URL: '"./"',
    // }),
  ],
};

module.exports = (env) => {
  const isProduction = env.production;

  process.env.NODE_ENV = isProduction ? "prodConfig" : "devConfig"; // 将环境变量写入进程中,这里访问不到项目里的进程环境,只能此处手动处理
  // 依据当前的打包模式来合并配置
  const config = isProduction ? prodConfig : devConfig;
  return merge(commonConfig, config);
};
