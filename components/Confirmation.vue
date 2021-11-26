<template>
  <b-container fluid class="container">
    <div class="confirmation_conainer">
      <div class="check-container">
        <b-icon
          icon="BIconCheck"
          style="width: 100px; height: 100px"
          variant="success"
        ></b-icon>
        <h2 class="text-center">Bestätigung</h2>
      </div>
      <br />
      <br />
      <div v-if="$route.params.data">
        <h4>Das Dokument wurde erfolgreich gespeichert und per Email an:</h4>

        <h3>
          {{ $route.params.data }}
        </h3>

        <h4>versandt</h4>
        <br />
        <br />
      </div>
      <div v-else>
        <h4>Das Dokument wurde erfolgreich gespeichert</h4>
        <br />
        <br />
      </div>
      <b-button v-if="this.isLoginPossible" @click="handleLogin()" variant="primary"
        >Erneuter Login</b-button
      >
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
            @click="login()"
            :disabled="!validatePin(pin)"
            >Login
          </b-button>
        </template>
      </b-modal>
    </div>
  </b-container>
</template>

<script>
import { BIcon, BIconCheck } from "bootstrap-vue";
import user from "~/mixins/user.js";
export default {
  mixins: [user],
  props: {
     isLoginPossible: {
         type: Boolean,
         default: true
     } 
  },
  components: {
    BIcon,
    BIconCheck
  },
  data() {
    const login = this.$axios.create();
    return {
      pin: "",
      loginCount: 0,
      loginInstance: login
    };
  },

  validate({ params, query, redirect }) {
    if (!query.document) {
      redirect("/");
      return;
    } else {
      return true;
    }
  },
  created() {

    if (process.browser) {
      window.addEventListener("beforeunload", this.beforeUnload, true);
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener("beforeunload", this.beforeUnload, true);
    }
  },
computed: {
/*     user() {
      return this.getUser();
    } */
  },
  methods: {
    handleLogin() {
      if (!this.user.hasPin) {
        this.$auth.logout();
      } else {
        this.$refs["pin-login"].show();
      }
    },
    validatePin(pin) {
      return /^\d{4,10}/.test(pin);
    },
    login() {
      // prettier-ignore
      this.loginInstance.post("/loginWithPin", {
        "pin": this.pin
      }).then((resp) => {

        this.changeUserRole('Pharmacist')

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
     checkLogin(){
      if(this.loginCount != 0){
        return false
      } 

    },
    beforeUnload(event) {
      event.returnValue = "";
      this.$store.commit("contracts/reset");
    this.$store.commit("signees/reset");
    },
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.confirmation_conainer {
  margin: 10%;
}
.check-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
#timestamp {
  align-self: flex-end;
}
.button-send:disabled {
  background: var(--dark) !important;
  opacity: 1 !important;
}
</style>
