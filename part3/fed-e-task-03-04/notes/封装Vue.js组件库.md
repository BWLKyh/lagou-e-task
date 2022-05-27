# 组件化幵发

### 课程目标

#### 开源组件库

- Element-UI
- iView

### CDD(Component-Driven Development)组件驱动开发

- 自下而上
- 从组件级别开始，到页面级别结束

### CDD 的好处

- 组件在最大程度被重用
- 并行开发
- 可视化测试

### 课程介绍

- 处理组件的边界情况
- 快速原型开发 组件开发
- Storybook
- Monorepo
- 基于模板生成包的结构
- Lerna + yarn workspaces 组件测试
- Rollup 打包
- 处理组件边界情况

### 处理组件的边界情况

- $root
  小型项目获取 $root 响应式数据(可直接赋值改变)很方便,但后期难以维护
- $parent/$children
  prop 获取的成员不允许直接修改, $parent/$children 和$root 可直接修改
- $refs
  获取单个子组件, 但要在子组件中写 ref 获取表单组件等,调用 validate 方法

```javascript
this.$refs[formName].validate((valid) => { if (valid) {
    alert('submit!');
  } else {
    console.log(1 error submit!!1);
  return false;
  }
})；
```

- 依赖注入 provide / inject
  父组件提供 provide 方法, 子组件使用 inject['name','name2']接收
- $attrs/$listeners
  - $attrs
    把父组件中非 prop 属性绑定到内部组件
- $listeners
  把父组件中的 DOM 对象的原生事件绑定到内部组件

```vue
<template>
  <!--
    1. 从父组件传给自定义子组件的属性，如果没有 prop 接收
       会自动设置到子组件内部的最外层标签上
       如果是 class 和 style 的话，会合并最外层标签的 class 和 style 
  -->
  <!-- <input type="text" class="form-control" :placeholder="placeholder"> -->

  <!--
    2. 如果子组件中不想继承父组件传入的非 prop 属性，可以使用 inheritAttrs 禁用继承
       然后通过 v-bind="$attrs" 把外部传入的非 prop 属性设置给希望的标签上

       但是这不会改变 class 和 style
  -->
  <!-- <div>
    <input type="text" v-bind="$attrs" class="form-control">
  </div> -->

  <!--
    3. 注册事件(父组件把处理函数传递给子组件)
  -->

  <!-- <div>
    <input
      type="text"
      v-bind="$attrs"
      class="form-control"
      @focus="$emit('focus', $event)"
      @input="$emit('input', $event)"
    >
  </div> -->

  <!--
    4. $listeners(把所有绑定到组件本身的属性和方法绑定到 input 中)
  -->

  <div>
    <input type="text" v-bind="$attrs" class="form-control" v-on="$listeners" />
  </div>
</template>

<script>
export default {
  // props: ['placeholder', 'style', 'class']
  // props: ['placeholder']
  inheritAttrs: false,
}
</script>

<style></style>
```

### 快速原型开发

- VueCLI 中提供了一个插件可以进行原型快速幵发
- 需要先额外安装一个全局的扩展
  `npm install -g @vue/cli-service-global`
- 使用 `vue serve` 快速查看组件的运行效果
- vue -V 显示 vue-cli 版本是 5+, 则官方文档表示已移除,建议使用 vite 开发

#### vue serve

- vue serve 如果不指定参数默认会在当前目录找以下的入口文件
  main.js、index.js、App.vue、app.vue
- 可以指定要加载的组件
  vue serve ./src/login.vue

#### 快速原型开发 Element-UI

安装 ElementUI

- 初始化 package.json
  `npm init -y`
- 安装 ElementUI
  `vue add element`
- 加载 ElementUI 使用 Vue.use() 安装插件
- vue serve 运行时会自动创建 index.html 包含#app 的 div

### 组件开发

组件分类

- 第三方组件: 如 ElementUI
- 基础组件: 自己公司内部使用的组件
- 业务组件: 根据特定业务场景需要定制的组件

整体结构
•Form
•FormItem
•Input
•Button

- 流程
  Input 组件验证
  •Input 组件中触发自定义事件 validate
  •FormItem 渲染完毕注册自定义事件 validate

#### Monorepo

两种项目的组织方式

- Multirepo(Multiple Repository)
  每一个包对应一个项目
- Monorepo(Monolithic Repository)
  一个项目仓库中管理多个模块/包
  目录结构
  > packages
  >
  > > button
  > >
  > > > _test_
  > > > dist
  > > > src
  > > > index.js
  > > > LICENSE
  > > > package.json
  > > > README.md
  > > > form
  > > > form item
  > > > input
  > > > steps

#### Storybook

- 可视化的组件展示平台
- 在隔离的开发环境中，以交互式的方式展示组件
- 独立开发组件
- 支持的框架

  - Reacts React Native、Vue、Angular、
  - Ember、HTML、Svelte、Mithrik Riot

