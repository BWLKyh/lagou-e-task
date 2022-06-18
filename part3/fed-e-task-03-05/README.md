## 简答题

（请直接在本文件中作答）

#### 1、Vue 3.0 性能提升主要是通过哪几方面体现的？
1. 使用 proxy()重写响应式代码,优化编译器,重写虚拟 DOM
2. 渲染性能和服务端渲染性能大幅提升
3. 使用 vite 工具,不打包直接使用 ESM 方式运行,按需加载需要的资源,进行拦截处理 

#### 2、Vue 3.0 所采用的 Composition Api 与 Vue 2.x使用的Options Api 有什么区别？
1. Composition Api 提供了一组基于函数的 api,可以更灵活的组织代码逻辑和结构,还可以把组件功能提取出来方便其他组件重用
2. Options Api 通过选项对象创建组件,开发复杂组件时,同一功能的逻辑代码被拆分到不同选项,难以提取复用逻辑,mixin 机制可能导致命名冲突,数据来源不清晰的问题
　
#### 3、Proxy 相对于 Object.defineProperty 有哪些优点？
1. proxy 可拦截属性访问,赋值,删除等操作,不需要初始时递归遍历所有属性
2. 多层属性嵌套时,只有访问某个属性时才递归处理下级
3. 可以监听动态新增的属性,vue2中需要通过 Vue.set()
4. 可监听数组索引和 length 属性
　
#### 4、Vue 3.0 在编译方面有哪些优化？
- 编译优化
1. 相比 vue2 中只标记静态根节点优化 diff 的过程,vue3标记和提升了所有静态(根)节点,diff 时只比较动态节点内容, 通过静态提升,将静态节点预定义,缓存时间处理函数
2. 优化打包体积,移除了一些不常用的 API
3. Tree-shaking 依赖 ESM 结构,通过编译阶段静态分析,找到没有引入的模块打包时直接过滤
　
#### 5、Vue.js 3.0 响应式系统的实现原理？
1. 通过 Proxy 对象实现属性监听
2. 多层属性嵌套,在访问属性过程中处理下一级属性
3. 默认监听动态添加的属性,默认监听属性的删除操作,默认监听数组索引和 length 属性
4. vue3 的响应式系统可作为单独模块使用

- 具体实现
1. convert 如果是对象通过 reactive 转换成响应式对象
2. reactive 将对象转换为响应式数据
- 定义待转换对象的 get,set,deleteProperty,并作为参数通过 new Proxy转换成响应式数据并返回, 其中:
  - get:
    1. track 收集依赖
    2. Reflect.get 获取属性值
    3. 通过 convert 转换后返回
  - set:
    1. Reflect.get 获取属性旧值,与新值比较,如果变化
    2. Reflect.set 设置新值并获取结果
    3. trigger 触发更新, 返回结果
  - deleteProperty:
    1. Reflect.deleteProperty删除属性并保存结果
    2. 如果待删除的属性存在并且结果成功, 触发更新,返回结果
3. effect,track 收集依赖
- effect 中缓存回调,执行回调后清除缓存
- track 中将缓存的回调存入待转换对象在 targetMap 中对应的 depsMap 中对应属性值的 dep 中
4. trigger 触发更新
- 获取 targetMap 中待更新对象的 depsMap 中对应属性值的 dep 中的所有 effect 回调并执行
5. ref 将普通数据转换成响应式数据
- 判断如果待转换数据是 ref 创建的对象直接返回
- 将待转换数据通过 conver 转换
- 返回一个有标志,get,set 方法的对象,其中 get 使用 track 收集依赖,set 使用 trigger 触发更新
6. toRefs 将响应式对象的所有属性转换成响应式对象
- 遍历每个属性, 通过 toProxyRef转换
7. toProxyRef 将响应式对象的某个属性转换成响应式对象
- 返回一个有标志,get,set的对象,其中get,set 通过 proxy\[key]的方式访问赋值,会自动触发响应式机制
8. computed
- 返回 effect 处理传入回调后的结果