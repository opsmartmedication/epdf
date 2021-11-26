<template>
  <div>
    <b-modal
      title="Pin eingeben"
      header-bg-variant="dark"
      header-text-variant="light"
      footer-bg-variant="primary"
      footer-text-variant="dark"
      hide-header-close
      no-close-on-esc
      no-close-on-backdrop
      v-model="isPinModalVisible"
    >
    {{pin}}
      <b-form autocomplete="off">
        <b-form-group class="form-group">
          <input v-model="pin"  type="text"   class="mb-2"/>
        
  
        </b-form-group>
      </b-form>
      <template #modal-footer>
        <b-btn
          class="m-auto button-send custom_button-shadow"
          variant="dark"
          @click="validatePin()"
          >Pin bestätigen</b-btn
        >
      </template>
    </b-modal>
    <div v-if="isErrorVisible">
      <b-icon
        icon="exclamation-octagon-fill"
        class="mb-4"
        style="color: #ec0404; width: 80px; height: 80px"
      ></b-icon>
      <h1>{{ errorMessage }}</h1>
    </div>
  </div>
</template>
<script>
import pdfTools from "~/mixins/pdfTools.js";
import user from "~/mixins/user.js";
import { BIcon, BIconExclamationOctagonFill } from "bootstrap-vue";

export default {
  layout: "ext",
  mixins: [pdfTools, user],
  components: {
    BIcon,
    BIconExclamationOctagonFill
  },
  auth: false,
  async asyncData({ params, redirect }) {
    return {
      params,
      redirect
    };
  },
  data() {
    return {
      pin: "",
      isPinModalVisible: true,
      isErrorVisible: false,
      errorMessage: ""
    };
  },
  watch:{
    pin(){
this.pin = this.pin.replace(/[^0-9]/g,'');
    }
  },
  methods: {
    async validatePin() {
      console.log(pin);
      this.$nuxt.$loading.start();
      console.log(this.params.id);
      const res = await this.$axios.post("/accessLink/" + this.params.id, {
        pin: this.pin
      });

      console.log(res);
      if (res.data.error == "ALREADY_SIGNED") {
        this.$nuxt.$loading.finish();
        this.isPinModalVisible = false;
        this.isErrorVisible = true;

        this.errorMessage =
          "Das bereitgestellte Dokument wurde bereits unterschrieben und an die Apotheke versand.";
        return;
        //return this.$nuxt.error({ statusCode: 404, message: 'Das bereitgestellte Dokument wurde bereits unterschrieben und an die Apotheke versand.', layout: 'empty' })
      }

      if (res.data.error == "LINK_DISABLED") {
        this.$nuxt.$loading.finish();
        this.isPinModalVisible = false;
        this.isErrorVisible = true;

        this.errorMessage =
          "Dieser Link ist nicht mehr aktuell.";
        return;
        //return; // this.$nuxt.error({ statusCode: 404, message: 'Dieser Link ist nicht mehr aktuell. ' })
      }

      if (res.data.error == "LINK_EXPIRED") {
         this.$nuxt.$loading.finish();
        this.isPinModalVisible = false;
        this.isErrorVisible = true;

        this.errorMessage =
          "Dieser Link ist nicht mehr aktuell.";
        return;
        //return; //this.$nuxt.error({ statusCode: 404, message: 'Dieser Link ist leider abgelaufen. ' })
      }

      const contractList = this.$store.state.contracts.list;
      console.log(contractList);
      this.isPinModalVisible = false;

      this.$store.commit("contracts/reset");

      console.log("Whats happening");
      console.log(contractList.indexOf(res.data));

      this.$store.commit("contracts/saveIndex", contractList.indexOf(res.data));

      const response = await this.$axios.get(
        "/contractTemplate/" + res.data.contractTemplateId
      );

      this.$store.commit("contracts/saveId", res.data.contractTemplateId);
      this.$store.commit(
        "contracts/saveBuffer",
        this.base64ToArrayBuffer(
          response.data.recordset[0].ContractTemplateData
        )
      );

      /*this.changeUserRole('Signee') */

      this.$router.push({
        path: "/document/ext/view",
        query: {
          document:
            response.data.recordset[0].Name +
            "-" +
            response.data.recordset[0].ContractTemplateId,
          source: this.params.id,
          contractTemplateId: parseInt(
            response.data.recordset[0].ContractTemplateId
          )
        }
      });
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
  .pincode {
        text-security: disc;
        -webkit-text-security: disc;
        -moz-text-security: disc;
    }

</style>
