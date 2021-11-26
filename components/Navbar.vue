<template>
  <div class="navbar_container">
    <b-navbar toggleable="sm" type="dark" variant="nav-primary" fixed="top">
      <b-navbar-brand  class="secondary-text"
        ><div class="brand_container" >
          <a v-if="user.role != 'Signee'" href="/app/patient" @click="$nuxt.$loading.start()"><img src="~/assets/icons/eConsent.png" alt="eConsent" height="60px"/></a>
          <img v-else src="~/assets/icons/eConsent.png" alt="eConsent" height="60px"/>
          </div></b-navbar-brand

      >

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav
          class="ml-auto custom-nav"
          v-show="this.$auth.loggedIn && user.role != 'Signee'"
        >
          <b-nav-item
            active-class="active-nav"
            to="/patient"
            class="custom-nav-item"
            >Patienten verwalten</b-nav-item
          >
          <b-nav-item
            active-class="active-nav"
            to="/document/management"
            class="custom-nav-item mx-auto"
            >Vorlagen verwalten</b-nav-item
          >
          <b-nav-item-dropdown right class="ml-auto" >
             <template #button-content>
               <img v-if="$route.name !== 'user'" src="~/assets/icons/account_circle-24px_white.svg" alt="Benutzer" />
               <img v-else src="~/assets/icons/account_circle-24px_blue.svg" alt="Benutzer">
             </template>
            <b-dropdown-item to="/user">Info</b-dropdown-item>
            <b-dropdown-item  v-b-modal.pin-modal v-if="user.hasPin">Pin ändern</b-dropdown-item>
            <b-dropdown-item  v-b-modal.pin-modal v-else>Pin setzen</b-dropdown-item>
            <b-dropdown-item v-b-modal.pharmacy-modal>Apotheke auswählen</b-dropdown-item>
            <b-dropdown-item @click="$auth.logout()">Ausloggen</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-modal
      id="pin-modal"
      ref="pin-modal"
      title="Pin"
      header-bg-variant="dark"
      header-text-variant="light"
      footer-bg-variant="primary"
      footer-text-variant="dark"
      size="sm"
    >
      <b-form autocomplete="off">
        <b-form-group class="form-group">
          <label>Pin </label>

          <b-form-input
            v-model="pin"
            type="password"
            :maxLength="10"
            class="mb-2"
            :state="pin == '' ? null : validatePin(pin)"
          ></b-form-input>
          <label>Pin wiederholen </label>
          <b-form-input
            v-model="cPin"
            type="password"
            :maxLength="10"
            class="mb-2"
            :state="cPin == '' ? null : pin == cPin"
          ></b-form-input>
          <b-form-invalid-feedback class="form__feedback">
            Die Pin muss 4-10 Ziffern enthalten.
            </b-form-invalid-feedback>
        </b-form-group>
      </b-form>
      <template #modal-footer>
        <b-btn
          class="m-auto button-send custom_button-shadow"
          variant="dark"
          :disabled="!validatePin(pin) || cPin != pin"
          @click="setPin"
          >Bestätigen</b-btn
        >
      </template>
    </b-modal>
     <b-modal
      id="pharmacy-modal"
      ref="pharmacy-modal"
      title="Apotheke auswählen"
      header-bg-variant="dark"
      header-text-variant="light"
      footer-bg-variant="primary"
      footer-text-variant="dark"
      size="sm"
    >
      <b-form-select
        v-model="selected_pharmacy"
        :options="pharmacy_options"
      
      >
      </b-form-select>
      <template #modal-footer>
        <b-btn
          class="m-auto button-send custom_button-shadow"
          variant="dark"
          :disabled="selected_pharmacy == null"
          @click="setPharmacy"
          >Bestätigen</b-btn
        >
      </template>
    </b-modal>
  </div>
</template>

<script>
import { BIcon, BIconPersonCircle } from "bootstrap-vue";
import user from "~/mixins/user.js";
export default {
  mixins: [user],
  components: {
    BIcon,
    BIconPersonCircle
  },
  data() {
    return {
      pin: "",
      cPin: "",
      selected_pharmacy: null
    };
  },
  computed: {
    user(){
      return this.getUser();
    },
    selectedPharmacy(){
      
      let pharmacies = this.getUser().pharmacies;
      let pharmacy = "Keine Apotheke ausgewählt"
      pharmacies.forEach((p) => {
        if(p.Id == id){ 
          pharmacy = p.Name;
        }
      });
      return pharmacy;
    },
    pharmacy_options() {
      let id = this.getUser().selectedPharmacy;
      let pharmacies = this.$auth.user.pharmacies;
      let pOptions = [{ value: null, text: "Keine Apotheke ausgewählt" } ];
      pharmacies.forEach((p) => {
        if(id == p.Id){
         pOptions[0] = { value: null, text: p.Name };
        } else {
          pOptions.push({ value: p.Id, text: p.Name });
        }
      });
      console.log(pOptions)
      return pOptions;
    }
  },
  methods: {
     /**
     * Sets the default pharmacy
     */
    setPharmacy() {
      try {
        // prettier-ignore
        this.$axios.post('/user/selectedPharmacy', {
            "selectedPharmacy": this.selected_pharmacy
      }).then(() => {
        this.getUser();
         this.$store.dispatch("signees/loadSignees")
         this.$refs["pharmacy-modal"].hide()
      });
      } catch (error) {
         
        console.log(error);
      }
      
    },
    validatePin(pin) {
      return /^\d{4,10}/.test(pin);
    },

    setPin() {
      if (this.pin == this.cPin) {
        // prettier-ignore
        this.$axios.post('/user/pin', {
          "pin": this.pin
      }).then(resp => {
        this.getUser()
        this.$refs["pin-modal"].hide()
      }).catch(error => {
         
        console.log(error)
      });
      }
    }
  }
};
</script>

<style scoped>
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
