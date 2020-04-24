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

    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
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
      <v-btn flat v-if="!$auth.isAuthenticated && !$auth.loading" @click="login">Log In</v-btn>
      <!-- logout -->
      <v-menu
        v-if="$auth.isAuthenticated"
        transition="slide-y-transition"
        bottom :close-on-content-click="true"
      >
        <v-btn flat small slot="activator"
        >
          <img
            :src="$auth.user.picture"
            alt="User's profile picture"
            class="nav-user-profile rounded-circle"
            width="50"
          />
          <v-icon>arrow_drop_down</v-icon>
        </v-btn>
        <v-list dense>
          <v-list-tile>
            <v-list-tile-title>{{ $auth.user.name }}</v-list-tile-title>
          </v-list-tile>
          <v-list-tile>
            <router-link to="/profile" class="dropdown-item dropdown-profile" style="padding: 0">
              <font-awesome-icon class="mr-3" icon="user" />Profile
            </router-link>
          </v-list-tile>
          <v-list-tile @click="logout">
            <v-list-tile-title><font-awesome-icon class="mr-3" icon="power-off" />Log Out</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

    </v-toolbar>
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
<!--        <v-list-tile @click="right = !right">-->
<!--          <v-list-tile-action>-->
<!--            <v-icon>compare_arrows</v-icon>-->
<!--          </v-list-tile-action>-->
<!--          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>-->
<!--        </v-list-tile>-->
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
    this.$store.dispatch('fetchMenus');
    //const customComponent = new CustomComponent();
    // Formio.registerComponent('custom-component', CustomComponent);
    //   {
    //   fbtemplate: 'formio/formbuilder/fivestar.html',
    //   icon: 'fa fa-gavel',
    //   noDndOverlay: true,
    //   confirmRemove: true,
    //   views: [
    //     {
    //       name: 'Display',
    //       template: 'formio/components/fivestar/display.html'
    //     },
    //     {
    //       name: 'API',
    //       template: 'formio/components/common/api.html'
    //     },
    //     {
    //       name: 'Conditional',
    //       template: 'formio/components/common/conditional.html'
    //     }
    //   ]
    // });
  },
  methods: {
    login() {
      this.$auth.loginWithRedirect();
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      })
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
