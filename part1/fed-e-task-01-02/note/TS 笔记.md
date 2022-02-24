# TypeScript

## 上手

```shell
yarn tsc 01.ts
```

tsc 即 tsc typescript compile

1. 检查类型使用异常

2. 移除类型注解语法

3. 自动转换 es 新特性

## 原始类型

```javascript
const b: number = 100;
//NaN Infinity
//const d:boolean=null
//关闭严格模式或关闭 "strictNullChecks":true(只用于检查变量为空 null')
const e: void = undefined;
//关闭严格模式后可有 null 和 void 两个值
const h: symbol = Symbol();
/*
target:'es5'时会报错,原因是引用的 es5 标准库中没有 symbol类型的定义  
两种解决方法:1.target:'es2015',2.lib:["ES2015","DOM"],(DOM 提供浏览器环境 api 支持,例如 console)
*/
```

## 标准库

内置对象所对应的声明

## 显示中文错误消息

```shell
#1.命令方式
yarn tsc --locale zh-CN

#2.修改vscode 设置->typescript locale->zh-CN
```

## 作用域问题

全局变量冲突,使用局部作用域或使用 export {}

## Object 类型

所有非原始类型

```typescript
const foo: object = function () {}; // [] {}
const obj: { foo: number; bar: string } = { foo: 123, bar: "string" };
```

## 数组类型

```typescript
const arr1: Array<number> = [1, 2, 3];
const arr2: number[] = [1, 2, 3];
//应用
function sum(...args: number[]) {
  return args.reduce((prev, current) => prev + current, 0);
}
sum(1, 2, "a");
```

## 元组

## 枚举

```typescript
// const PostStatus={
//     Draft:0,
//     Unpublished:1,
//     Published:2
// }

// enum PostStatus={
//     Draft=0,
//     Unpublished=1,
//     Published=2
// }

// enum PostStatus={
//     Draft=6,
//     Unpublished,
//     Published//自动增 1
// }

enum PostStatus={
    Draft='aaa',
    Unpublished,
    Published//此时必须每个都赋值
}

//使用
const a= PostStatus.Draft
```

枚举会入侵到运行时代码,编译为一个双向键值对对象

如果使用常量枚举,即

```typescript
const enum PostStatus {...}
```

则编译为普通对象

## 函数类型

1. 函数声明
2. 函数表达式

## 任意类型

## 隐式类型推断

```typescript
let a = 1;
a = "a"; //报错
```

## 类型断言

```typescript
const nums = [110, 120, 130];
const res = num.find((i) => i > 0);
// const square=res*res//res 被隐式推断为 number|undefined,不能进行运算
//使用类型断言
//1.
const num1 = res as number;
//2.
const num2 = <number>res; //jsx 下不能使用
```

类型转换:运行阶段

类型断言:编译阶段

## 接口

一种规范/契约,约定一个对象中的成员及具体结构
不会编译成对应的 js 代码

```typescript
interface Post {
  title: string;
  content: string;
  subtitle?: string; //可选成员
  readonly summary: string; //只读成员
}

interface Cache {
  [prop: string]: string; //动态成员
}
```

## 类

用来描述一类具体对象的抽象成员
ts 增强了 class 的相关语法,如访问修饰符,抽象类等

```typescript
export {}
class Person{
    name:string='init'
    age:number
    constructor(name:string,age:number){
        this.name=name
        this.age=age
    }
    sayHi(msg:string):void{
        console.log(`I am ${this.name},${msg})
    }
}
```

## 类的访问修饰符

1. public
2. private:只允许内部访问,若用于构造函数,则该类不能在外部被实例化也不能被继承,可在类内部定义静态方法使用 new 实例化
3. protected:只允许自身属性和子类中访问,若用于构造函数,则该类不能在外部被实例化,能被继承

## 类的只读属性

```typescript
protected readonly gender:boolean
```

## 接口与类

```typescript
interface Eat {
  eat(food: string): void;
}
interface Run {
  run(distance: number): void;
}
class Person implements Eat, Run {
  eat(food: string): void {
    console.log(`进餐:$${food}`);
  }
  run(distance: number): void {
    console.log(`行走:$${distance}`);
  }
}
```

## 抽象类,抽象方法

抽象类可以包含具体实现,只能被继承,不能 new

抽象方法(被 abstract 修饰)也不需要方法体,子类必须实现该抽象方法
abstract

## 泛型

把定义时不能明确的类型参数在使用时再传递

```typescript
function createArray<T>(length: number, value: number): number[] {
  const arr = Array<number>(length).fill(value);
  return arr;
}
const res = createArray<string>(3, "100");
// res=>[100,100,100]
```

## 类型声明

由于一些原因,导入的方法没有类型声明而没有类型提示,可通过 declare 定义
考虑普通 js 的兼容性大多数第三方库都有对应的类型声明模块(文件),有的已集成,有的没有需安装(一般为 @types/xxx )
