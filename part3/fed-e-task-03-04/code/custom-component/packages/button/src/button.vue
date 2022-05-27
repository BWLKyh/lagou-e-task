<template>
  <div>
    <button @click="handleClick"><slot></slot></button>
  </div>
</template>

<script>
export default {
  name: 'LgButton',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    handleClick(evt) {
      this.$emit('click', evt)
      evt.preventDefault()
    },
  },
}
</script>

<style scoped></style>
