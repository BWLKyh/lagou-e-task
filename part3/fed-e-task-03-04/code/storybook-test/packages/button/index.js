import Button from './src/Button.vue'

// 方便通过 Vue.use()引入
Button.install = (Vue) => {
  Vue.component(Button.name, Button)
}

export default Button
