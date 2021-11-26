<template>
  <div class="container-fluid pdf-view_container">
    <div class="button-wrapper">
      <div class="button-container">
        <b-button
          v-b-toggle.sidebar-1
          class="btn custom_button-shadow"
          variant="dark"
          style="color: white"
        >
          Seitenvorschau
        </b-button>
      </div>
    </div>
    <div class="row">
      <div class="">
        <b-sidebar
          id="sidebar-1"
          backdrop-variant="transparent"
          backdrop
          shadow
          bg-variant="dark"
          text-variant="light"
        >
          <template slot="title"> PDF Vorschau </template>

          <b-container class="preview">
            <PDFPreview
              id="s-preview"
              :pdfFile="pdfFile"
              @change-page="jumpToPage"
            />
          </b-container>
        </b-sidebar>
      </div>

    
        <PDFDocument
          :pdfFile="pdfFile"
          :jumpPageIndex="jumpPageIndex"
          @page-index-null-event="jumpToPage(null)"
          :editable="editable"
        />
     
    </div>
  </div>
</template>

<script>
import PdfjsWorker from "worker-loader!pdfjs-dist/es5/build/pdf.worker.js";
import PDFPreview from "./PDFPreview.vue";
import PDFDocument from "./PDFDocument.vue";
import pdfTools from "~/mixins/pdfTools.js";
export default {
  mixins: [pdfTools],
  components: {
    PDFDocument,
    PDFPreview
  },
  props: {
    src: {
      type: null
    },
    skipToSignature: {
      type: Boolean
    },
    editable: {
      type: Boolean
    }
  },
  watch: {
    src(newValue, oldValue) {
      if (oldValue != newValue && newValue.length != 0) {
        this.loadNewPdf();
      }
    },
    skipToSignature(newValue, oldValue) {
      if (newValue != oldValue && this.signatureIndex != null) {
        this.jumpToPage(this.signatureIndex);
      }
    }
  },
  computed: {
    signatureIndex() {
      const fields = this.$store.state.contracts.currentContract.fields;
      let signatureIndex = null;
      fields.forEach((element) => {
        if (element.name == "signature") {
          signatureIndex = element.pageIndex + 1;
        }
      });
      return signatureIndex;
    }
  },
  data() {
    return {
      pdfjsLib: null,
      pdfFile: null,
      jumpPageIndex: 0,
      toggleSBar: false,
      loadingTask: null
    };
  },
  beforeDestroy() {
    this.pdfjsLib.GlobalWorkerOptions.workerPort.terminate();
  },
  created() {
    this.pdfjsLib = require("pdfjs-dist/es5/build/pdf.js");
    this.pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();
    if (this.src.length != 0) this.loadNewPdf();

    this.$nuxt.$on("reload-pdf", () => {
      this.loadNewPdf();
    });
  },

  methods: {
    /**
     * Loads pdf file and inits the preparation process of each page
     */
    async loadNewPdf() {
      this.$nuxt.$loading.start();
      let wait_on = 2;
      let pF = this.pdfFile;
      let src = this.src;
      try {
        this.loadingTask = this.pdfjsLib.getDocument(src)
      } catch (error) {
        console.log(error)
        return
      }
      this.pdfFile = await this.loadingTask.promise.then(function (pdf) {
        return pdf;
      });
      this.$nuxt.$once("render-finished", () => {
        if (this.editable) {
          if (this.$store.state.contracts.currentContract.fullRender) {
            this.destroyInputFields();
            for (let i = 1; i <= this.pdfFile.numPages; i++) {
              try {
                this.prepareNewPage(i);
              } catch (error) {
                 
                console.log(error)
              }
            }
          }
          this.$store.commit("contracts/saveFullRender", true);
        }
      
        wait_on--;
      
        if (wait_on == 0) {
         
        }
        this.$nuxt.$loading.finish();
      });
      this.$nuxt.$once("preview-render-finished", () => {
       
        wait_on--;
      
        if (wait_on == 0) {
          this.cleanupLoadingTask();
        }
      });
    },

    cleanupLoadingTask() {
      this.loadingTask.destroy();
    },

    jumpToPage(n) {
      this.jumpPageIndex = n;
    }
  }
};
</script>

<style scoped>
 .pdf-view_container {
  margin-top: 4.5rem;
} 
.document-container {
  overflow: visible;
  margin-top: 1rem;
  padding: 0 !important;
  display: flex;
  flex-direction: row;
  justify-content: center;
} 
.button-wrapper {
  display: block;
  width: 300px;
  height: 48px;
  position: fixed;
  top: 4.6rem;
  left: 8rem;
  z-index: 10;
}
.button-container {
  position: fixed;
  left: calc(50% - 63px);
}
.btn {
  margin: 5px;
}
</style>
