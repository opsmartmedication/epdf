<template>
  <div>
    <div>
      <b-button
        @click="saveDocument"
        variant="dark button confirm-btn"
        class="button custom_button-shadow"
        :class="signed ? 'custom_button--secondary' : ''"
        style="color: white"
        >Speichern</b-button
      >

      <b-button
        :disabled="!isPinLoginPossible"
        @click="cancel"
        variant="dark"
        class="button custom_button-shadow cancel-button"
        style="color: white"
        >Abbrechen</b-button
      >
    </div>

    <b-modal
      id="sign-modal"
      ref="signature-modal"
      header-bg-variant="dark"
      header-text-variant="light"
      footer-bg-variant="light"
      footer-text-variant="dark"
      centered
    >
      <div slot="modal-title" class="m-auto">Unterschreiben</div>
      <b-container class="siganture-pad_container">
        <VueSignaturePad
          :customStyle="{ border: '3px solid red' }"
          class="signature-pad"
          width="400px"
          height="100px"
          ref="signaturePad"
          :options="{
            onBegin: () => {
              $refs.signaturePad.resizeCanvas();
            }
          }"
        />
      </b-container>
      <template #modal-footer>
        <b-button
          class="m-auto custom_button-shadow"
          variant="dark"
          @click="undo"
          >Zurücksetzen</b-button
        >
        <b-button
          class="m-auto custom_button-shadow"
          variant="dark"
          @click="save"
          >Speichern</b-button
        >
      </template>
    </b-modal>
    <b-modal
      id="alert-modal"
      ref="alert-modal"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-backdrop
      hide-footer
    >
      <div slot="modal-title" class="m-auto">Achtung</div>
      <p>Nicht alle benötigten Felder wurden ausgefüllt!</p>
    </b-modal>
    <b-modal
      id="email-modal"
      ref="email-modal"
      title="Dokument versenden"
      header-bg-variant="dark"
      header-text-variant="light"
      footer-bg-variant="primary"
      footer-text-variant="dark"
      hide-header-close
      no-close-on-esc
      no-close-on-backdrop
    >
      <b-form autocomplete="off">
        <b-form-group class="form-group">
          <label>E-Mail </label>

          <b-form-input
            v-model="userEmail"
            type="text"
            class="mb-2"
            :state="userEmail != '' ? validEmail(userEmail) : null"
          ></b-form-input>
          <b-form-invalid-feedback class="form__feedback">
            Bitte geben Sie eine gültige E-Mailadresse ein!
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form>
      <template #modal-footer>
        <b-btn
          class="m-auto button-send custom_button-shadow"
          variant="dark"
          @click="confirmation(null, source)"
          >Ohne E-Mail fortfahren</b-btn
        >
        <b-btn
          class="m-auto button-send custom_button-shadow"
          variant="dark"
          @click="submitEmail"
          :disabled="!validEmail(userEmail)"
          >Dokument versenden</b-btn
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
      <template #modal-footer="{}">
        <b-button
          class="m-auto button-send"
          variant="dark"
          @click="login()"
          :disabled="!validatePin(pin)"
          >Login
        </b-button>
      </template>
    </b-modal>
    <client-only>
      <PDFSignatureView
        :src="bufferArray"
        :skipToSignature="signatureSkip"
        :editable="true"
      />
    </client-only>
  </div>
</template>

