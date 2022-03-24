let _Vue = null;

export default class VueRouter {
  static install(Vue) {
    // 1. 判断当前插件是否已被安装
    if (VueRouter.install.installed) {
      return;
    }
    VueRouter.install.installed = true;
    // 2. 把 Vue 构造函数记录到全局变量
    _Vue = Vue;
    // 3. 把创建 Vue 示例时候传入的 router 对象注入到所有 Vue 示例上
    //混入
    _Vue.mixin({
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router;
          this.$options.router.init();
        }
      },
    });
  }

  constructor(options) {
    this.options = options;
    this.routeMap = {};
    // data:响应式对象
    this.data = _Vue.observable({
      current: "/",
    });
  }

  init() {
    this.createRouteMap();
    this.initComponents(_Vue);
    this.initEvent();
  }

  createRouteMap() {
    // 遍历所有路由规则,把路由规则解析成键值对形式 存储到 routeMap 中
    this.options.routes.forEach((route) => {
      this.routeMap[route.path] = route.component;
    });
  }

  initComponents(Vue) {
    Vue.component("router-link", {
      props: {
        to: String,
      },
      // template: '<a :href="to"><slot></slot></a>',
      render(h) {
        return h(
          "a",
          {
            attrs: {
              href: this.to,
            },
            on: {
              click: this.clickHandler,
            },
          },
          [this, $slots.default]
        ); // 子元素内容
      },
      methods: {
        clickHandler(e) {
          history.pushState({}, "", this.to); // 改变 history 中的地址(改变地址栏中的地址),并不触发 popstate,onhashchange
          this.$router.data.current = this.to;
          // 当 data 发生改变会响应式替换 router-view 中的内容
          e.preventDefault();
        },
      },
    });

    const self = this;
    Vue.component("router-view", {
      render(h) {
        const component = self.routeMap[self.data.current];
        return h(component);
      },
    });
  }

  initEvent() {
    // 历史发生改变时触发 data.current 改变使重新渲染
    window.addEventListener("popstate", () => {
      this.data.current = window.location.pathname;
    });
  }
}
