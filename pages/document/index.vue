<template>
  <b-container>
    <b-button
      to="/patient"
      variant="primary"
      class="custom_button-shadow back_button"
      >Zurück</b-button
    >
    <div class="header_container">
      <h2>Dokument auswählen</h2>
    </div>
    <div class="row">
      <div class="col-2"></div>

      <div class="table-container col-12">
        <div class="table-wrapper">
          <b-input-group class="custom_shadow" style="margin-bottom: 0.5rem">
            <b-form-input
              v-model="search"
              type="search"
              autocomplete="off"
              placeholder="Suchen"
            ></b-form-input>
            <b-input-group-append is-text>
              <b-icon icon="search"></b-icon>
            </b-input-group-append>
          </b-input-group>
          <div class="table-container custom_shadow custom_table">
            <b-table
              :filter="search"
              :fields="fields"
              :items="list"
              hover
              head-variant="dark"
              @row-clicked="prepareDoc"
            >
              <template v-slot:cell(Name)="row2">
                {{ row2.item.Name }}
                {{ row2.item.Description }}
              </template>
              <template v-slot:cell(createdAt)="row2">
                {{ convertDate(row2.item.createdAt) }}
                <br>
                Version: {{ row2.item.Version }}
              </template>
              <template v-slot:cell(Choose)="row2">
                <b-button
                  class="custom_table-button"
                  @click="prepareDoc(row2.item)"
                >
                  <img src="~/assets/icons/edit.svg" alt="+" />
                </b-button>
              </template>
            </b-table>
          </div>
        </div>
      </div>
    </div>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import pdfTools from "~/mixins/pdfTools.js";
import user from "~/mixins/user.js";
import { BIcon, BIconSearch } from "bootstrap-vue";
export default {
  components: {
    BIcon,
    BIconSearch
  },
  mixins: [pdfTools, user],
  validate({ params, redirect }) {
    if (!params.data) {
      redirect("/patient");
      return;
    } else {
      return true;
    }
  },
  beforeMount(){
    this.$nextTick(() => {
       this.$nuxt.$loading.start()
    })
},
  mounted() {

    this.$store.dispatch("contracts/loadContractTemplates").then(() => {
       this.$nuxt.$loading.finish();
    })
     
  },
  data() {
    return {
      search: "",
      fields: [
        {
          key: "Name",
          label: "Name",
          sortable: true
        },
        {
          key: "createdAt",
          label: "Erstellt am",
          sortable: true
        },
        {
          key: "Choose",
          label: "Aktion",
          sortable: false
        }
      ]
    };
  },
  computed: {
    ...mapState("contracts", ["list"]),
    user(){
      return this.getUser()
    } 
 },

  methods: {
    /**
     * Saves contractID and contract base64 data to store and logs out user via logoutWithPin route
     *
     * @param Object contract
     * The contract object containing all contract information
     */
    prepareDoc(contract) {
      this.$nuxt.$loading.start()
      this.$store.commit("contracts/reset");
      const contractList = this.$store.state.contracts.list;

      this.$store.commit(
        "contracts/saveIndex",
        contractList.indexOf(contract)
      );
     
      this.getContractTemplateData(contract).then(() => {
        this.initLogout(contract);
      })
    },

    initLogout(contract) {
      let signeeId = this.$store.state.signees.currentSignee.Id;

        // prettier-ignore    
        this.$axios.post('/logoutPinToken', {
          "signeeId": signeeId
        })
        .then((resp) => {
          this.changeUserRole('Signee')

          this.$store.commit("signees/SET_SIGNEES", []);
          this.$router.push({
            path: "/document/view",
            query: {
              document: contract.Name + "-" + contract.ContractTemplateId
            }
          });
          }).catch(error => {
            console.log(error);
          })
    },

    async getContractTemplateData(contract) {
      this.$axios
        .get(`/ContractTemplate/${contract.ContractTemplateId}`)
        .then((resp) => {
          const existingPdfBytes = this.base64ToArrayBuffer(
            resp.data.recordset[0].ContractTemplateData
          );
          this.$store.commit("contracts/saveBuffer", existingPdfBytes);
        }).catch((error) => {
          console.log(error);
        });
    },

    convertDate(date) {
      date = new Date(date);
      return (
        ("0" + date.getDate()).slice(-2) +
        "." +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        "." +
        date.getFullYear()
      );
    },
  }
};
</script>

<style scoped>
.header_container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
  margin-bottom: 1rem;
  margin-top: 2.5rem;
  width: 100%;
}
.header-container h2 {
  text-align: center;
}
.table-wrapper {
  width: 100%;
}

.back_button {
  position: absolute;
  left: 3rem;
}

@media screen and (max-width: 600px){
  .back_button{
    left: 1rem;
  }
}
</style>
