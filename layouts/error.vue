<template>
  <div>
    <v-idle @idle="onIdle" :duration="10*60" v-show="false" v-if="$auth.loggedIn"/>
    <b-icon
      icon="exclamation-octagon-fill"
      class="mb-4"
      style="color: #ec0404; width: 80px; height: 80px"
    ></b-icon>
    <h1 v-if="error.statusCode === 404">Die Seite wurde nicht gefunden</h1>
    <h1 v-else-if="error.statusCode === 500">Internal Server Error</h1>
    <h1 v-else>Es ist ein Fehler aufgetreten</h1>
    <div class="button-container" v-show="$auth.loggedIn">
      <b-button to="/" variant="primary" class="custom_button-shadow"
        >Home</b-button
      >
      <b-button to="/patient" variant="primary" class="custom_button-shadow"
        >Patienten verwalten</b-button
      >
      <b-button
        to="/document/management"
        variant="primary"
        class="custom_button-shadow"
        >Vorlagen verwalten</b-button
      >
    </div>
  </div>
</template>

<script>
import { BIcon, BIconExclamationOctagonFill } from "bootstrap-vue";
export default {
  components: {
    BIcon,
    BIconExclamationOctagonFill
  },
  props: ["error"],
  layout(context){
    if(context.$auth.loggedIn) return 'default'
    
    return 'ext'
  },
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

<style scoped>
div {
  margin: auto;
  margin-top: 5%;
  width: 100%;
  text-align: center;
}
</style>
