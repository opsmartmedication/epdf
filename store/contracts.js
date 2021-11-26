export const state = () => ({
  list: [],

  currentContract: {
    index: 0,
    byteArray: [],
    fields: [],
    checkboxes: [],
    signed: false,
    fullRender: true,
    inputFields: [],
    test: []

}
});

export const actions = {
  loadContractTemplates({ commit }) {
    try {
      this.$axios
        .get("/contractTemplatesInformation")
        .then((response) => response.data)
        .then((contracts) => {
          commit("SET_CONTRACTS", contracts.recordset);
        });
    } catch (error) {
      
      console.log(error);
    }
  }
};

export const mutations = {
  // list
  SET_CONTRACTS(state, contracts) {
    state.list = contracts;
  },

  saveAllList(state, obj) {
    state.list.push(obj);
  },

  // currentContract

saveAll(state, obj) {
    state.currentContract = obj
},
saveFields(state, value) {
    state.currentContract.fields = value
},
saveCheckboxes(state, value) {
    state.currentContract.checkboxes = value
},
saveSigned(state, value) {
    state.currentContract.signed = value
},
saveIndex(state, value){
    state.currentContract.index = value
},
saveBuffer(state, value){
    state.currentContract.byteArray = value
},
saveFullRender(state, value){
    state.currentContract.fullRender = value
},
saveInputFields(state, value){
    state.currentContract.inputFields = value
},
saveTest(state, value){
    state.currentContract.test = value
},
concatInputFields(state, value){
    state.currentContract.inputFields = state.currentContract.inputFields.concat(value)
},
reset (state) {
  // acquire initial state
  const s = {
    index: Number,
    byteArray: Uint8Array,
    ContractTemplateId: null,
    formFields: [],
    fields: [],
    checkboxes: [],
    signed: false,
    fullRender: true,
    inputFields: [],
    test: Uint8Array

}
  state.currentContract = s
}
};
