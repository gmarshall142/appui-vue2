<template>
  <v-app>

    <!--<Menu />-->
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      enable-resize-watcher
      fixed
      app
    >
      <v-list dense>
        <template
          v-for="(item, i) in items"
        >
          <menu-item :item="item" :index="i" :submenu=false />
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar color="indigo" dark fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn icon @click.stop="fixed = !fixed">
        <v-icon>remove</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
<!--      <v-btn icon @click.stop="rightDrawer = !rightDrawer">-->
<!--        <v-icon>menu</v-icon>-->
<!--      </v-btn>-->
<!--      <nav class="navbar navbar-expand-md navbar-light bg-light">-->
<!--        <div class="container">-->
<!--      <div class="collapse navbar-collapse" id="navbarNav">-->
      <!-- login -->
      <v-btn text v-if="!$auth.isAuthenticated && !$auth.loading" @click="login">Log In</v-btn>
      <!-- logout -->
      <v-menu
        v-if="$auth.isAuthenticated"
        transition="slide-y-transition"
        bottom :close-on-content-click="true"
      >
        <template v-slot:activator="{ on }">
          <v-btn text small v-on="on" style="height: unset">
            <img
              :src="$auth.user.picture"
              alt="User's profile picture"
              class="nav-user-profile rounded-circle"
              width="50"
            />
            <v-icon>arrow_drop_down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item>
            <v-list-item-title>{{ $auth.user.name }}</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <router-link to="/profile" class="dropdown-item dropdown-profile" style="padding: 0">
              <font-awesome-icon class="mr-3" icon="user" />Profile
            </router-link>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title><font-awesome-icon class="mr-3" icon="power-off" />Log Out</v-list-item-title>
          </v-list-item>
          <v-list-item @click="fetchMenu">
            <v-list-item-title><font-awesome-icon class="mr-3" icon="power-off" />Fetch Menu</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

    </v-app-bar>
    <v-content>
      <router-view/>
    </v-content>
<!--    <v-navigation-drawer-->
<!--      temporary-->
<!--      :right="right"-->
<!--      v-model="rightDrawer"-->
<!--      fixed-->
<!--      app-->
<!--    >-->
<!--      <v-list>-->
<!--        <v-list-item @click="right = !right">-->
<!--          <v-list-item-action>-->
<!--            <v-icon>compare_arrows</v-icon>-->
<!--          </v-list-item-action>-->
<!--          <v-list-item-title>Switch drawer (click me)</v-list-item-title>-->
<!--        </v-list-item>-->
<!--      </v-list>-->
<!--    </v-navigation-drawer>-->
    <v-footer color="indigo" :fixed="fixed" app>
      <span class="white--text">&copy; 2018</span>
    </v-footer>
  </v-app>
</template>

<script>
// import { Formio } from 'formiojs';
import MenuItem from './components/MenuItem.vue';
// import CustomComponent from './components/CustomComponent.vue';
// import { BaseComponent } from 'formiojs';
// import { CustomComponent } from './components/form_components/customcomponent/CustomComponent.js';
// const CustomComponent = require('./components/form_components/customcomponent/CustomComponent');
import AxiosHelper from './modules/axiosHelper';
import bus from './modules/bus';
// Import the Auth0 configuration
//import { domain, clientId, audience } from '../auth_config.json';

const axiosHelper = new AxiosHelper();