<script>
import signature from "~/mixins/signature.js";
import pdfTools from "~/mixins/pdfTools.js";
import user from "~/mixins/user.js";
export default {
  authorized: false,
  mixins: [signature, pdfTools, user],
  props: {
    isPinLoginPossible: {
      type: Boolean,
      default: true
    },
    document: {
      type: String
    },
    confirmationRouteName: {
      type: String,
      default: "confirmation"
    },
    source: {
      type: String,
      default: null
    },
    contractTemplateId: {
      type: Number,
      default: null
    }
  },
  data() {
    const login = this.$axios.create();
    return {
      signatureSkip: false,
      dateIndex: null,
      userEmail: "",
      pin: "",
      loginCount: 0,
      loginInstance: login
    };
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
    this.$nuxt.$off("trigger-signature");
  },

  mounted() {
    if (this.bufferArray.length == 0) {
      this.$router.push("/patient");
    }
    this.$nextTick(() => {
      let self = this;
      this.$nuxt.$on("trigger-signature", function () {
        self.$refs["signature-modal"].show();
      });
    });
  },
  validate({ query, redirect }) {
    if (!query.document) {
      redirect("/patient");
      return;
    } else {
      return true;
    }
  },
  computed: {
    contract() {
      return this.$store.state.contracts.list[
        this.$store.state.contracts.currentContract.index
      ];
    },
    bufferArray() {
      return this.$store.state.contracts.currentContract.byteArray;
    },
    signed() {
      return this.$store.state.contracts.currentContract.signed;
    }
    /*     user() {
     return this.getUser() 
    } */
  },
  methods: {
    submitEmail() {
      this.$refs["email-modal"].hide();
      this.confirmation(this.userEmail, this.source);
    },

    /**
     * Initializes the contract saving process and redirects to confirmation page
     *
     * @param String email
     *   The email of the signee
     */
    confirmation(email, source) {
      this.$nuxt.$loading.start();

      this.saveDocumentToSignee(email, source, this.contractTemplateId);
      this.$nuxt.$loading.finish();
      console.log("I am here");
      this.$router.push({
        name: this.confirmationRouteName,
        query: {
          document: this.document
            ? this.document
            : this.contract.name + "-" + this.contractTemplateId
        },
        params: { data: email }
      });
    },

    validEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Saves the current input values and shows email modal
     */
    async saveDocument() {
      this.$nuxt.$loading.start();

      const checked = await this.checkRequiredFields();
      // add this.signed
      const signed = this.$store.state.contracts.currentContract.signed;
      if (checked && signed) {
        await this.saveInputValues(true);
        this.$nuxt.$loading.finish();

        this.$refs["email-modal"].show();
      } else {
        this.$nuxt.$loading.finish();
        this.$refs["alert-modal"].show();
      }
    },

    beforeUnload(event) {
      event.returnValue = "";
    },
    cancelPage() {
      this.$router.push({
        name: "get-document",
        params: { data: true }
      });
    },

    cancel() {
      //TODO Add logic that handles no pin login possible
      if (!this.isPinLoginPossible) return;
      if (!this.user.hasPin) {
        this.$auth.logout();
      } else {
        this.$refs["pin-login"].show();
      }
    },
    validatePin(pin) {
      return /^\d{4,10}/.test(pin);
    },

    /**
     * Login with pin token or if no token is set: logout
     */
    login() {
      // prettier-ignore
      this.loginInstance.post("/loginWithPin", {
        "pin": this.pin
      }).then((resp) => {


        this.changeUserRole('Pharmacist');

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

    checkLogin() {
      if (this.loginCount != 0) {
        return false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  color: #2c3e50;
  margin-top: 30px;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.pdf-container {
  margin: auto;
  padding: 0;
}
.button-wrapper {
  width: 300px;
  position: fixed;
  top: 4.6rem;
  left: 0rem;
  z-index: 10;
}
.sign-button-container {
  position: fixed;
  width: 25%;
  margin: 0;
}
.signature-pad {
  margin: auto;
}
.button {
  color: black;
  height: 38px;
  margin: 5px;
}
.confirm-btn {
  position: fixed;
  left: calc(50% + 99px);
  top: 4.6rem;
  z-index: 11;
}

.button:focus {
  outline: none;
}
.button-send:disabled {
  background: #343a40 !important;
  opacity: 1 !important;
}
.form-group {
  position: relative;
  width: 50%;
  margin: auto;
}
.cancel-button {
  position: fixed;
  left: calc(50% - 193px);
  top: 4.6rem;
  z-index: 11;
}
.custom_button--secondary {
  background: var(--secondary);
}
.confirm_container {
  position: relative;
  margin: auto;
  width: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

@media screen and (max-width: 1220px) {
  .sign-button-container {
    width: 40%;
  }
}
@media screen and (max-width: 760px) {
  .sign-button-container {
    width: 60%;
  }
}
@media screen and (max-width: 600px) {
  .sign-button-container {
    width: 40%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>