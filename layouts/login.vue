<template>
  <div>
      <v-idle @idle="onIdle" :duration="10*60" v-show="false" v-if="$auth.loggedIn"/>
    <Nuxt />
     <!-- <Nuxt />
     <Nuxt />
    <Footer /> -->
  </div>
</template>

<script>
export default {
   methods: {
    onIdle(){
      if(this.$auth.user.hasPin){
        this.logoutPinToken()
      }else{
        this.$auth.logout()
      }
      this.$router.push("/auth/login");
    },
    logoutPinToken(){
       // prettier-ignore
          this.$axios.post('/logoutPinToken', {
        }).then((resp) => {
         this.$router.push("/auth/login");
        }).catch(error => {
           
          console.log(error);
        })
    }
  }
};
</script>
<style scoped></style>
