import { Module } from './modules/module'
import { vnode, VNode } from './vnode'
import * as is from './is'
import { htmlDomApi, DOMAPI } from './htmldomapi'

type NonUndefined<T> = T extends undefined ? never : T

function isUndef (s: any): boolean {
  return s === undefined
}
function isDef<A> (s: A): s is NonUndefined<A> {
  return s !== undefined
}

type VNodeQueue = VNode[]

const emptyNode = vnode('', {}, [], undefined, undefined)

function sameVnode (vnode1: VNode, vnode2: VNode): boolean {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
}

function isVnode (vnode: any): vnode is VNode {
  return vnode.sel !== undefined
}

type KeyToIndexMap = {[key: string]: number}

type ArraysOf<T> = {
  [K in keyof T]: Array<T[K]>;
}

type ModuleHooks = ArraysOf<Required<Module>>

function createKeyToOldIdx (children: VNode[], beginIdx: number, endIdx: number): KeyToIndexMap {
  const map: KeyToIndexMap = {}
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key
    if (key !== undefined) {
      map[key] = i
    }
  }
  return map
}

const hooks: Array<keyof Module> = ['create', 'update', 'remove', 'destroy', 'pre', 'post']
// 1. 模块数组:定义 dom 元素行内样式,注册事件等 2. domApi 将虚拟 dom 转换为平台对应的 dom 元素(默认为浏览器平台)
export function init (modules: Array<Partial<Module>>, domApi?: DOMAPI) {
  let i: number
  let j: number
  // cbs:回调函数,存储一些钩子函数,名称与 hooks 变量一致
  const cbs: ModuleHooks = {
    create: [],
    update: [],
    remove: [],
    destroy: [],
    pre: [],
    post: []
  }

  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]]
      if (hook !== undefined) {
        (cbs[hooks[i]] as any[]).push(hook)
      }
    }
  }

  function emptyNodeAt (elm: Element) {
    const id = elm.id ? '#' + elm.id : ''
    const c = elm.className ? '.' + elm.className.split(' ').join('.') : ''
    return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm)
  }

  function createRmCb (childElm: Node, listeners: number) {
    return function rmCb () {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm) as Node
        api.removeChild(parent, childElm)
      }
    }
  }

  function createElm (vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    // 执行用户设置的 init 钩子
    let i: any
    let data = vnode.data
    if (data !== undefined) {
      const init = data.hook?.init
      if (isDef(init)) {
        init(vnode)
        data = vnode.data
      }
    }
    const children = vnode.children
    const sel = vnode.sel
    // 把 vnode 转换为真实 DOM 对象(没渲染到页面)
    if (sel === '!') {
      if (isUndef(vnode.text)) {
        vnode.text = ''
      }
      vnode.elm = api.createComment(vnode.text!)
    } else if (sel !== undefined) {
      // Parse selector
      const hashIdx = sel.indexOf('#')
      const dotIdx = sel.indexOf('.', hashIdx)
      const hash = hashIdx > 0 ? hashIdx : sel.length
      const dot = dotIdx > 0 ? dotIdx : sel.length
      const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel
      const elm = vnode.elm = isDef(data) && isDef(i = data.ns)
        ? api.createElementNS(i, tag)
        : api.createElement(tag)
      if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot))
      if (dotIdx > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '))
      //遍历传入的所有钩子函数 cbs
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
      // 如果 vnode 中有子节点,创建子 vnode 对应的 DOM 元素并追加到 DOM 树上
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i]
          if (ch != null) {
            api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue))
          }
        }
      } else if (is.primitive(vnode.text)) {
        // 如果vnode 没有子节点,判断text 是否是原始值(string | number),然后创建文本节点
        api.appendChild(elm, api.createTextNode(vnode.text))
      }
      //执行 hook(用户传入的钩子)
      const hook = vnode.data!.hook
      if (isDef(hook)) {
        // 执行用户传入的钩子中的 create 钩子
        hook.create?.(emptyNode, vnode)
        if (hook.insert) {
          // 收集 insert 等待插入时执行
          insertedVnodeQueue.push(vnode)
        }
      }
    } else {
      //如果选择器为空,创建文本节点
      vnode.elm = api.createTextNode(vnode.text!)
    }
    return vnode.elm
  }

  function addVnodes (
    parentElm: Node,
    before: Node | null,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number,
    insertedVnodeQueue: VNodeQueue // 存储刚刚插入的具有 insert 钩子的 vnode 节点
  ) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (ch != null) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before)
      }
    }
  }

  function invokeDestroyHook (vnode: VNode) {
    const data = vnode.data
    if (data !== undefined) {
      data?.hook?.destroy?.(vnode)
      for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
      // 注意:destory 钩子在删除 dom 之前执行
      if (vnode.children !== undefined) {
        for (let j = 0; j < vnode.children.length; ++j) {
          const child = vnode.children[j]
          if (child != null && typeof child !== 'string') {
            invokeDestroyHook(child)
          }
        }
      }
    }
  }

  function removeVnodes (parentElm: Node,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number): void {
    for (; startIdx <= endIdx; ++startIdx) {
      let listeners: number
      let rm: () => void
      // 找到每个需要删除的 vnode 节点
      const ch = vnodes[startIdx]
      if (ch != null) {
        if (isDef(ch.sel)) {
          // 触发 VNode的 destory 钩子
          invokeDestroyHook(ch)
          // 统计 cbs 中 remove 钩子的个数,防止重复删除节点
          listeners = cbs.remove.length + 1
          // 高阶函数,返回真正删除 DOM 元素的方法
          rm = createRmCb(ch.elm!, listeners)
          // 依次触发 remove 钩子,最终会通过 rm 删除 DOM 元素
          for (let i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm)
          // 如果用户传入了 remove 钩子,有则返回
          const removeHook = ch?.data?.hook?.remove
          if (isDef(removeHook)) {
            // 如果用户传入钩子,需要手动调用 rm()真正删除元素
            removeHook(ch, rm)
          } else {
            rm()
          }
        } else { // Text node
          api.removeChild(parentElm, ch.elm!)
        }
      }
    }
  }

  function updateChildren (parentElm: Node,
    oldCh: VNode[],
    newCh: VNode[],
    insertedVnodeQueue: VNodeQueue) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx: KeyToIndexMap | undefined
    let idxInOld: number
    let elmToMove: VNode
    let before: any
    // 同级别节点比较
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        api.insertBefore(parentElm, oldStartVnode.elm!, api.nextSibling(oldEndVnode.elm!))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        api.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        }
        idxInOld = oldKeyToIdx[newStartVnode.key as string]
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm!)
        } else {
          elmToMove = oldCh[idxInOld]
          if (elmToMove.sel !== newStartVnode.sel) {
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm!)
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined as any
            api.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    // 循环结束的收尾工作
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
      } else {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
      }
    }
  }

  // diff 算法
  function patchVnode (oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    // 第一个过程,触发 prepatch 和 update 钩子
    const hook = vnode.data?.hook
    hook?.prepatch?.(oldVnode, vnode)
    // prepatch=>全等对比=>update=>真正对比=>postpatch
    const elm = vnode.elm = oldVnode.elm!
    const oldCh = oldVnode.children as VNode[]
    const ch = vnode.children as VNode[]
    if (oldVnode === vnode) return
    if (vnode.data !== undefined) {
      for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      vnode.data.hook?.update?.(oldVnode, vnode)
      // 先执行cbs钩子,后执行用户定义的钩子,用户修改 vnode 数据可以覆盖模块中 update 钩子函数的数据
    }
    // 第二个过程,真正对比新旧 vnode 差异
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        // 对比所有新旧子节点,并更新 dom  
        // diff 核心
        
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue)
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      }
      api.setTextContent(elm, vnode.text!)
    }
    // 第三个过程,触发 postpatch 钩子函数
    hook?.postpatch?.(oldVnode, vnode)
  }
// 高阶函数,好处是只需传递两个参数,module,domApi
  return function patch (oldVnode: VNode | Element, vnode: VNode): VNode {
    // 首次需要 Element占位
    let i: number, elm: Node, parent: Node
    // 具有 insert 钩子函数的新节点队列
    const insertedVnodeQueue: VNodeQueue = []
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()

    if (!isVnode(oldVnode)) {
      oldVnode = emptyNodeAt(oldVnode)
    }

    if (sameVnode(oldVnode, vnode)) {
      // 如果判断新旧节点相同要进行深层对比
      patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
      elm = oldVnode.elm! // 获取老元素, !标识该变量一定有值,后续可直接使用
      parent = api.parentNode(elm) as Node

      createElm(vnode, insertedVnodeQueue) // 此处往insertedVnodeQueue添加新节点

      if (parent !== null) {
        // 往父元素插入新创建的 dom节点,位置在老节点之后
        api.insertBefore(parent, vnode.elm!, api.nextSibling(elm)) //nextSibling下一个兄弟节点
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }
    // 执行用户传入的 insert 钩子
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])
    }
    // 执行模块中的 post 钩子
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    // 返回节点作为下次的老节点
    return vnode
  }
}
