<template>
  <b-container>
    <div class="header-container">
      <h2>Übersicht Vorlagen <b-button class="refresh-button" variant="secondary" @click="refresh()"><img src="~/assets/icons/refresh.svg" alt=""></b-button></h2>
    </div>
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
    <div class="table-container custom_shadow">
      <b-table
        :filter="search"
        :fields="fields"
        :items="list"
        :filter-included-fields="['Name']"
        head-variant="dark"
        class="patient-table"
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
        <template v-slot:head(actions)="data">
          <div class="text-right">{{ data.label }}</div>
        </template>
        <template v-slot:cell(actions)="row3">
          <div class="text-right">
            <b-button
              @click="viewDocument(row3.item)"
              class="custom_table-button"
            >
              <img src="~/assets/icons/eye.svg" alt="Ansehen" />
            </b-button>
          </div>
        </template>
      </b-table>
    </div>
    <b-modal
      id="delete-modal"
      ref="delete-modal"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-backdrop
      hide-footer
      centered
      title="Löschen bestätigen"
    >
      <b-button variant="dark" @click="$bvModal.hide('delete-modal')"
        >Abbrechen
      </b-button>
      <b-button variant="danger" @click="deleteDocument()">Löschen </b-button>
    </b-modal>
  </b-container>
</template>

<script>
import { mapState } from "vuex";
import { BIcon, BIconSearch } from "bootstrap-vue";
export default {
  components: {
    BIcon,
    BIconSearch
  },
  data() {
    return {
      search: "",
      fields: [
        {
          key: "Name",
          label: "Vorlage",
          class: "custom-cell",
          sortable: true
        },
        {
          key: "createdAt",
          label: "Erstellt",
          class: "custom-cell",
          sortable: true
        },
        {
          key: "actions",
          class: "custom-button-cell",
          label: "Aktion"
        }
      ],
      selectedContract: null
    };
  },
beforeMount(){
    this.$nextTick(() => {
       this.$nuxt.$loading.start()
    })
},
  mounted() {
      this.$nextTick(() => {
    this.$store.dispatch("contracts/loadContractTemplates").then(() => {
      this.$nuxt.$loading.finish()
    })

  })


  },

  computed: {
    ...mapState("contracts", ["list"])
  },

  methods: {
    /**
     * Gets the base64 string of the actual pdf and redirects to the view page
     *
     * @param Object doc
     *   The complete document data
     */
    async viewDocument(doc) {
      this.$nuxt.$loading.start()
      this.$axios
        .get(`/ContractTemplate/${doc.ContractTemplateId}`)
        .then((resp) => {
  

          this.$router.push({
            name: "view-document",
            params: { data: resp.data.recordset[0].ContractTemplateData },
            query: {
              document: doc.Name + "-" + doc.ContractTemplateId
            }
          });
        })
        .catch((error) => {
           
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
     refresh(){
       this.$nuxt.$loading.start()
       setTimeout(function(){ this.$nuxt.$loading.finish() }, 1000);
       this.$store.dispatch("signees/loadSignees")
    }
  }
};
</script>

<style scoped>
.header-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
  margin-bottom: 1rem;
  margin-top: 2.5rem;
}

/deep/ .custom-cell {
  max-width: 100px;
  overflow: hidden;
}

/deep/ .custom-button-cell {
  width: 130px;
}
</style>
