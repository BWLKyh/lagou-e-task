## Vue.js 源码剖析-响应式原理、虚拟 DOM、模板编译和组件化

### 简答题

#### 1、请简述 Vue 首次渲染的过程。

- Vue首次渲染过程　

 1. Vue 实例初始化实例成员,静态成员等工作

 2. new Vue()

 3. 执行 _init(), vue 的入口

 4. vm.$mount()

    > 1. 暂存$mount为 mount
    > 2. 如果没有传递 render,也没有template,则把 el 中的内容做模板
    > 3. compileToFunctions()把获取的模板编译成 render(),
    > 4. 把 render 挂载到 options
    > 5. 给定参数调用mount, 并返回结果

 5. mount()

    > 1. 重新获取 el 传入mountComponent()

 6. mountComent(this.el)

    > 1. 判断是否有 render,如果没有但传入了模板,开发环境警告不支持编译器
    >
    > 2. 触发 beforeMount
    >
    > 3. 定义 updateComponent
    >
    >    > 1. vm._render(),渲染生成 VNode
    >    > 2. vm._update(),更新将虚拟 DOM 转换成真实 DOM 并挂载到页面上
    >    > 3. vm._update(vm.render(),...)
    >
    > 4. new Watcher()
    >
    >    > 1. 传递 updateComponent 进来存为 getter,最终在内部调用
    >    >
    >    > 2. get () 实现收集依赖
    >    >
    >    >    > 1. getter(), 即updateComponent挂载真实 DOM
    >
    > 5. 触发 mounted
    >
    > 5. return vm

#### 2、请简述 Vue 响应式原理。

- 入口: src/core/instance/js 即 _init()
1. initState(vm) 状态的初始化,初始化了\_data,\_props,methods等

2. initData(vm)

   > 1. 初始化处理, 如检查 data 属性名合法性
   > 2. observer(data, true /* asRootData */) 数据的响应式处理

3. observer(), 负责为每个Object 类型的 value 创建一个 observer 实例

   > 1. 判断传入对象value是否有\__ob__属性,有则不需要处理,
   > 2. 否则ob = new Observer(value)
   > 3. 处理后返回ob

4. Observer类

   > 1. 将实例挂载到 value 的\__ob__属性并设置为不可枚举
   >
   > 2. 如果 value 是数组
   >
   >    > 1. 处理 value 保证有\__prototype__属性
   >    > 2. this.observeArray(value),遍历每个元素调用 observer(),使每个元素也是响应式的
   >
   > 3. 如果 value 是对象
   >
   >    > 1. this.walk(value)
   >    >
   >    >    > 1. 遍历对象中的每一个属性，通过 defineReactive()转换成 setter/getter
   
5. deineReactive()

   > 1. const dep = new Dep() 为当前属性创建依赖对象实例
   >
   > 2. 判断是否需要递归观察子对象,如果需要递归 observe(val),结果存为 childOb
   >
   > 3. 使用 Object.defineProperty()定义 getter 和 setter(如果原本没有)
   >
   >    > 1. get(): 
   >    >
   >    >    > 1. 判断Dep.target, 如果有通过 dep.depent()收集依赖, 内部实现为把当前 dep 对象添加到 watcher 对象集合中,并且把 watcher 对象添加到 dep 的 subs 数组中
   >    >    > 2. 判断childOb, 有则childOb.dep.depend() 对所有属性收集依赖
   >    >    > 3. 判断该属性值是否为数组,是则dependArray(value), 对该数组收集依赖,内部实现是判断数组每个元素是否有\__ob__, 有则调用\__ob__.dep.depend()
   >    >    > 3. 返回属性值 value
   >    >    
   >    > 2. set():
   >    >
   >    >    > 1. 如果新旧值相等则不处理
   >    >    >
   >    >    > 2. 如果有 getter 没有 setter 说明为只读属性不处理
   >    >    >
   >    >    > 3. 如果没有 setter, val=newVal
   >    >    >
   >    >    > 4. 如果新值是对象, 观察子对象
   >    >    >
   >    >    > 5. dep.notify() 发布更改通知, 内部实现是对 dep 的 subs 排序后依次调用里面的 watcher 实例的update(),
   >    >    >
   >    >    >    > 1. watcher.update()内部实现是如果不需要懒加载,调用 queueWatcher(this)
   >    >    >    > 2. queueWatcher内部实现是如果当前没有刷新, 将 当前watcher放到 queue 末尾暂存, 否则插入到queue对应位置暂存, 如果当前无需等待,将状态更新为等待状态, 并调用nextTick(flushSchedulerQueue)
   >    >    >    > 3. flushSchedulerQueue内部实现是对 queue 排序,遍历每个 watcher 触发 before()钩子和 run()(内部调用 this.get()，然后调用 this.cb() (渲染 wacher 的 cb 是 noop), 最后清除has 数组中 watcher 的 id 使下次可使用
   >    >    >    > 4. nextTick 内部实现是等待下次
- 响应式机制
1. 在 new Watcher()的 get 方法中会给 dep.target 赋值, 然后调用 getter 方法(生成虚拟 DOM, 转换成真实 DOM, 过程中会访问用到的属性)
1. 每次访问属性都会执行 watcher中的 get 方法
1. 首次渲染会执行 watcher 中的 get 方法, 当数据变化后也会通过 set 执行 watcher 中 的 get 方法,即当访问数据时会收集数据依赖,数据变化时会根据依赖更新视图


　

#### 3、请简述虚拟 DOM 中 Key 的作用和好处。

- 在updateChildren 中比较子节点时使用 sameVnode判断, 其中会通过 key 和 sel 判断, 
  1. 如果此时没有设置 key, 无法从旧节点中找到可重用的节点, 只能更新对应位置的 DOM 或 插入新 DOM, 造成性能浪费。
  2. 如果设置了 key, Diff 算法可能从旧节点找到可重用节点,  从而只插入真正新增的节点, 以及更新原有节点并排序, 可提升性能,尤其是列表类组件效果明显 　

　

#### 4、请简述 Vue 中模板编译的过程。

- 入口: src/platforms/web/entry-runtime-with-compiler.js (以 web 平台为例)
- compileToFunctions(template,...)
 1. 先从缓存加载编译好的 render 函数

 2. 缓存中没有就调用 compile(template,options)
    > 1. compiler(): 
    >
    >    > 1. 内部合并 options,
    >    > 2. 调用 baseCompile(template.trim(), finalOptions) 编译模板
    >
    > 2. baseCompile(): 
    >
    >    > 1. parse(): 把template 转换为 AST tree
    >    >
    >    > 2. optimize():
    >    >
    >    >    > 1. 标记 AST tree 中的静态属性 sub trees
    >    >    > 2. patch 阶段跳过静态子树
    >    >
    >    > 3. generate():
    >    >
    >    >    > 1. 通过 genElement生成及`with(this){return ${code}}`拼接而成的 js 的创建代码字符串
    
 3. 通过 createFunction()把字符串转换成 render

 3. render 和 staticRenderFns 初始化完毕,挂载到 Vue 实例的 options 对应属性上


- 总体过程:
  1. 将模板字符串转换为 AST 对象
  2. 对 AST 对象优化,实际是标记静态根节点,
  3. 将优化后的 AST 对象转换为字符串形式的 js 代码
  4. 将字符串通过 new Function(code) 转换为匿名函数, 即最后生成的 render 函数

　