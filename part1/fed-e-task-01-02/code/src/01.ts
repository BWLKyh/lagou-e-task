var hello = function (name: string) {
  console.log("Hello, " + name);
};
hello("ts");
/*
 tsc typescript compile
1.检查类型使用异常
2.移除类型注解语法
3.自动转换 es 新特性

ts原始类型
*/
const b: number = 100; //NaN Infinity
//const d:boolean=null //关闭严格模式或关闭 "strictNullChecks":true(只用于检查变量为空 null')
const e: void = undefined; //关闭严格模式后可有 null 和 void 两个值
const h: symbol = Symbol(); //target:'es5'时会报错,原因是引用的 es5 标准库中没有 symbol类型的定义
//两种解决方法:1.target:'es2015',2.lib:["ES2015","DOM"],(DOM 提供浏览器环境 api 支持,例如 console)

//标准库,内置对象所对应的声明

//ts 显示中文错误消息
