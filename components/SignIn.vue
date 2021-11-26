<template>
  <div class="container
 d-flex justify-content-center " >
    <section class="vh-100 ">
  <div class="container py-5 h-100">
    <div class="row d-flex align-items-center justify-content-center h-100 ">
      <div class="col-md-5 col-lg-7 order-md-2  col-xl-6 itp-info-container hover polaroid " >
        <img src="~/assets/icons/login_background.png" class="img-fluid  "  alt="Phone image">
      </div>
      <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1 ">
        <h4 class="">Login</h4>
          <b-form
          class=""
          @submit.prevent="login"
          autocomplete="off"
        >
          <b-form-group>
            <label>Benutzername:</label>
            <b-form-input
              type="text"
              class="mb-2"
              v-model.trim="credentials.username"
              :state="loginState"
            ></b-form-input>
          </b-form-group>
          <b-form-group id="input--password">
            <label>Passwort:</label>
            <b-form-input
              type="password"
              class="mb-2"
              v-model="credentials.password"
              :state="loginState"
            ></b-form-input>
             <nuxt-link
            class="link--reset-password"
            to="/auth/login/reset-password"
          >
            Support kontaktieren</nuxt-link
          >
           <a href="#!" class="small text-muted">Terms of use.</a>
                  <a href="#!" class="small text-muted">Privacy policy</a>
          </b-form-group>

         
          
          <b-button
            class="form__button--sign-in custom_button-shadow mb-2 "
            type="submit"
            variant="primary"
            :disabled="!validInput"
            >Anmelden</b-button
          >

          <b-button v-b-modal.pin-login class="btn" v-show="hasPin">Pin-Login</b-button>
      
        </b-form>
      </div>
    </div>
  </div>
</section> 

<!-- ------------------------------------ -->




    <b-modal
      id="pharmacy-modal"
      ref="pharmacy-modal"
      title="Apotheke auswählen"
      header-bg-variant="dark"
      header-text-variant="light"
      footer-bg-variant="primary"
      footer-text-variant="dark"
      hide-header-close
      no-close-on-esc
      no-close-on-backdrop
      size="sm"
    >
      <b-form-select
        v-model="selected_pharmacy"
        :options="pharmacy_options"
      ></b-form-select>
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
      <b-modal
        id="pin-login"
        ref="pin-login"
        header-bg-variant="dark"
        header-text-variant="light"
        hide-backdrop
        centered
        title="Pin-Login"
      >
        <b-form autocomplete="off">
          <b-form-group class="form-group">
            <label>Pin </label>
            <b-form-input
              v-model="pin"
              type="password"
              class="mb-2"
              maxlength="10"
              :state="checkLogin()"
            ></b-form-input>
            <b-form-invalid-feedback class="form__feedback">
            </b-form-invalid-feedback>
          </b-form-group>
        </b-form>
        <template #modal-footer>
          <b-button
            class="m-auto button-send"
            variant="dark"
            @click="pinLogin()"
            :disabled="!validatePin(pin)"
            >Login
          </b-button>
        </template>
      </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    const login = this.$axios.create();
    return {
      credentials: {
        username: "",
        password: ""
      },
      validInput: false,
      pharmacy_options: [{ value: null, text: "Bitte auswählen" }],
      selected_pharmacy: null,
      loginState: null,
       pin: "",
      loginCount: 0,
      loginInstance: login
    };
  },
  watch: {
    credentials: {
      handler: function () {
        this.validateInput();
      },
      deep: true
    },
 
    
  },
  computed:{
    hasPin(){
      try {
        return this.$auth.user.hasPin;
      } catch (error) {
        return false;
      }
    }
  },

  methods: {
    validateInput() {
      if (this.credentials.username != "" && this.credentials.password != "") {
        this.validInput = true;
      } else {
        this.validInput = false;
      }
    },
    validatePin(pin) {
      return /^\d{4,10}/.test(pin);
    },

     checkLogin(){
      if(this.loginCount != 0){
        return false
      } 

    },
      pinLogin() {
      // prettier-ignore
      this.loginInstance.post("/loginWithPin", {
        "pin": this.pin
      }).then((resp) => {
        this.$router.push({
        path: "/patient",
       
      })
      }).catch(error => {
         
        console.log(error);
        this.loginCount++;
        if(this.loginCount >= 3){
          this.$auth.logout();
        }
      })
    },

    /**
     * User login with cookie scheme and checks if user has multiple pharmacies and no default pharamcy set
     */
    async login() {
      this.$auth
        .loginWith("cookie", {
          data: this.credentials
        })
        .then((res) => {
          this.$axios
            .get("/user")
            .then((resp) => {

              this.$auth.setUser(resp.data);
              let pharmacies = this.$auth.user.pharmacies;
              let selectedPharmacy = this.$auth.user.selectedPharmacy;
              if (pharmacies.length > 1 && !selectedPharmacy) {
                let pOptions = [{ value: null, text: "Bitte auswählen" }];
                pharmacies.forEach((p) => {
                  pOptions.push({ value: p.Id, text: p.Name });
                });
                this.pharmacy_options = pOptions;
                this.$refs["pharmacy-modal"].show();
              } else {
                this.$router.push("/patient");
              }
            })
            .catch((error) => {
               
              console.log(error);
            });
        })
        .catch((error) => {
           
          console.log(error);
          this.loginState = false;
        });
    },

    /**
     * Sets selected pharmacy as default pharmacy
     */
    setPharmacy() {
      try {
        // prettier-ignore
        this.$axios.post('/user/selectedPharmacy', {
            "selectedPharmacy": this.selected_pharmacy
      }).then(this.$router.push("/patient"));
      } catch (error) {
         
        console.log(error);
      }
    }
  }
};
</script>

