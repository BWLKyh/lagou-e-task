import Form from './src/form.vue'

// 方便通过 Vue.use()引入
Form.install = (Vue) => {
  Vue.component(Form.name, Form)
}

export default Form
