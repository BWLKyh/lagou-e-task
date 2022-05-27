<template>
  <div class="">
    <steps :count="count" :active="active"></steps>
    <button @click="next">下一步</button>
  </div>
</template>

<script>
import Steps from './Steps.vue'
export default {
  name: 'Steps-test',
  components: { Steps },
  props: {},
  data() {
    return {
      count: 4,
      active: 0,
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    next() {
      this.active <= this.count ? this.active++ : (this.active = 0)
    },
  },
}
</script>

<style scoped></style>
