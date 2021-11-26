<template>
  <b-container class="container">
    <div class="header-container">
      <h2>
        Übersicht Patienten
        <b-button class="refresh-button" variant="secondary" @click="refresh()"
          ><img src="~/assets/icons/refresh.svg" alt=""
        /></b-button>
      </h2>
    </div>
    <div class="input_group--container">
      <b-input-group class="custom_shadow table--input">
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
      <b-button
        variant="primary"
        to="/patient/new"
        class="custom_button-shadow button button--add-patient"
      >
        <img src="~/assets/icons/add-patient.svg" alt="Patient hinzufügen" />
      </b-button>
    </div>
    <div class="table-container custom_shadow custom_table">
      <b-table
        :filter="search"
        :fields="fields"
        :items="list"
        sort-by="LastName"
        head-variant="dark"
        class="table"
        responsive
        sticky-header="70vh"
      >
        <template v-slot:cell(Birthdate)="row2">
          <p v-if="row2.value != ''" v-text="convertDate(row2.value)"></p>
          <h3 v-else class="header--alt text-center">-</h3>
        </template>
        <template v-slot:head(allDocuments)="data">
          <div class="text-center">{{ data.label }}</div>
        </template>
        <template v-slot:cell(allDocuments)="row2">
          <div class="text-right">
            <b-button
              @click="getAllDocuments(row2.item)"
              class="custom_table-button"
              v-if="row2.item.hasContract === 1"
            >
              <img src="~/assets/icons/document.svg" alt="+" />
            </b-button>
            <h3 v-else class="header--alt text-center">-</h3>
            <b-button
              @click="onChangeSupplyMandate(row2.item)"
              class="custom_table-button"
            >
              <img
                src="~/assets/icons/add-document.svg"
                alt="Anzeigen"
                style="color: white"
              />
            </b-button>
          </div>
        </template>
      </b-table>
    </div>

    <b-modal
      id="document-modal"
      size="fullscreen"
      class="custom_modal"
      ref="document-modal"
      :title="
        'Alle Dokumente von ' +
        selectedSignee.LastName +
        ', ' +
        selectedSignee.FirstName
      "
      header-bg-variant="secondary-dark"
      header-text-variant="light"
      footer-bg-variant="light"
      footer-text-variant="dark"
    >
      <b-container v-if="contractData.length !== 0">
        <div class="custom_shadow table-container">
          <b-table
            :fields="documentFields"
            :items="contractData"
            sort-by="createdAt"
            sort-direction="desc"
            :sort-compare="datesSorter"
            head-variant="dark"
            responsive
            sticky-header="70vh"
          >
            <template v-slot:cell(createdAt)="row2">
              <p v-text="convertDate(row2.value)"></p>
            </template>
            <template v-slot:head(view)="data">
              <div class="text-center">{{ data.label }}</div>
            </template>
            <template v-slot:cell(view)="row3">
              <div class="text-center">
                <b-button
                  variant="primary"
                  @click="viewDocument(row3.item)"
                  class="custom_table-button btn"
                >
                  <img
                    src="~/assets/icons/eye.svg"
                    alt="Ansehen"
                    style="color: white"
                  />
                </b-button>
              </div>
            </template>
            <template v-slot:head(download)="data">
              <div class="text-center">{{ data.label }}</div>
            </template>
            <template v-slot:cell(download)="row3">
              <div class="text-center">
                <b-button
                  variant="primary"
                  @click="downloadDocument(row3.item)"
                  class="custom_table-button btn"
                >
                  <img
                    src="~/assets/icons/download.svg"
                    alt="Download"
                    style="color: white"
                  />
                </b-button>
              </div>
            </template>
          </b-table>
        </div>
      </b-container>
      <div v-else>Es sind noch keine Dokumente vorhanden</div>
      <template #modal-footer="{ close }">
        <b-btn class="m-auto" variant="dark" @click="close()">Fertig</b-btn>
      </template>
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
          key: "LastName",
          label: "Name",
          class: "custom-cell",
          sortable: true
        },
        {
          key: "FirstName",
          label: "Vorname",
          class: "custom-cell",
          sortable: true
        },
        {
          key: "Birthdate",
          label: "Geburtsdatum",
          class: "custom-cell",
          sortable: true
        },

        {
          key: "allDocuments",
          class: "custom-button-cell",
          label: "Aktion"
        }
      ],
      documentFields: [
        {
          key: "Name",
          label: "Dokument"
        },
        {
          key: "createdAt",
          label: "Unterschrieben am"
        },
        {
          key: "view",
          label: "Ansehen"
        },
        {
          key: "download",
          label: "Download"
        }
      ],
      selectedSignee: {},
      contractData: []
    };
  },
  beforeMount() {
    this.$nextTick(() => {
      this.$nuxt.$loading.start();
    });
  },
  mounted() {
    this.$store.dispatch("signees/loadSignees").then(() => {
      setTimeout(() => {
        this.$nuxt.$loading.finish();
      }, 500);
    });
  },

  computed: {
    ...mapState("signees", ["list"])
  },
  methods: {
    /**
     * Selects signee, saves signee to store and then redirects to get-document page
     *
     * @param Object signee
     *   The signee object
     */
    onChangeSupplyMandate(signee) {
      this.selectedSignee = signee;

      this.$store.commit("signees/saveAll", this.selectedSignee);
      this.$router.push({
        name: "get-document",
        params: { data: true }
      });
    },

    /**
     * Fetches all contracts of a specific signee
     *
     * @param Object signee
     *   The signee object
     */
    getAllDocuments(signee) {
      this.$nuxt.$loading.start();
      this.selectedSignee = signee;
      this.$axios
        .get(`/signee/${signee.Id}/contractInformation`)
        .then((response) => {
          this.contractData = response.data.recordset;
          this.$refs["document-modal"].show();
          this.$nuxt.$loading.finish();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    /**
     * Gets the base64 string of the actual pdf and redirects to the view page
     *
     * @param Object doc
     *   The complete document data
     */
    async viewDocument(doc) {
      this.$nuxt.$loading.start();
      this.$axios
        .get(`/contract/${doc.ContractId}`)
        .then((response) => {
          let contractData = response.data.recordset[0].ContractData;
          this.$router.push({
            name: "view-signed-document",
            params: { data: contractData, name: doc.Name },
            query: {
              document: doc.Name + " " + doc.ContractId
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

    datesSorter(a, b) {
      if (new Date(a.createdAt) < new Date(b.createdAt)) return 1;
      if (new Date(a.createdAt) > new Date(b.createdAt)) return -1;
      return 0;
    },

    /**
     * Gets the base64 string of the actual pdf
     *
     * @param Object doc
     *   The complete document data
     */
    async downloadDocument(doc) {
      this.$nuxt.$loading.start();

      this.$axios
        .get(`/contract/${doc.ContractId}`)
        .then((response) => {
          let contractData = response.data.recordset[0].ContractData;
          let bufferArray = this.base64ToArrayBuffer(contractData);
          this.saveByteArray(doc.Name, bufferArray);
          this.$nuxt.$loading.finish();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    /**
     * Creates pdf download based on buffer array and reportName
     *
     * @param String reportName
     *   The complete document data
     * @param Buffer byte
     *   The complete pdf base64 string as buffer array
     */
    saveByteArray(reportName, byte) {
      var blob = new Blob([byte], { type: "application/pdf" });
      var link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      var fileName = reportName;
      link.download = fileName;
      link.click();
    },

    /**
     * Creates a buffer out of the base64 string
     *
     * @param String data
     *   The base64 string of the current contract
     */
    base64ToArrayBuffer(data) {
      let bString = window.atob(data);
      let bLength = bString.length;
      let bytes = new Uint8Array(bLength);
      for (let i = 0; i < bLength; i++) {
        let ascii = bString.charCodeAt(i);
        bytes[i] = ascii;
      }
      return bytes;
    },

    refresh() {
      this.$nuxt.$loading.start();
      setTimeout(function () {
        this.$nuxt.$loading.finish();
      }, 1000);
      this.$store.dispatch("signees/loadSignees");
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.header-container {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
  margin-bottom: 1rem;
  margin-top: 2.5rem;
}
.table-container {
  width: 60vw !important;
}
.table--input {
  width: 60vw !important;
}

.button {
  height: 2.5rem;
}
.button--add-patient {
  margin-left: 1rem;
}
.input_group--container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
  max-width: 30rem;
}
.cell-overflow {
  overflow-x: auto;
}
.header--alt {
  display: inline-block;
  width: 48px;
  height: 37.77px;
  margin: 0;
}
/deep/ .custom-cell {
  max-width: 100px;
  overflow: hidden;
}
/deep/ .custom-button-cell {
  width: 130px;
}
.custom_modal {
  max-width: 95%;
}
.custom_modal .modal-dialog {
  min-width: 95%;
}

@media (min-width: 576px) {
  div.modal.custom_modal .modal-dialog {
    width: 95%;
  }
  .button--add-patient {
    right: -1rem;
  }
}

@media (max-width: 1000px) {
  .table-container {
    width: 90vw !important;
  }
  .input_group--container {
    max-width: 50rem;
  }
}
</style>
