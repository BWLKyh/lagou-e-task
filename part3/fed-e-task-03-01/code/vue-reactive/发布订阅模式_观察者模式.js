// 发布/订阅模式
class EventEmitter {
  constructor() {
    this.subs = Object.create(null); // 创建无原型链的对象,提升性能0
  }
  // 注册事件
  $on(eventType, handler) {
    this.subs[eventType] = this.subs[eventType] || []; //确保是数组
    this.subs[eventType].push(handler);
  }
  // 触发事件
  $emit(eventType) {
    if (this.subs[eventType]) {
      this.subs[eventType].forEach((handler) => {
        handler();
      });
    }
  }
}
// 测试
let em = new EventEmitter();
em.$on("click", () => {
  console.log("click1");
});
em.$on("click", () => {
  console.log("click2");
});
em.$emit("click");

// 观察者模式
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub);
    }
  }
  notify() {
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}
class Watcher {
  update() {
    console.log("update");
  }
}
// 测试
let dep = new Dep();
let watcher = new Watcher();

dep.addSub(watcher);
dep.notify();
