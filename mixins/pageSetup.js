import { PDFDocument, PDFName, PDFArray } from "pdf-lib";
export default {
  methods: {
    /**
     * Creates a html checkbox for the actual pdf form field checkbox
     *
     * @param Object pdfDoc
     *   The complete pdf document
     * @param Object pageCanvas
     *   The canvas (with its dimensions) of the page
     * @param Object field
     *   The specific form field of the pdf
     * @param Int pageNumber
     *   The index of the page of the current field
     */
    createCheckbox(pdfDoc, pageCanvas, field, pageNumber) {
      const rect = pageCanvas.getBoundingClientRect();
      const fieldSize = field.acroField.getWidgets()[0].getRectangle();

      let inputField = this.createInputField(
        pdfDoc,
        pageCanvas,
        fieldSize,
        pageNumber
      );
      inputField.style.border = "none";
      inputField.style.outline = "none";
      // inputField.style.background = "lightblue";
      inputField.type = "checkbox";

      if (field.isChecked()) {
        inputField.checked = true;
      }

      //inputFields.push([inputField, field.ref]);

      document.getElementById("page-" + pageNumber).appendChild(inputField);
      return inputField;
    },

    /**
     * Creates html radiobuttons for the actual pdf form field radiobuttons
     *
     * @param Object pdfDoc
     *   The complete pdf document
     * @param Object pageCanvas
     *   The canvas (with its dimensions) of the page
     * @param Object field
     *   The specific form field of the pdf
     * @param Int pageNumber
     *   The index of the page of the current field
     */
    createRadioButton(pdfDoc, pageCanvas, field, pageNumber) {
      let radioButtons = field.acroField.getWidgets();
      let createdBtns = [];
      radioButtons.forEach((btn) => {
        const fieldSize = btn.getRectangle();

        let inputField = this.createInputField(
          pdfDoc,
          pageCanvas,
          fieldSize,
          pageNumber
        );
        inputField.style.border = "none";
        inputField.style.outline = "none";
        inputField.type = "radio";
        inputField.name = field.getName();
        

        createdBtns.push([inputField, btn.getOnValue()]);
        document.getElementById("page-" + pageNumber).appendChild(inputField);
      });
      return createdBtns;
    },

    /**
     * Creates a html input textfield for the actual pdf form field textfield
     *
     * @param Object pdfDoc
     *   The complete pdf document
     * @param Object pageCanvas
     *   The canvas (with its dimensions) of the page
     * @param Object field
     *   The specific form field of the pdf
     * @param Int pageNumber
     *   The index of the page of the current field
     */
    createTextField(pdfDoc, pageCanvas, field, pageNumber) {
      const fieldText = field.getText();
      const fieldSize = field.acroField.getWidgets()[0].getRectangle();

      let inputField = this.createInputField(
        pdfDoc,
        pageCanvas,
        fieldSize,
        pageNumber
      );
      inputField.style.border = "none";
      inputField.style.outline = "none";
      inputField.style.background = "#cbedf8";
      inputField.style.lineHeight = fieldSize.height + "px;";


      if (field.isRequired()) {
        inputField.style.border = "1px solid red";
      }

      if (fieldText != undefined) {
        inputField.value = fieldText;
      }

      document.getElementById("page-" + pageNumber).appendChild(inputField);

      return inputField;
    },

    /**
     * Creates a html button for the actual pdf form field signature
     *
     * @param Object pdfDoc
     *   The complete pdf document
     * @param Object pageCanvas
     *   The canvas (with its dimensions) of the page
     * @param Object field
     *   The specific form field of the pdf
     * @param Int pageNumber
     *   The index of the page of the current field
     */
    createSignatureField(pdfDoc, pageCanvas, field, pageNumber) {
      const rect = pageCanvas.getBoundingClientRect();
      const signatureButton = document.createElement("button");
      const fieldSize = field.acroField.getWidgets()[0].getRectangle();

      // calculating absolute screen coordinates out of pdf relative coordinates
      const absoluteX = (fieldSize.x * 4 * rect.width) / pageCanvas.width;
      const absoluteY =
        ((pdfDoc.getPage(pageNumber - 1).getSize().height - fieldSize.y) *
          rect.height *
          4) /
        pageCanvas.height;

      signatureButton.style =
        "position:absolute;left:" +
        absoluteX +
        "px;top:" +
        (absoluteY - 1.0 * fieldSize.height) +
        "px;width:" +
        fieldSize.width +
        "px;height:" +
        fieldSize.height +
        "px;";

      signatureButton.style.border = "3px solid red";
      signatureButton.style.marginTop = "-12.5rem";
      signatureButton.style.marginLeft = "-5.5rem";
      signatureButton.style.outline = "none";
      signatureButton.style.background = "none";
      signatureButton.addEventListener("click", this.triggerSignature);

      document
        .getElementById("page-" + pageNumber)
        .appendChild(signatureButton);
    },
  // Attach listener function on state changes
    /**
     * Creates a html input field
     *
     * @param Object pdfDoc
     *   The complete pdf document
     * @param Object pageCanvas
     *   The canvas (with its dimensions) of the page
     * @param Object fieldSize
     *   The specific dimensions of the form field of the pdf
     * @param Int pageNumber
     *   The index of the page of the current field
     */
    createInputField(pdfDoc, pageCanvas, fieldSize, pageNumber) {
      const rect = pageCanvas.getBoundingClientRect();
      const inputField = document.createElement("input");

      // calculating absolute screen coordinates out of pdf relative coordinates
      const absoluteX = (fieldSize.x * 3.2 * rect.width) / pageCanvas.width;
      const absoluteY =
        ((pdfDoc.getPage(pageNumber - 1).getSize().height - fieldSize.y) *
          rect.height *
          3.2) /
        pageCanvas.height;
      inputField.style =
        "position:absolute;left:" +
        absoluteX +
        "px;top:" +
        (absoluteY - 1.0 * fieldSize.height) +
        "px;width:" +
        fieldSize.width +
        "px;height:" +
        fieldSize.height +
        "px;";

      inputField.style.lineHeight = fieldSize.height + "px !important;";

      inputField.style.padding = "0";
      return inputField;
    }
  }
};
