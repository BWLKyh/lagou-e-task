import Input from './src/input.vue'

// 方便通过 Vue.use()引入
Input.install = (Vue) => {
  Vue.component(Input.name, Input)
}

export default Input
