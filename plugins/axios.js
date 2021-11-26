import { EncryptedPDFError } from "pdf-lib";

export default function (context) {
  const { $axios, $auth, $router, $config } = context;
  //$axios.defaults.baseURL = "http://localhost:3111"
  $axios.defaults.baseURL =  $config.baseURL;
  //$axios.defaults.baseURL = "http://econsent.smart-medication.de/api";

  //console.log(process.env.baseUrl)
  //$axios.defaults.baseURL = process.env.baseUrl;
  $axios.defaults.withCredentials = true;

  /**
   * Intercepts every axios request and checks for unauthorized response in order to refresh access_token
   */
  $axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const code = parseInt(error.response && error.response.status);
      const axios = $axios;
      const auth = $auth;

      //error.config.url == ""
      if (error.config.url === "/login") {
        return Promise.reject(error);
      }
      if (code === 401) {
        getRefreshToken().then((resp) => {
          if (resp) {
            return axios(error.config);
          } else {
            return Promise.reject(error);
          }
        });
      }
    }
  );

  // custom axios instance for refresh token route in order to avoid the interceptor above
  const refresh = $axios.create();
  const self = context;

  /**
   * Tries to refresh the access_token - when it fails, the user gets logged out
   */
  async function getRefreshToken() {
    try {
      await refresh.post("/refresh_token", {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      return true;
    } catch (error) {
      if (!error.response.status === 400) {
        self.$auth.logout();
      }
      self.$auth.logout();
      self.redirect("/auth/login");
      return false;
    }
  }
}
