<template>
  <div v-if="loading" class="loading-page">
    
        <b-spinner style="width: 4rem; height: 4rem;margin-bottom:3rem; z-index:1500"></b-spinner>
  </div>
</template>
<script>
  export default {
    data: () => ({
      loading: false,
    }),
    methods: {
      start() {
        this.loading = true
      },
      finish() {
        this.loading = false
      },
    },
  }
</script>
<style scoped>
  .loading-page {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    padding-top: 200px;
    font-size: 30px;
    font-family: sans-serif;
    z-index: 1500;
  }

</style>
