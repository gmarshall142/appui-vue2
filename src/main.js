import '@babel/polyfill'
import Vue from 'vue';
import Vuetify from 'vuetify';
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css';
import App from './App.vue';
import router from './router';
import store from './store';
import BootstrapVue from 'bootstrap-vue';
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/bootstrap-vue/dist/bootstrap-vue.css";
import { editor } from 'ace-vue2';
import '../node_modules/brace/mode/javascript';
import '../node_modules/brace/mode/json';
import '../node_modules/brace/theme/chrome';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faLink, faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// Import the Auth0 configuration
import { domain, clientId, audience } from '../auth_config.json';
// Import the plugin
import { Auth0Plugin } from "./auth";

import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify);

Vue.config.productionTip = false;
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl ? appState.targetUrl : window.location.pathname
    );
  },
});

library.add(faLink, faUser, faPowerOff);
Vue.component("font-awesome-icon", FontAwesomeIcon);

new Vue({
  vuetify: vuetify,
  router,
  store,
  BootstrapVue,
  editor,
  render: h => h(App),
}).$mount('#app');
