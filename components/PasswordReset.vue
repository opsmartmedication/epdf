<template>
  <b-container fluid>
    <div class="container">
      <div class="password__container shadow p-3 mb-5 bg-white rounded">
        <div class="container__header">
          <h4 class="header__title">Support</h4>
        </div>

        <div class="text-center">
          Bei Fragen oder Problemen kontaktieren Sie bitte den Support:
          <br />
          Telefon: +49 (0)69 348 691 04 0
          <br />
          <a href="mailto:support@smart-medication.eu"
            >support@smart-medication.eu</a
          >
        </div>

        <nuxt-link
          to="/auth/login"
          class="form__link--back"
          style="color: black"
        >
          Zurück</nuxt-link
        >
      </div>
      <div class="itp-info-container shadow p-3 mb-5 rounded">
        <b-img src="~/assets/icons/login_background.png" fluid-grow alt="eConsent"></b-img>
      </div>
    </div>
  </b-container>
</template>

<script>
export default {};
</script>

<style scoped>
.container {
  display: flex;
  width: 54rem;
  height: 33.5rem;
  justify-content: space-evenly;
  align-items: center;
  margin: auto;
  margin-top: 5rem;
}
.itp-info-container {
  width: 27rem;
  height: 32rem;
  background: var(--primary);
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}
.password__container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 27rem;
  height: 32rem;
  border: 1px solid transparent;
  border-radius: 5px !important;
  margin: auto;
}
.container__form {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.container__header {
  margin-bottom: 3rem;
}
.form__button--sign-in {
  width: 10rem;
  align-self: center;
}
.form__link--back {
  margin-top: 2rem;
}
</style>
