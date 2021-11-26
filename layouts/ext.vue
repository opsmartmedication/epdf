<template>
  <div>
      <div class="navbar_container" > 
    <b-navbar toggleable="sm" type="dark" variant="nav-primary" fixed="top" class="navbar--custom">
      <b-navbar-brand class="secondary-text"
        ><div class="brand_container">
          <img
            src="~/assets/icons/eConsent.png"
            alt="eConsent"
            height="60px"
          /></div
      ></b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
    </b-navbar>
    </div> 
    <nuxt class="nuxt-body"/>
    <Footer class="footer" />
  </div>
</template>

<script>
export default {};
</script>

<style>
.nuxt-body {
 min-height: 100vh;
  margin: auto;
  overflow-y: none;
   
}

.navbar--custom {
  position: sticky;
}

.navbar_container {
  width: 100%;
  height: 50px;
  position: sticky;
  position: -webkit-sticky;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  top: 0;
  margin: 0;
  margin-bottom: 2rem;
  z-index: 15;
}
.navbar-dark .navbar-nav .nav-link {
  color: rgb(255, 255, 255) !important;
}
.custom-nav {
  width: 30%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.navbar-dark .navbar-nav .nav-link:hover {
  color: #38656f !important;
}

.brand_container{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 35px;
}

.active-nav {
  background: #5296a5;
  border-radius: 5rem;
}


.navbar-dark .navbar-nav .active-nav:hover {
  background: rgb(57, 95, 102);
  color: rgb(255, 255, 255) !important;
  border-radius: 2rem;
}

@media screen and (max-width: 1600px) {
  .custom-nav {
    width: 35%;
  }
}
@media screen and (max-width: 1400px) {
  .custom-nav {
    width: 40%;
  }
}
@media screen and (max-width: 1200px) {
  .custom-nav {
    width: 45%;
  }
}
@media screen and (max-width: 1050px) {
  .custom-nav {
    width: 60%;
  }
}
@media screen and (max-width: 800px) {
  .custom-nav {
    width: 70%;
  }
}
@media screen and (max-width: 700px) {
  .custom-nav {
    width: 90%;
  }
}
@media screen and (max-width: 576px){
  .active-nav{
    background: none;
    border-radius: none;
  }
}
</style>