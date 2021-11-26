import { PDFDocument } from "pdf-lib";
import { ImageAlignment } from "pdf-lib/cjs/api/image";
export default {
  methods: {
    /**
     * Embeds the signature image into the pdf signature field
     *
     * @param String imgSrc
     *   The source of the signature image
     */
    async addSignature(imgSrc) {
      const bufferArray = this.$store.state.contracts.currentContract.byteArray;
      if (!bufferArray) {
        return;
      }

      const pdfDoc = await PDFDocument.load(bufferArray);

      const pngImage = await pdfDoc.embedPng(imgSrc);
      const form = pdfDoc.getForm();

      // get signature
      try {
        if (form.getButton("signature")) {
          const { width, height } = form
            .getButton("signature")
            .acroField.getWidgets()[0]
            .getRectangle();
          const iWidth = pngImage.scaleToFit(width, height).width;
          const iHeight = pngImage.scaleToFit(width, height).height;
          pngImage.width = iWidth * 2;
          pngImage.height = iHeight * 2;
          form.getButton("signature").setImage(pngImage, ImageAlignment.Left);
        }
      } catch (error) {}

      const pdfBytes = await pdfDoc.save();
      this.$store.commit("contracts/saveFullRender", false);
      this.$store.commit("contracts/saveBuffer", pdfBytes);
      this.$store.commit("contracts/saveSigned", true);
    },

    /**
     * Undo the last stroke of the signature pad
     */
    undo() {
      this.$refs.signaturePad.undoSignature();
    },

    /**
     * Saves the signature image of the signature pad
     */
    save() {
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature();

      if (!isEmpty) {
        this.addSignature(data);
        this.$refs["signature-modal"].hide();
      }
    }
  }
};
