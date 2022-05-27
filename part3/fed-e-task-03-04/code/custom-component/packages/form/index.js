import LgForm from './src/form.vue'

// 方便通过 Vue.use()引入
LgForm.install = (Vue) => {
  Vue.component(LgForm.name, LgForm)
}

export default LgForm
