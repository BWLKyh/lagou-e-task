import Steps from './src/Steps.vue'

// 方便通过 Vue.use()引入
Steps.install = (Vue) => {
  Vue.component(Steps.name, Steps)
}

export default Steps
