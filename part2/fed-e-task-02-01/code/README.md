## 实现思路

gulp 原始方法搭建工作流->提取 gulp->使用 node-cli 封装工作流->发布->使用

## 具体步骤

1. 准备好项目文件夹,并进入该项目文件夹根目录
2. 安装依赖

```shell
$ git clone xx #地址
$ yarn add gulp --dev
$ yarn add gulp-sass --dev
$ yarn add node-sass --dev #gulp-sass新版本需手动指定,单独安装 node-sass,注意设置 npm 源
$ yarn add gulp-swig --dev #转换 html
$ yarn add gulp-babel --dev
$ yarn add @babel/core @babel/prest-env --dev
$ yarn add gulp-imagemin@6.1.0 --dev #高版本为 es 模块,有问题
$ yarn add del --dev
$ yarn add gulp-load-plugins --dev
$ yarn add browser-sync --dev
$ yarn add gulp-useref --dev
$ yarn add gulp-htmlmin gulp-uglify gulp-clean-css --dev
$ yarn add gulp-if --dev
```

3. 根目录新建 gulpfile.js

- js 代码详见 ../code/pages-boilerplate
- 代码思路:
  1. 引入依赖,gulp 插件可单独引入或使用 gulp-plugins 统一引入
  2. 设置 config 对象,并使用 try catch 块引入生产环境的配置文件 pages.config.js 中的数据
  3. 编写 clean 任务,使用 del 编译前先删除先前产生的文件
  4. 编写 style,page,script,image,font,extra 等子任务用于处理不同类型文件,具体实现为使用 gulp 中的 src 和 dest 作为 pipe 输入和输出,中间通过编译,转换管道处理文件流,最后返回结果
  5. 编写 serve 命令,通过 browser-sync 模块初始化一个 web 服务器对象,首先使用 gulp.watch 监视源文件的改动,并调用对应的子任务或使用 reload 刷新浏览器,最后设置端口 port,项目根目录 baseDir,静态资源路由 routes 等参数后进行初始化这个 web 服务器
  6. 编写 useref 命令.用于产生生产代码,在 gulp.src 读取文件后,使用 gulp-userref 指定路径转换构建注释,使用 gulp-if 判断匹配文件扩展名,使用对应插件处理编译压缩等工作(使用 gulp-uglify 处理 js 文件,使用 gulp-cleanCss 处理 css 文件,使用 htmlmin 处理 html 文件,)
  7. 以上任务的开发阶段编译后的文件默认放入临时目录 temp 中,生产代码放入 dist 中.地址均使用 config 中的数据.
  8. 使用 gulp 中的 parallel 和 series 组合使用上述命令,
     1. 编译命令 compile 使用 parallel 并行处理 style,script,page,
     2. 构建命令 build 使用 series 串行处理 clean 以及并行任务(包括一个串行任务 compile,useref;以及 image,font,extra 等处理任务),
     3. 开发命令 develop 使用 compile 和 serve 并行.
     4. 最终导出必要的命令 clean,build,develop 等

4. 使用 yarn gulp xx(导出的命令)测试
5. 提取多个项目共同的自动化构建过程封装进一个模块
   github 新建仓库->复制链接->本地新建文件夹(此处为 pages-demo 目录)->安装脚手架->使用脚手架创建目录结构->进入创建好的项目目录->

```shell
$ git init
$ git remote add origin xx #仓库地址
$ git add
$ git commit -m "feat:initial commit"
$ git push -u origin master
```

6. 提取 gulpfile

```shell
$ code . -a #将 cli 生成的目录结构项目和 本项目放到统一 vscode 中
```

- 本项目
  1. gulpfile.js 剪切到 pages-demo 项目 lib/index.js 中
  2. package.json 中的"devDependencies"剪切到 pages-demo 项目 packag.json 中的 dependencies
  - 开发依赖转为生产依赖
  3. 删除 node_module
- pages-demo 项目
  1. 注意 "main": "lib/index.js",
  2. yarn, 安装依赖
  3. yarn link (本地调试)
- 本项目
  1. yarn link "pages" ,出现新的 node_module
  2. yarn,安装 dependencies 里的依赖
  3. gulpfile.js 中:
  ```javascript
  module.exports = require("pages-demo"); // 使用 pages-demo项目导出的 gulpfile
  ```
  4. yarn add gulp-cli --dev
  5. yarn add gulp --dev,使项目跑起来,但发布后再安装不需要,此时问题出现,data 路径等问题需解决
  6. 添加 pages.config.js
  ```javascript
  module.exports = {
    data: {}, //之前定义的 data
  };
  ```
- pages-demo 项目
  1. lib/index.js 改造
  ```javascript
  // const data = require("./data");
  const cwd = process.cwd();
  let config = {
    // default config
  };
  try {
    const loadConfig = require(`${cwd}/pages.config.js`);
    config = Object.assign({}, config, loadConfig);
  } catch (e) {}
  // 将下面的 data 改造成 data: config.data
  ```
  2. 此时出现问题: Cannot find package '@babel/preset-env'
  - 将 lib/index.js 中的'@babel/preset-env'替换为`require('@babel/preset-env')`
- 本项目
  1. yarn build 成功启动

7. 封装工作流-抽象路径配置

- pages-demo 项目
  1. lib/index.js 改造,路径统一配置到 data 中
- 本项目
  1. 修改 pages.config.js 中的路径数据

8. 消除 gulpfile.js

- 首先,可以指定 gulpfile 路径: yarn gulp --gulpfile ./node_modules/pages-demo/lib/index.js --cwd .
- 改造 -> pages-demo 项目中

  1. 添加 bin/pages-demo.js (cli 入口文件,所以需要文件头及 755 权限)

  ```javascript
     #!/usr/bin/env node
     process.argv.push("--cwd");
     process.argv.push(process.cwd());
     process.argv.push("--gulpfile");
     process.argv.push(require.resolve(".."));

     require("gulp/bin/gulp");

  ```

  2. package.json 中添加:
  1. "bin":"bin/pages-demo.js", - node_modules/.bin/gulp.cmd 中指明:gulp 命令是通过 gulp/bin/gulp 运行的
  1. "files":["lib","bin"],git 发布时默认发布根目录及 package.json 中配置的 file 对应的目录
  1. 重新 link,把 cli 注册到全局

- 在本项目中测试 pages-demo build
-

9. 发布并使用模块

```shell
$ git add .
$ git commit -m "feat:initial commit"
$ git push -u origin master
$ yarn publish # 注意重名改 package.json,如果用淘宝镜像源发布可以去查找发布的包点击同步
```

## 测试使用

新建 new-demo,将 public,src,pages.config.js 等目录结构复制过来

```shell
$ yarn init
$ yarn add @bwlkyh/pages-demo --dev
$ yarn pages-demo build #或者将命令写入scripts: build:"pages-demo build"后使用命令 yarn build
```
