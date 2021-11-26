import { PDFDocument, PDFName, PDFArray } from "pdf-lib";
import SetupPage from "./pageSetup.js";

export default {
  mixins: [SetupPage],

  computed:{
    contract() {
      return this.$store.state.contracts.list[
        this.$store.state.contracts.currentContract.index
      ];
    },
  },
  methods: {
    /**
     * Checks if a pdf form field is a checkbox
     *
     * @param Object f
     *   The pdf form field
     */
    isCheckbox(f) {
      if (typeof f.isChecked === "function") {
        return true;
      } else {
        return false;
      }
    },
    /**
     * Checks if a pdf form field is a radioGroup
     *
     * @param Object f
     *   The pdf form field
     */
    isRadioGroup(f) {
      if (typeof f.getOptions === "function") {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Checks if a pdf form field is a signature field
     *
     * @param Object f
     *   The pdf form field
     */
    isSignatureField(f) {
      if (f.acroField == "PDFAcroSignature") {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Gets all refs of radio group kids
     *
     * @param Object f
     *   The pdf form radio group
     * 
     * @returns Array of refs
     *   Returns an array of all radio group kids' refs 
     */
    getRadioRef(f){
      if(!this.isRadioGroup(f)){
        return;
      }
      const acroFieldDict = f.acroField.dict.dict.entries();
      
      acroFieldDict.next()
      acroFieldDict.next()
      acroFieldDict.next()

      const refObject = acroFieldDict.next();

      return refObject.value[1].array;
    },

    /**
     * Prepares the page for the html input field layer
     *
     * @param Int pageNumber
     *   The index of the current page
     */
    async prepareNewPage(pageNumber) {
      let inputFields = [];
      const existingPdfBytes = this.$store.state.contracts.currentContract.byteArray;
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pageCanvas = document.getElementById("page-" + pageNumber)
        .firstElementChild;

      const form = pdfDoc.getForm();
      const allFormFields = form.getFields();
    
      const currentPage = pdfDoc.getPages()[pageNumber - 1];
      const fields = this.getCurrentFormFields(allFormFields, currentPage);
           
    
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

        if (this.isCheckbox(field)) {
          let inputField = this.createCheckbox(pdfDoc, pageCanvas, field, pageNumber);
          inputFields.push([inputField, field.ref]);

        } else if (this.isRadioGroup(field)) {
          let radioBtns = this.createRadioButton(pdfDoc, pageCanvas, field, pageNumber);
          inputFields.push([radioBtns, field.ref]);

        } else if (field.getName() !== "signature") {
          let inputField = this.createTextField(pdfDoc, pageCanvas, field, pageNumber);
          inputFields.push([inputField, field.ref]);

        } else if (field.getName() === "signature") {
          this.createSignatureField(pdfDoc, pageCanvas, field, pageNumber);
        }
      }
      this.$store.commit("contracts/concatInputFields", inputFields);
    },


    /**
     * Finds all form fields of the current page
     *
     * @param Array allFormFields
     *   All form fields of the document
     * @param Object currentPage
     *   The current page
     * 
     * @returns All form fields of the current page
     */
    getCurrentFormFields(allFormFields, currentPage) {
      let fields = [];
      const page1AnnotsRaw = currentPage.node.lookupMaybe(
        PDFName.of("Annots"),
        PDFArray
      );

      const page1Annots = page1AnnotsRaw ? page1AnnotsRaw.asArray() : [];
  
      for (let i = 0; i < allFormFields.length; i++) {
        if (page1Annots.includes(allFormFields[i].ref)) {
          fields.push(allFormFields[i]);
        }

        if(this.isRadioGroup(allFormFields[i])){
          const refs = this.getRadioRef(allFormFields[i])

          if (page1Annots.includes(refs[0])) {
            fields.push(allFormFields[i]);
          }

        }
      }

      return fields;
    },

    /**
     * Triggers a signature event in order to show the signature-modal located in documents/view
     */
    triggerSignature() {
      this.$nuxt.$emit("trigger-signature");
    },

    /**
     * Saves all input values of the html input layer to the actual pdf form layer and destroys all input fields
     * 
     * @param Bool destroyInputFields
     * A bool indicating whether to destroy the HTML input fields
     */
    async saveInputValues(destroyInputFields) {
      const existingPdfBytes = this.$store.state.contracts.currentContract.byteArray;
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      let formFields = pdfDoc.getForm().getFields();
      let inputFields = this.$store.state.contracts.currentContract.inputFields;
     
      inputFields.forEach((e) => {
        formFields.forEach((f) => {
          if (e[1] === f.ref) {
            if (this.isCheckbox(f)) {
              if (e[0].checked) {
                f.check();
              } else {
                f.uncheck();
              }
            } else if(this.isRadioGroup(f)){
               this.saveRadiogroupInput(e, f);
            } else if (f.getName() !== "signature") {
              f.setText(e[0].value);
            }
          }
        });
      });
      const pdfBytes = await pdfDoc.save();
      await this.$store.commit("contracts/saveFullRender", false);
      await this.$store.commit("contracts/saveBuffer", pdfBytes);
      
      if (destroyInputFields) this.destroyInputFields();
    },

     /**
     * Saves the selected value of the HTML radiogroup to the PDF form field
     *
     * @param Array inputField (tupel)
     *   The HTML input field (0) and the matching ref (1)
     * @param Object formField
     *   The PDF form field to save the value to
     */
    saveRadiogroupInput(inputField, formField) {
      inputField[0].forEach(field => {
                 
        if(field[0].checked){
          let exportValues = formField.acroField.getOnValues()
          let radioButtons = formField.acroField.getWidgets();

          radioButtons.forEach(rBtn => {
            
            if (rBtn.getOnValue() == field[1]) {
              exportValues.forEach((value) => {
                if(value.encodedName == rBtn.getOnValue().encodedName){
                 try {
                  formField.select(value.decodeText())
                 } catch (error) {
                  this.$nuxt.error({ statusCode: 500})
                 }
                }
              })
              
            }
          })
        }
      });
    },

    /**
     * Destroys all html input fields
     */
    destroyInputFields() {
      let inputFields = this.$store.state.contracts.currentContract.inputFields;
      inputFields.forEach((e) => {
        try {
          e[0].parentNode.removeChild(e[0]);
        } catch (error) {
         try {
          e[0].forEach(f => {
            f[0].parentNode.removeChild(f[0]);
          })
         } catch (error) {
           
         }
        }
      });
      inputFields = [];
      this.$store.commit("contracts/saveInputFields", inputFields);
    },

    /**
     * Calls API in order to save contract in database and sends out email
     *
     * @param String email
     *   The email of signee (if contract should be sent via email)
     */
    async saveDocumentToSignee(email, source, contractTemplateId) {
      this.destroyInputFields();
      const bufferArray = this.$store.state.contracts.currentContract.byteArray;
      const pdfDoc = await PDFDocument.load(bufferArray);
      const form = pdfDoc.getForm();
      form.flatten();
      const b64encoded = await pdfDoc.saveAsBase64();

      const contractTemp = (contractTemplateId) ? contractTemplateId : this.contract.ContractTemplateId;
      const signeeId = this.$store.state.signees.currentSignee.Id;
      this.$axios
        .post("/contract", {
          contractData: b64encoded,
          contractTemplateId: contractTemp,
          patientId: signeeId,
          source: source 
        })
        .then(() => {
          if (email != null && email != undefined) {
            // prettier-ignore
         
            this.$axios
              .post("/contractMail", {
                email: email,
                pdf: b64encoded,
                contractTemplateId: contractTemp
              })
              .catch((error) => {
                 
                console.log(error);
              });
          }else{
            console.log("NO EMAIL")
          }
        })
        .catch((error) => {
           
          console.log(error);
        });
    },
    
    /**
     * Checks if all required pdf fields are filled out
     * 
     * @returns Bool whether all required fields where filled out
     */
    async checkRequiredFields() {
      await this.saveInputValues(false)
      const existingPdfBytes = this.$store.state.contracts.currentContract.byteArray;
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      let approved = true;
      fields.forEach((field) => {
        if (
          !this.isCheckbox(field) &&
          !this.isRadioGroup(field) &&
          field.isRequired() &&
          (field.getText() == undefined || field.getText() == "")
        ) {
          approved = false;
        } else if(this.isRadioGroup(field) && field.isRequired() && field.getSelected() == undefined){
          approved = false;
        }
        
      });

      return approved;
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
    }
  }
};
