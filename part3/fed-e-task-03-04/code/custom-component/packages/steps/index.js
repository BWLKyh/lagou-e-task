import LgSteps from './src/steps.vue'

// 方便通过 Vue.use()引入
LgSteps.install = (Vue) => {
  Vue.component(LgSteps.name, LgSteps)
}

export default LgSteps
