export default {

  publicRuntimeConfig: {
    baseURL: process.env.BASE_URL || 'http://econsent.smart-medication.de/api' 
  },
  privateRuntimeConfig: {
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "eConsent",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, height=device-height" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },
  loading: "~/pages/loading.vue",

/*   env: {
    production: false,
    dev: true,
    baseUrl: process.env.production ? "http://econsent.smart-medication.de/api" : (process.env.dev ? "http://localhost:3111" : "http://localhost:3111")
  }, */

  pwa: {
    icon: {
      fileName: "app-icon.png"
    }
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ["@/assets/scss/main.scss"],
  styleResources: {
    scss: ["./assets/scss/*.scss"]
  },

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    { src: "~/plugins/pdf-viewer/pdf-viewer.js", mode: "client" },
    { src: "~/plugins/vue-signature-pad.js", mode: "client" },
    { src: "~/plugins/axios.js" },
    { src: "~/plugins/vidle.js" },
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [],
  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    "bootstrap-vue/nuxt",
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    // https://go.nuxtjs.dev/pwa
    ["@nuxtjs/pwa", { workbox: false }],
    "@nuxtjs/auth-next"
  ],

  auth: {
    plugins: [{ src: "~/plugins/axios", ssr: true }, { src: "~/plugins/auth" }],
    redirect: {
      login: "/auth/login",
      logout: "/auth/login",
      home: false
    },

    //
    localStorage: false,

    strategies: {
      cookie: {
        cookie: {
          name: "access_token"
        },
        token: {
          required: false
        },
        user: {
          property: ""
        },
        endpoints: {
          login: {
            url: "/login",
            method: "post",
            withCredentials: true,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "Content-Type": "application/json"
            }
          },
          user: false,
          refresh_token: {
            url: "/refresh_token",
            method: "post",
            propertyName: false,
            withCredentials: true,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "Content-Type": "application/json"
            }
          },
          // logout: false,
          logout: {
            url: "/logout",
            method: "post",
            propertyName: false,
            withCredentials: true,
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "Content-Type": "application/json"
            }
          },
          user: {
            url: '/user',
            method: 'get',
            withCredentials: true,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'
            }
          },
        },





        // user: false,
        watchLoggedIn: true
      }
    }
  },
  // Router config for global auth
  router: {
    base: "/app/",

    middleware: ["auth", "authorized"],
    extendRoutes(routes, resolve) {
      routes.push(
        {
          name: "confirmation",
          path: "/document/confirmation",
          component: resolve(__dirname, "pages/document/confirmation.vue")
        },
        {
          name: "ext-confirmation",
          path: "/document/ext/confirmation",
          component: resolve(__dirname, "pages/document/ext/confirmation.vue")
        },
        {
          name: "get-document",
          path: "/document",
          component: resolve(__dirname, "pages/document/index.vue")
        },
        {
          name: "view-document",
          path: "/document/management/view",
          component: resolve(__dirname, "pages/document/management/view.vue")
        },
        {
          name: "view-signed-document",
          path: "/patient/view",
          component: resolve(__dirname, "pages/patient/view.vue")
        },
        {
          name: 'ext-view-signed-document',
          path: '/document/ext/view',
          component: resolve(__dirname, 'pages/document/ext/view.vue')
        },
      );
    }
  },
  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    // local base url
    //baseURL: "http://localhost:3111/"
    debug: true,

    // base url set in axios plugin file
  },

  server: {
    port: 3000
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {}
};