<style scoped>
.card{
  border-color: gainsboro;
}
  .container {
/* 
  justify-content: center;
  align-items: center; */

  animation: transitionIn 0.8s ease;
} 
.itp-info-container {
  /*  width: 27rem; */ 
  /*  height: 32rem;  */
  background: var(--primary);
 /*  margin: auto; */
 /*  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; */
  color: white;
}
/* .login__container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 27rem;
  height: 32rem;
  margin: auto;
}
.container__form {
  margin-top: 1rem;
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
} */
/* #input--password {
  margin-bottom: 0;
}
.form__button--sign-in {
  margin-top: 2rem;
  width: 10rem;
  align-self: center;
}
.button--pin{
  border: none;
  background: none;
  color: black;

}
.button--pin:active{
  border: none !important;
  background: none !important;
  color: black !important;
}

.link--reset-password {
  align-self: flex-end;
  color: black;
}
.container__footer {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: center;
}

@keyframes transitionIn {
  from {
    opacity: 0;
    transform: rotateY(100deg);
  }

  to {
    opacity: 1;
    transform: rotateY(0);
  }
}  */
@keyframes transitionIn {
  from {
    opacity: 0;
    transform: rotateY(100deg);
  }

  to {
    opacity: 1;
    transform: rotateY(0);
  }
}
@media (max-width: 800px) {
  .itp-info-container {
    width:70%;
    height: 30%;
  }
}
/* @media (min-width: 768px) {
  .itp-info-container {
    width:100%;
    height: 100%;
  }
} */
 @media (min-width: 1008px) {
  .itp-info-container {
display: flex;
justify-content: center;
height: 80%;
  }
}

.hover {
  /* width: 100px;
  height: 100px; */
 /*  background-color: red; */
  animation-name: example;
  animation-duration:10s;
}
@keyframes example {
  0%   {background-color: #ffcc33;}
  25%  {background-color: #fbf49d;}
  50%  {background-color: #e0a800}
  100% {background-color: #a37a00;}
}
.polaroid {
 /*  width: 80%; */
  
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
 /*  margin-bottom: 25px; */
}
</style>
