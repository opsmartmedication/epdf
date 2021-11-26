<template>
  <b-container fluid>
    <div class="password-reset">
      <PasswordReset />
    </div>
  </b-container>
</template>

<script>
export default {
  auth: false,
  layout(context) {
    return "login";
  }
};
</script>

<style scoped>
.password-reset {
  display: flex;
  margin-top: 3rem;
  height: 90%;
  width: 100%;
}
</style>