export default {
  name: 'App',
  components: {
    'menu-item': MenuItem,
    // 'custom-component': CustomComponent,
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: false,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Marshall Applications',
    };
  },
  computed: {
    items() {
      return this.$store.getters.menuItems;
    },
    user() {
      console.log('computed user');
      if(!this.$auth.loading) {
        return this.$auth.getUser();
      }
      return undefined;
    }
  },
  watch: {
    user(newVal, oldVal) {
      this.fetchMenu();
    },
  },
  mounted() {
    console.log('*************** App.mounted');
    console.log('App mounted');
    console.log(`process.env.VUE_APP_EMAIL: ${process.env.VUE_APP_EMAIL}`);
    console.log(`process.env.VUE_APP_PSWD: ${process.env.VUE_APP_PSWD}`);
    console.log(`process.env.VUE_APP_MODE: ${process.env.VUE_APP_MODE}`);
    this.$store.dispatch('devMode', process.env.VUE_APP_MODE);
    console.log(`process.env.VUE_APP_REST_HOST: ${process.env.VUE_APP_REST_HOST}`);
    console.log(`process.env.VUE_APP_REST_PORT: ${process.env.VUE_APP_REST_PORT}`);
    if(process.env.VUE_APP_REST_HOST || process.env.VUE_APP_REST_PORT) {
      this.$store.dispatch('setRestUrl', { host: process.env.VUE_APP_REST_HOST, port: process.env.VUE_APP_REST_PORT });
    }
    axiosHelper.init(this);
    this.fetchMenu();

    // PROD: send login request with header provided by proxy
    // DEV: use environment variables to set header and send login request
    // if(this.isDevMode()) {
    //   this.devLogin();
    // }
  },
  methods: {
    isDevMode: function() {
      return process.env.VUE_APP_MODE && process.env.VUE_APP_MODE === 'DEV' || process.env.VUE_APP_MODE === 'TEST' ;
    },
    login() {
      if(!this.$auth.loading) {
        this.$auth.loginWithRedirect();
        this.fetchMenu();
        bus.$emit('apps-login-change');
      }
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
      this.fetchMenu()
    },
    fetchMenu: function() {
      this.$store.dispatch('fetchMenus');
    },
    devLogin: async function() {
      // await this.$store.dispatch('login', { email: process.env.VUE_APP_EMAIL, password: process.env.VUE_APP_PSWD });
      const interval = setInterval(async () => {
        const loading = this.$auth ? this.$auth.loading : true;
        if(!loading) {
          console.log('clear interval');
          clearInterval(interval);
          const user = await this.$auth.getUser();
          console.log(`user: ${JSON.stringify(user)}`);
          if(user === undefined) {
            this.login();
          }
        } else {
          console.log(`loading: ${loading}`);
        }
      }, 500);

      // console.log('******************************');
      // console.log(`process.env.VUE_APP_EMAIL: ${process.env.VUE_APP_EMAIL}`);
      // console.log(`process.env.VUE_APP_PSWD: ${process.env.VUE_APP_PSWD}`);
      // console.log('******************************');
      // const header = {
      //   'Content-Type': 'application/x-www-form-urlencoded',
      //   'User-Agent': 'PostmanRuntime/7.24.1',
      //   'Accept': '*/*',
      //   'Cache-Control': 'no-cache',
      //   'Postman-Token': '8f4f3456-f3fa-4191-8b7f-17854ef1d7df',
      //   'Host': 'dev-rn77drwl.auth0.com',
      //   'Accept-Encoding': 'gzip, deflate, br',
      //   'Connection': 'keep-alive',
      //   'Content-Length': 239
      // };
      // const body = {
      //   grant_type: "authorization_code",
      //   code: "OENVkSqx876IsbjI",
      //   redirect_uri: "https://www.getpostman.com/oauth2/callback",
      //   client_id: "yfmIXPvyk2LOZONMTU94Fq0xns1Ip0hk",
      //   client_secret: "e-qJlXar_1nQbtpv3yjO3nRyU90lAsTkz5aQfqPqNni6CaYL9l7r-pTc1Mi89t8c"
      // };
      // // axiosHelper.post(`https://${domain}/oauth/token`, body, header)
      // axios.post(`https://${domain}/oauth/token`, body, header)
      //   .then((response) => {
      //     console.log(`response:`);
      //     console.log(`${JSON.stringify(response)}`);
      //   })
      //   .catch((err) => {
      //     console.log(err.response.data);
      //   });
      // const userData = { email: process.env.VUE_APP_EMAIL, password: process.env.VUE_APP_PSWD };
      // const userNpke = await this.$store.dispatch('devLogin', userData);
      // // console.log(`userNpke: ${JSON.stringify(userNpke)}`);
      // const headers = _.cloneDeep(this.$store.getters.serviceHeaders);
      // headers.NPKE_SUBJECT = userNpke.data.npke_subject;
      // this.$store.dispatch('login', { data: userData, headers: headers });
    }
  }
};
</script>

<style>
  @import 'assets/css/app.css';
  @import 'assets/css/fonts.css';
</style>

<style>
  #mobileAuthNavBar {
    min-height: 125px;
    justify-content: space-between;
  }
</style>
