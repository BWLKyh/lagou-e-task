import FormItem from './src/formItem.vue'

// 方便通过 Vue.use()引入
FormItem.install = (Vue) => {
  Vue.component(FormItem.name, FormItem)
}

export default FormItem
