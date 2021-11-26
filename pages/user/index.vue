<template>
  <div class="main_container">
    <div class="info_header">
      <h1>Info</h1>
    </div>
    <div class="info_container">
      <hr class="seperator" />
      <div class="cell cell--left user--info">
        <p>
          <b>Benutzername:</b> {{ this.user.username }} <br />
          <b>Name:</b> {{ this.user.firstName + " " + this.user.lastName }}
        </p>

        <div v-show="this.user.pharmacies.length == 1">
          <b>Apotheke:</b> {{ this.user.pharmacies[0].Name }}
        </div>

        <div v-show="this.user.pharmacies.length != 1">
          <b>Apotheken:</b> <br />
          <p v-for="pharmacy in user.pharmacies" :key="pharmacy.Name">
            - {{ pharmacy.Name }}
          </p>
        </div>
      </div>
      <div class="user_header user--info_header">
        <img
          class="custom-icon"
          src="~/assets/icons/account_circle_black_24dp.svg"
          alt=""
          height="30px"
        />
        Nutzerinformationen
      </div>
      <div class="cell cell--left user--links">
        <a
          href="https://tfg.smart-medication.de/sm/index.cfm"
          style="font-size: 15px"
          target="_blank"
        >
          <img src="~/assets/icons/link_scandoc.png" alt="" height="23px" />
        </a>
        <br />

        <a href="https://www.smart-medication.eu/" target="_blank"
          ><img src="~/assets/icons/link_smart-medication.png" alt="" height="23px"
        /></a>
        <br />

        <a target="_blank" href="/app/man_eConsent.pdf"><img src="~/assets/icons/link_manual.png" alt="" height="23px"
        /></a>
      </div>
      <div class="user_header user--links_header">
        <img
          class="custom-icon"
          src="~/assets/icons/info.svg"
          alt=""
          height="30px"
        />
        Links & Infos
      </div>
        <div class="cell cell--right user--help">
        Bei Fragen oder Problemen kontaktieren Sie bitte den Support: <br> Telefon:
        +49 (0)69 348 691 04 0
        <br />
        <a href="mailto:support@smart-medication.eu"
          >support@smart-medication.eu</a
        >
      </div>
     <div class="user_header user--help_header">
        <img
          class="custom-icon"
          src="~/assets/icons/contact-support.svg"
          alt=""
          height="30px"
        />
        Hilfe
      </div>
       
    </div>
    
  </div>
</template>

<script>
import { mapState } from "vuex";
import user from "~/mixins/user.js";
export default {
  mixins: [user],
  data() {
    return {
      pin: "",
      cPin: "",
      selected_pharmacy: null
    };
  },
  computed: {
    user() {
      return this.getUser();
    },

  },
  methods: {
    /**
     * Creates displayable string of all pharmacy options
     */
    createPharmacyString() {
      let pString = "";
      let pharmacies = this.user.pharmacies;
      pharmacies.forEach((pharmacy) => {
        if (pharmacies.indexOf(pharmacy) !== pharmacies.length - 1) {
          pString += "- " + pharmacy.Name + ` \n `;
        } else {
          pString +=  "- " + pharmacy.Name;
        }
      });

      return pString;
    },
 
  }
};
</script>

<style scoped>
.info_header {
  border-bottom: 3px solid black;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.container{
  margin-bottom: 4rem;
}
.info_container {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 10px 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "upperleft seperator upperright"
    "lowerleft seperator lowerright";
  min-height: 75vh;
  margin-top: 3rem;
  row-gap: 4rem;
}

.cell {
  margin: 0rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-top: 3px solid rgb(211 211 211);
  border-bottom: 3px solid rgb(211 211 211);
  padding: 30px;
  height: 100%;
  
}

.cell--left {
  border-left: 3px solid rgb(211 211 211);
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
}

.cell--right {
  margin-top: 3rem;
  border-right: 3px solid rgb(211 211 211);
  border-top-right-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

.seperator {
  grid-area: seperator;
  background: rgb(188 184 184);
  width: 9px;
  height: 110%;
  margin: 0;
  border: 1px solid rgb(188 184 184);
  border-radius: 1rem;
}
.user--info {
  grid-area: upperleft;
  font-size: 18px;
  padding: 15px;
  padding-top: 30px;
  padding-bottom: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.user--settings {
  grid-area: upperright;

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}

.user--links {
  grid-area: lowerleft;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 40px; 
}

.user--help {
  grid-area: upperright;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 18px;
}
.user_header {
  background: rgb(188 188 188);
  width: 14rem;
  height: 2.5rem;
  border: 1px solid rgb(188 188 188);
  border-radius: 1rem;
  left: calc(50% - 7rem);
  position: absolute;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.user--info_header {
  grid-area: upperleft;
}
.user--settings_header {
   margin-top: 1.75rem;
  grid-area: upperright;
}
.user--links_header {
  grid-area: lowerleft;
}
.user--help_header {
  margin-top: 1.75rem;
  grid-area: upperright;
}
.custom-icon {
  margin-right: 1rem;
  margin-left: 5px;
}

@media (max-width: 800px){
  .cell{
    padding: 15px;
  }
  .user--help_header{
    width: 7rem;
    margin-left: 3rem;
  }
  .main_container{
    width: 95vw;
  }
  .info_container{
    margin-bottom: 5rem !important;
  }
}

@media screen and (max-height: 800px){
  
}
</style>
