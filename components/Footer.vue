<template>
  <footer class="footer fixed-bottom pt-0">
    <div class="footer_container ">
      <!-- <div class="brand_container">
         <img src="~/assets/icons/eConsent.png" alt="eConsent" height="80px" /> -->
      </div> 
      <div class="row d-flex justify-content-between ">
       <div class="footer-links " >
         <a href="/app/impressum">Impressum</a>
         <a href="/app/Datenschutzerklaerung_eConsent.pdf" target="_blank">Datenschutz</a>
       </div>
       <div class="info_container">
        <p>Version 1.0</p>
      </div>
      </div>
      
    </div>
  </footer>
  
</template>

<script>
export default {
  computed: {
    user() {
      if (!this.$auth.user) {
        this.getUser();
      }
      return this.$auth.user;
    }
  },
  methods: {
    getUser() {
      this.$axios
        .get("/user")
        .then((resp) => {
          this.$auth.setUser(resp.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.footer {
  // position: fixed;
  // bottom:0;
  
  height: 20px;
  width: 100%;
  background: rgb(145, 143, 143);
  padding: 2rem;
}
.footer_container {
  display: flex;
  flex-direction: column;
 
}
.brand_container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 60px;
  width: 120px;
}
.link_container{
  width: 50%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
 
}
.info_container{
/* position: fixed;
bottom: 5px;
right: 15px; */
 color: white;
}
.footer-links{
  display: flex;
  justify-content: space-evenly
}
.footer-links a {
  color:white !important;
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  margin-left: 10px
}
</style>
