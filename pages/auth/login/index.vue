<template>
  <div class="login">
    <SignIn />
  </div>
</template>

<script>
export default {
  layout(context) {
    return "login";
  }
};
</script>

<style scoped>
.login {
  display: flex;
  margin-top: 3rem;
  height: 90%;
  width: 100%;
}
</style>
