import LgInput from './src/input.vue'

// 方便通过 Vue.use()引入
LgInput.install = (Vue) => {
  Vue.component(LgInput.name, LgInput)
}

export default LgInput
