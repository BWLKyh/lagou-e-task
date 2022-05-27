<template>
  <Layout>
    <div class="">
      <h1>{{ $page.post.title }}</h1>

      <div>{{ $page.post.content }}</div>
    </div>
  </Layout>
</template>

<page-query>
query($id:ID!) {
  post(id:$id){
    id
    title
    content
  }
}
</page-query>

<script>
export default {
  name: 'PostPage',
  metaInfo() {
    return {
      title: this.$page.post.title, // 动态获取
    }
  },
  // metaInfo:{
  //   title:''
  // }
}
</script>

<style scoped></style>
