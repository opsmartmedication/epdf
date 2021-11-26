<template>
  <div>
    <div class="button-wrapper">
      <div class="sign-button-container">
        <b-button class="btn custom_button-shadow" to="/patient"
          >Fertig</b-button
        >
      </div>
    </div>
    <b-button
      class="btn custom_button-shadow download-btn"
      @click="saveByteArray($route.params.name, bufferArray)"
      style="z-index: 10"
      >Download</b-button
    >
    <client-only>
      <PDFSignatureView :src="bufferArray" :editable="false" />
    </client-only>
  </div>
</template>

<script>
export default {
  validate({ params, query, redirect }) {
    if (!params.data || !query.document) {
      redirect("/patient");
      return;
    } else {
      return true;
    }
  },
  created() {
    if (process.browser) {
      window.addEventListener("beforeunload", this.beforeUnload, false);
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener("beforeunload", this.beforeUnload, false);
    }
  },
  computed: {
    bufferArray() {
      if (this.$route.params.data != undefined) {
        return this.base64ToArrayBuffer(this.$route.params.data);
      } else {
        return null;
      }
    }
  },
  methods: {
    beforeUnload(event) {
      event.returnValue = "";
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
    }
  }
};
</script>

<style scoped>
.button-wrapper {
  width: 300px;
  position: absolute;
  top: 4.6rem;
  left: 2rem;
  z-index: 10;
}

.sign-button-container {
  position: fixed;
  width: 25%;
  margin: 0;
}
.btn {
  color: black;
  background: white;
  border: 1px solid black;
  margin: 5px;
}
.btn:focus {
  outline: none;
}
.download-btn {
  position: fixed;
  top: 4.6rem;
  right: 2rem;
}
</style>
