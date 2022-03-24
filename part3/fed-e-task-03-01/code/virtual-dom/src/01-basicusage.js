import { init } from "snabbdom/build/init";
import { h } from "snabbdom/build/h";
// 由于 webpack4- 及parcel 工具不支持 package.json 中 export 字段的用法,此处需改成真实路径
// snabbdom/init -> snabbdom/build/package/init,新版本少了 package 这一层

// init 是高阶函数,给定参数返回一个用于比较虚拟dom并局部更新 的方法
const patch = init([]);
// h函数用于创建 VNode
// 第一个参数:标签+选择器
// 第二个参数:如果是字符串就是标签中的文本内容,是数组就是子元素
// let vnode = h("div#container.cls", "Hello World");
let vnode = h(
  "div#container.cls",
  {
    hook: {
      init(vnode) {
        console.log(vnode.elm);
      },
      create(emptyNode, vnode) {
        console.log(vnode.elm);
      },
    },
  },
  "Hello World"
);
let app = document.querySelector("#app");
// 第一个参数:旧VNode,可以使 DOM 元素
// 第二个参数:新 VNode
// 返回新的 VNode
let oldVnode = patch(app, vnode);

vnode = h("div#container.xxx", [h("h1", "Hello World"), h("p", "Hello P")]);
patch(oldVnode, vnode);

setTimeout(() => {
  patch(oldVnode, h("!")); // 清除 div 中的内容,替换为注释 <!--->
}, 2000);