- Storybook 安装

  - 自动安装
    `npx -p @storybook/cli sb init --type vue`
    `yarn add vue@2.6.11`
    `yarn add vue-loader@15.9.3 vue-template-compiler@2.6.11 --dev`
  - 手动安装
    自行查阅文档

- Storybook 使用

1. 创建 packages, 按上一步的目录结构组织代码
2. 创建 stories/button.stories.js, 按语法编写故事代码
3. 修改.storybook/main.js 配置
   ```javascript
   module.exports = {
     stories: [
       // '../stories/**/*.stories.mdx',
       '../packages/**/*.stories.js',
       // ...
     ],
     // ...
   }
   ```
4. yarn storybook 启动并查看

#### yarn workspaces

每个包中的 package.json 中记录自己的依赖, 常规情况每个包安装各自的依赖, 开启 yarn workspaces 后,统一在根目录下统一管理项目依赖, 相同版本重复依赖只下载一次, 不同版本在包内安装依赖

1. 开启 yarn 的工作区

- 项目根目录的 package.json

```json
"private": true, // 组件库开发完毕后要发布到 npm, 而工作区根目录一般是脚手架, 不需要发布, 设置 true防止把当前根目录下的内容进行提交
"workspaces":[
  "packages/*" //设置工作区中的子目录
]
```

2. yarn workspaces 使用

- 给工作区根目录安装开发依赖
  `yarn add jest-D -W`
- 给指定工作区安装依赖(此处的 lg-button 是在包内 package.json 中设置的包名,不是文件夹名)
  `yarn workspace lg-button add lodash@4`
- 给所有的工作区安装依赖(全自动)
  `yarn install`
- yarn workspace 还可以执行所有的 scripts
- monorepo 的项目结构,一般都会配合 yarn workspaces 来管理包的依赖

#### Lerna 介绍

- Babel 自己用来维护自己的 monorepo 并开源出的项目

1. Lerna 是一个优化使用 git 和 npm 管理多包仓库的工作流工具, 用于管理具有多个包的 JavaScript 项目
2. 它可以一键把代码提交到 git 和 npm 仓库
3. 也可以管理包依赖,通过配置选择 yarn 或 npm

- Lerna 使用

1. 全局安装
   `yarn global add lerna`

- 初始化
  `lerna init`
  1. 如果当前没有进行 git 管理,会使用 git init 初始化
  2. 在项目根目录创建 lerna.json 配置文件
  3. 在 leran.json 中添加开发依赖
- 发布
  1. 首先在 github 初始化一个远程仓库
  2. 登录到 npm
  3. `lerna publish`, 同时把项目提交到 github,并把所有包发布到 npm

#### Vue 组件的单元测试

组件单元测试好处

- 提供描述组件行为的文档
- 节省手动测试的时间
- 减少研发新特性时产生的 bug -改进设计
- 促进重构

- 安装依赖
  - Vue Test Utils
  - Jest 但不支持单元组件, 使用 vue-jest 预处理成 js, es6+新特性等需要 babel-jest 处理
  - vue-jest
  - babel-jest
- 安装
  `yarn add jest @vue/test-utils@1 vue-jest babel-jest -D -W`
  vue/test-utils v1 针对 vue2, v2 针对 vue3
  -W 表示安装在工作区根目录中
- package.json

```json
"scripts": {
  "test": "jest",
}
```

- Jest 配置文件
  jest.config.js

```javascript
module.exports = {
  testMatch: ['**/_tests_/**/*.[jt]s?(x)'], // 测试文件位置
  moduleFileExtensions: [
    'js',
    'json',
    // 告诉 Jest 处理 `*.vue` 文件
    'vue',
  ],
  transform: {
    // 用'vue-jest' 处理 '_.vue' 文件
    '.*\\.(vue)$': 'vue-jest',
    // 用'babel-jest' 处理 js
    '.*\\.(js)$': 'babel-jest',
  },
}
```

- Babel 配置文件
  babel.config.js

```javascript
module.exports = {
  presets: [['@babel/preset-env']],
}
```

当前安装的 babel7, vue-test 依赖 babel6, 运行时提示找不到 babel,解决需要使用 babel 桥接

- Babel 桥接
  `yarn add babel-core@bridge -D -W`

### Vue 组件的单元测试

#### Jest 常用 API

- 全局函数
  - describe(name, fn) 把相关测试组合在一起
  - test(name, fn) 测试方法
  - expect(value) 断言
- 匹配器
  - toBe(value) 判断值是否相等
  - toEqual(obj) 判断对象是否相等
  - toContain(value) 判断数组或者字符串中是否包含
- 快照
  - toMatchSnapshot()

#### Vue Test Utils 常用 API

- mount() 创建一个包含被挂载和渲染的 Vue 组件的 Wrapper
- Wrapper
  - vm wrapper 包裹的组件实例
  - props() 返回 Vue 实例选项中的 props 对象
  - html() 组件生成的 HTML 标签
  - find() 通过选择器返回匹配到的组件中的 DOM 元素
  - trigger() 触发 DOM 原生事件，自定义事件 wrapper.vm.$emit()

