<template>
  <form>
    <slot></slot>
  </form>
</template>

<script>
export default {
  name: 'LgForm',
  provide() {
    return {
      form: this,
    }
  },
  components: {},
  props: {
    model: {
      type: Object,
    },
    rules: {
      type: Object,
    },
  },
  data() {
    return {
      validateList: [],
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    findAllTasks(children = []) {
      const list = []
      children.map((c) => {
        list.push(c)
        if (c.$children) this.findAllTasks(c.$children)
      })
      list.forEach((v) => {
        if (v.validate && v.validate(0)) this.validateList.push(v.validate(0))
      })
    },
    validate(cb) {
      this.findAllTasks(this.$children)
      const tasks = this.validateList
      // const tasks = this.$children
      //   .filter((child) => child.prop)
      //   .map((child) => child.validate())

      console.log('🚀 ~ file: Form.vue ~ line 44 ~ validate ~ tasks', tasks)
      this.validateList = []

      Promise.all(tasks)
        .then(() => cb(true))
        .catch(() => cb(false))
    },
  },
}
</script>

<style scoped></style>
