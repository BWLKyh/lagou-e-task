## 一、简答题

### 1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么。

```js
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})
```

- 否,只有 vue 实例初始化和更改 vue 实例 已有属性时才会触发转换成响应式的机制.对于已经创建的实例,vue 不允许动态添加根级别的响应式属性,但可使用 Vue.set(object,propertyName,value)方法或 vm.$set(vm.object,propertyName,value)向嵌套对象添加响应式属性,
- 内部原理是调用 observer.defineReactive 方法使新增的 name 属性实现响应式,参与到 vue 响应式工作流中:在此方法中使 name 属性转换为 getter/setter(内部触发时将通知依赖到 Dep 实例) 方法,当外部访问 name 属性时,触发 getter 内部收集依赖到 Dep 实例,经 Compiler 解析后订阅数据变化绑定更新函数的 watcher 实例作为订阅者被添加到 Dep 实例中;当外部修改 name 属性时,触发 setter 内部通知依赖到 Dep 实例,此时 Dep 会发送通知给所有对 name 属性的 watcher 实例(订阅者),最后由 watcher 实例更新相应视图

### 2、请简述 Diff 算法的执行过程

- 虚拟 DOM 中 Diff 算法是查找两颗树每个节点的差异,由于 DMO 操作时很少跨级别操作节点,所以针对 DOM 操作的 diff 算法只比较统计节点, 执行过程如下

1. 判断旧头结点是否为空,匹配则旧头索引右移
2. 判断旧尾结点是否为空,匹配则旧尾索引左移
3. 判断新头结点是否为空,匹配则新头索引右移
4. 判断新尾结点是否为空,匹配则新尾索引左移
5. 判断 sameVnode(旧头结点, 新头结点),匹配则
   1. patchVnode 对比旧头结点, 新头结点并更新
   2. 旧头索引右移
   3. 新头索引右移
6. 判断 sameVnode(旧尾结点, 新尾结点),匹配则
   1. patchVnode 对比旧尾结点, 新尾结点并更新
   2. 旧尾索引左移
   3. 新尾索引左移
7. 判断 sameVnode(旧头结点, 新尾结点),匹配则
   1. patchVnode 对比旧头结点, 新尾结点并更新
   2. 旧头结点 DOM 插入旧尾结点 DOM 后
   3. 旧头索引右移
   4. 新尾索引左移
8. 判断 sameVnode(旧尾结点, 新头节点),匹配则
   1. patchVnode 对比旧尾结点, 新头节点并更新
   2. 旧尾结点 DOM 插入旧头结点 DOM 前
   3. 旧尾索引左移
   4. 新头索引右移
9. 以上均不符,则
   1. 判断在旧节点中是否具有相同 key 值的旧节点,没有则新头节点作为新节点插入旧节点最前端
   2. 有则
      1. 判断该节点的 sel 属性如果与新头节点的 sel 不同, 则新头节点插入旧节点最前端
      2. 否则
         1. patchVnode 对比该旧节点和新头节点并更新
         2. 该旧节点位置清空
         3. 该旧节点插入旧头结点前
   3. 新头索引右移
10. 以上步骤循环,条件为旧头索引不大于旧尾索引,并且旧头索引不大于新尾索引
11. 旧头索引如果大于旧尾索引,把剩余新节点批量插入旧节点右边
12. 旧头索引如果大于新尾索引,把老节点剩余节点批量删除
    补充:
13. 如果 sameVnode 则重用旧节点对应 DOM 并更新差异,否则使用新节点创建 DOM

## 二、编程题

### 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。

- 代码见./code/vue-router-hash/
- 思路为改造 history 路由的实现,设置构造函数中 current 值设为'/#/',initComponent 中需要给 href 和 pushState 的 url 参数拼接'/#',initEvent 中需要接收 window.location.hash 值去除'#'赋值给 current

### 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

- 代码见./code/vue-reactive/js/compiler.js
- 关键代码如下

```javascript
  update(node, key, attrName) {
    if (attrName.startsWith('on:')) {
      const attrBind = attrName.substr(3) // 取到要绑定的方法名
      this.onUpdate.call(this, node, this.vm.$options.methods[key], attrBind)
      return
    }

    let updateFn = this[attrName + 'Updater']
    updateFn && updateFn.call(this, node, this.vm[key], key)
    // 确保updateFn 中this 仍指向 compiler 对象
  }
    // v-html
  htmlUpdater(node, value) {
    node.innerHTML = value
  }
  // v-on
  onUpdate(node, value, attrBind) {
    node.addEventListener(attrBind, value)
  }
```
