import LgFormItem from './src/formItem.vue'

// 方便通过 Vue.use()引入
LgFormItem.install = (Vue) => {
  Vue.component(LgFormItem.name, LgFormItem)
}

export default LgFormItem
