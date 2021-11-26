 <template>
  <div class=" ">
     <v-idle @idle="onIdle" :duration="10 * 60" v-show="false"/>
    <Navbar class="navbar--custom" />
    <Nuxt class=" " /> 
  <Footer class="footer" />  
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
<style scoped>
.nuxt-body {
/*  min-height: 100vh;
  margin: auto;
  overflow-y: none; */
 
  
}
.navbar--custom {
  /* position: sticky; */
}

</style>
