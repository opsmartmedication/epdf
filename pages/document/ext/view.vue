<template>
  <div>

    <DocumentEditor :document="this.$route.query.document" :source="this.$route.query.source" confirmation-route-name="ext-confirmation"  :is-pin-login-possible="false" :contract-template-id="this.$route.query.contractTemplateId"/>
  </div>
</template>

<script>
export default {
    layout: "ext",
    auth: false
}
</script>

<style>

</style>