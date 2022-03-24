class Observer {
  constructor(data) {
    this.walk(data);
  }
  walk(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }
  defineReactive(obj, key, val) {
    let that = this;
    // 负责收集依赖,并发送通知
    let dep = new Dep();
    // 如果 val 是对象,把 val 内部属性也转换成响应式数据
    this.walk(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target);
        return val;
        // 假设访问 vm.msg, 先触发自身的_proxy()中的 get()通过 data[key]访问,此时触发 Observer 中的 get()方法,若此处仍为 data[key]则死递归
        // 通过第三个参数,且外部对此 get()有引用形成闭包而保存 val
      },
      set(newValue) {
        if (newValue === val) {
          return;
        }
        val = newValue;
        // 当 data 的属性重新赋值为对象时需把对象内部属性也转换为响应式
        // 此处的 this 指向 data,所以需使用 that 代传
        that.walk(newValue);
        // 发送通知
        dep.notify();
      },
    });
  }
}