### Rollup 打包

- Rollup 是一个模块打包器
- Rollup 支持 Tree-shaking, 可静态分析代码中未使用的代码并排除, webpack 虽然也支持,但需配置,且打包结果更臃肿
- 打包的结果比 Webpack 要小
- 开发框架/组件库的时候使用 Rollup 更合适

#### 安装依赖

- Rollup
- rollup-plugin-terser 压缩
- rollup-plugin-vue@5.1.9 指定版本, 后续版本是对 vue3 打包
- vue-template-compiler

#### 单个包打包

安装
`yarn add rollup rollup-plugin-terser rollup-plugin-vue@5.1.9 vue-template-compiler -D -W`
package.json 中写入

```json
  "scripts": {
    "build": "rollup -c"
  },
```

在包中写入 rollup.config.js

```javascript
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
module.exports = [
  {
    input: 'index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
      },
    ],
    plugins: [
      vue({
        css: true,
        compileTemplate: true,
      }),
      terser(),
    ],
  },
]
```

执行 build
`yarn workspace bwlkyh-lg-button run build`

#### 统一 Rollup 打包

还需安装
`yarn add @rollup/plugin-json rollup-plugin-postcss @rollup/plugin-node-resolve -D -W`
项目根目录中创建 rollup.config.js

```javascript
import fs from 'fs'
import path from 'path'
import json from '@rollup/plugin-json'
import vue from 'rollup-plugin-vue'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const isDev = process.env.NODE_ENV !== 'production'

// 公共插件配置
const plugins = [
  vue({
    // Dynamically inject css as a <style> tag
    css: true,
    // Explicitly convert template to render function
    compileTemplate: true,
  }),
  json(),
  nodeResolve(),
  postcss({
    // 把 css 插入到 style 中
    // inject: true,
    // 把 css 放到和js同一目录
    extract: true,
  }),
]

// 如果不是开发环境，开启压缩
isDev || plugins.push(terser())

// packages 文件夹路径
const root = path.resolve(__dirname, 'packages')

module.exports = fs
  .readdirSync(root)
  // 过滤，只保留文件夹
  .filter((item) => fs.statSync(path.resolve(root, item)).isDirectory())
  // 为每一个文件夹创建对应的配置
  .map((item) => {
    const pkg = require(path.resolve(root, item, 'package.json'))
    return {
      input: path.resolve(root, item, 'index.js'),
      output: [
        {
          exports: 'auto',
          file: path.resolve(root, item, pkg.main),
          format: 'cjs',
        },
        {
          exports: 'auto',
          file: path.join(root, item, pkg.module),
          format: 'es',
        },
      ],
      plugins: plugins,
    }
  })
```

package.json 中配置脚本

```json
  "scripts": {
    "build": "rollup -c"
  },
```

注意:每个包的 package.json 中都需要配置

```json
{
  "main": "dist/cjs/index.js",
  "module": "dist/es/index.js"
  // ...
}
```

`yarn build`
注意: postcss 已升级, rollup-plugin-postcss 4 安装后续独立安装 postcss(8)
`yarn add postcss -D -W`

#### 设置环境变量

需要一个第三方包 cross-env,可以跨平台设置环境变量
`yarn add cross-env -D -W`
修改 package.json

```json
  "scripts": {
    "build:prod": "cross-env NODE_ENV=production rollup -c",
    "build:dev": "cross-env NODE_ENV=development rollup -c"
  },
```

启动上述命令测试

#### 清理

- .storybook 初始化 storybook 时生成的
- storybook-static 演示 storybook 打包时生成的
- 清理所有 node_module
  package.json 配置
  ```json
    "scripts": {
      "clean":"lerna clean"
    },
  ```
- 删除所有 dist
  使用第三方库 rimraf 可清理任意文件夹
  `yarn add rimraf -D -W`
  给每个包中的 package.json 配置
  ```json
    "scripts": {
      "del": "rimraf dist"
    },
  ```
  `yarn workspaces run del`

### 基于模板生成组件基本结构

我们创建了 monorepo 项目目录结构,在一个项目中管理多个包,这种方式更适合我们管理组件库和发布每个组件,使用 storybook 搭建项目,让用户快速预览组件,使用 yarn workspaces 管理所有包的依赖,使用 lerna 发布项目,他可以把每个包发布到 npm 上,最后演示了测试和打包, 但如果创建新组件,可用以下方式

#### plop

安装
`yarn add plop -W -D`
编写模板
plop-template
配置文件
plopfile.js
添加运行脚本

```json
    "scripts": {
      "plop":"plop"
    },
```

运行

### 发布

编写测试文件并测试通过
打包 `yarn build:prod`
git add .
git commit -m ""
yarn lerna

---

错题

```
下列哪些说法是正确的是(AC)
A
$root 修改数据是响应式的
B
$parent 中修改数据不是响应式的
C
$children 获取的结果是一个数组
D
$ref 不需要子组件渲染就可以获取对应的子组件对象
```
