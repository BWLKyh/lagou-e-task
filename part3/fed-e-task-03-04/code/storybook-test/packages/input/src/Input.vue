<template>
  <div class="">
    <input v-bind="$attrs" :type="type" :value="value" @input="handleInput" />
  </div>
</template>

<script>
export default {
  name: 'LgInput',
  inheritAttrs: false,
  components: {},
  props: {
    value: {
      type: String,
    },
    type: {
      type: String,
      defalult: 'text',
    },
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    handleInput(evt) {
      this.$emit('input', evt.target.value)
      const findParent = (parent) => {
        while (parent) {
          if (parent.$options.name === 'LgFormItem') {
            break
          } else {
            parent = parent.$parent
          }
        }
        return parent
      }
      const parent = findParent(this.$parent)
      if (parent) {
        parent.$emit('validate')
      }
    },
  },
}
</script>

<style scoped></style>
