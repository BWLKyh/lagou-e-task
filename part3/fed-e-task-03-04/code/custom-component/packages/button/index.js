import LgButton from './src/button.vue'

// 方便通过 Vue.use()引入
LgButton.install = (Vue) => {
  Vue.component(LgButton.name, LgButton)
}

export default LgButton
