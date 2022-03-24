class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }
  // 编译模板,处理文本节点和元素节点
  compile(el) {
    // children子元素,childNodes子节点,插值表达式是文本节点,
    let childNodes = el.childNodes //伪数组
    Array.from(childNodes).forEach((node) => {
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  compileElement(node) {
    //console.log(node.attributes)
    Array.from(node.attributes).forEach((attr) => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }
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
  // 处理 v-text 指令
  textUpdater(node, value, key) {
    // 将值保存到指定属性
    node.textContext = value
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  modelUpdater(node, value, key) {
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })

    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  // 处理其他指令
  // ...
  // v-html
  htmlUpdater(node, value) {
    node.innerHTML = value
  }
  // v-on
  onUpdate(node, value, attrBind) {
    node.addEventListener(attrBind, value)
  }

  compileText(node) {
    // console.log(node) 自动处理,文本节点自动提取出来
    // console.dir(node) 以对象形式展示
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if (reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key]) // 用后面的节点的值替换前面匹配到的整个插值表达式

      // 创建 watcher 对象,当数据改变更新视图
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
    }
  }
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
}
