export default {

   methods: {
    getUser(){
        if (!this.$auth.user) {
            this.fetchUser();
        }
        return this.$auth.user;
    },

    fetchUser() {
        this.$axios
          .get("/user")
          .then((resp) => {
            this.$auth.setUser(resp.data);
          })
          .catch((error) => {
            console.log(error);
          });
      },


    changeUserRole(role) {
        let user = {... this.getUser()}
        user.role = role
        this.$auth.setUser(user)
    }
   }

}