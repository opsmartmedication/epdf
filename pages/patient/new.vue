<template>
  <b-container fluid>
    <div class="button-container">
      <b-button variant="primary" to="/patient" class="custom_button-shadow"
        >Zurück</b-button
      >
    </div>
    <div class="header_container">
      <h2>Einen neuen Patienten <br> hinzufügen</h2>
    </div>
    <div class="form-container shadow p-3 mb-5 bg-white rounded">
      <h4>Patientendaten</h4>
      <b-form @submit="onSubmit" autocomplete="off">
        <div class="flex-form">
          <b-form-group class="mb-2 form-group" label-cols-xs="3">
            <label>Name</label>
            <b-form-input
              type="text"
              v-model="form.surname"
              class="mb-2"
              :state="valid"
            ></b-form-input>
            <b-form-invalid-feedback></b-form-invalid-feedback>
          </b-form-group>

          <b-form-group class="mb-2 form-group" label-cols-xs="3">
            <label>Vorname</label>
            <b-form-input
              type="text"
              v-model="form.name"
              class="mb-2"
              :state="valid"
            ></b-form-input>
            <b-form-invalid-feedback></b-form-invalid-feedback>
          </b-form-group>

          <b-form-group class="mb-2 form-group" label-cols-xs="3">
            <label>Geburtsdatum</label>

            <b-form-input
              type="date"
              v-model="form.birthdate"
              placeholder="dd.mm.yyyy"
              class="mb-2"
              :state="form.birthdate == '' ? null : validateDate()"
            ></b-form-input>
            <b-form-invalid-feedback></b-form-invalid-feedback>
          </b-form-group>

          <div>
            <b-button
              id="submit-btn"
              class="custom_button-shadow"
              type="submit"
              variant="dark"
              :disabled="!validInput()"
              >Speichern</b-button
            >
          </div>
        </div>
      </b-form>
    </div>
    <b-modal
      id="signee-modal"
      ref="signee-modal"
      header-bg-variant="dark"
      header-text-variant="light"
      hide-backdrop
    >
      <div slot="modal-title" class="m-auto">Achtung</div>
      <p>
        Die Daten dieser Person existieren bereits!
        <br />
        Ist das die Person, die Sie hinzufügen wollten?
      </p>
      <div class="modal_container--inner">
        <h5>
          {{ duplicateSignee.LastName + ", " + duplicateSignee.FirstName }}
          <br />
          <p v-show="duplicateSignee.Birthdate != ''">
            {{ convertDate(duplicateSignee.Birthdate) }}
          </p>
        </h5>
      </div>
      <div slot="modal-footer">
        <b-button
          variant="primary"
          class="btn custom_button-shadow btn-primary"
          @click="$refs['signee-modal'].hide()"
          >Nein</b-button
        >
        <a href="/app/patient" class="btn custom_button-shadow btn-primary">Ja</a>
      </div>
    </b-modal>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        surname: "",
        birthdate: "",
        address: {
          street: "",
          city: "",
          zipcode: ""
        }
      },
      signee: {},
      valid: null,
      duplicateSignee: {}
    };
  },
  methods: {
    /**
     * Creates new signee and redirects to document page to choose contract to be signed
     *
     * @param Event evt
     *   Form submit event
     */
    onSubmit(evt) {
      evt.preventDefault();
      this.signee = {
        name: this.form.surname,
        firstName: this.form.name,
        birthdate: this.form.birthdate
      };
      this.saveSignee();
    },

    saveSignee() {
       // prettier-ignore
      this.$axios.post("/signee", {
        "firstName": this.form.name,
        "lastName": this.form.surname,
        "birthdate": this.form.birthdate,
        "checkDuplicateSignees": true
      })
      .then((response) => {
        if(response.data.recordset !== undefined && response.data.recordset !== null) {
          this.duplicateSignee = response.data.recordset[0];
          this.$refs["signee-modal"].show();
          return
        } 
          this.$store.dispatch("signees/loadSignees");
          this.signee = {
            name: this.form.surname,
            firstName: this.form.name,
            birthdate: this.form.birthdate,
            Id: response.data.Id
          };
          this.$store.commit("signees/saveAll", this.signee);
          this.$router.push({
            name: "get-document",
            params: { data: true }
          });
        
      }).catch(error => {
        console.log(error)
      })
    },

    /**
     * Validates the input of the 'new signee' form
     */
    validInput() {
      if (
        this.form.name == "" ||
        this.form.surname == "" ||
        (!this.validateDate() && this.form.birthdate !== "")
      ) {
        return false;
      } else if (!/\S/.test(this.form.name) || !/\S/.test(this.form.surname)) {
        return false;
      } else {
        return true;
      }
    },

    validateDate() {
      if (this.form.birthdate === "") {
        return false;
      } else {
        let formDate = this.parseDate(this.form.birthdate);
        let now = new Date();
        let maxDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        let minDate = new Date(20, 0, 1);

        return minDate <= formDate && formDate <= maxDate;
      }
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

    parseDate(input) {
      let parts = input.match(/(\d+)/g);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
  }
};
</script>

<style scoped>
.form-container {
  border: 2px solid var(--primary);
  border-radius: 10px !important;
  width: 35rem;
  height: auto;
  margin: auto;
}
.header_container {
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
text-align: center;
margin-bottom: 3rem;
}
.form-group-container {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 50%;
}
.form-group--address {
  width: 45% !important;
}
.form-container > h4 {
  align-self: center;
  align-content: center;
  width: 100%;
  text-align: center;
}
.flex-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-group {
  position: relative;
  width: 50%;
}

.modal_container--inner {
  text-align: center;
}

#submit-btn {
  color: #ffffff;
}

@media screen and (max-width: 680px) {
  .form-container{
    width: 25rem;
  }
}
</style>
