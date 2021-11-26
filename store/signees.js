
export const state = () => ({
  list: [],
  currentSignee: {}
});


export const getters = {

  signees: state => {
    return state.list;
  }
};

export const actions = {
  loadSignees({ commit }) {
    try {
      this.$axios
    .get("/signees")
    .then(response => response.data)
    .then(signees => {
      commit("SET_SIGNEES", signees.recordset);
    });
    } catch (error) {
       
      console.log(error)
    }
  }
};

export const mutations = {

  // list
    saveSignee(state, obj) {
        state.list.push(obj)
    },

    SET_SIGNEES(state, signees) {
      state.list = signees;
    },

    // currentSignee
    saveAll(state, obj) {
      state.currentSignee = obj
    },

    reset (state) {
    // acquire initial state
    const s = {}
    state.currentSignee = s
  }

} 