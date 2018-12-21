import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
const { SERVERPORT = 3000 } = process.env;
const _ = require('lodash');

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    serverUrl: window.location.protocol + '//' + window.location.hostname + ':' + SERVERPORT,
    serviceHeaders: { 'Content-Type': 'application/json' },
    menuItems: [],
    applicationTitle: '',
    appForm: {
      title: '',
      data: {},
      pageactions: {},
    },
    customFormData: {},
    formBuilder: {
      appid: '',
      pageid: '',
      formid: '',
      data: {},
    },
    // quotes: [],
    quote: {},
  },
  getters: {
    serverUrl: state => state.serverUrl,
    serviceHeaders: state => state.serviceHeaders,
    menuItems: state => state.menuItems,
    applicationTitle: state => state.appForm.title,
    customFormData: state => state.appForm.data,
    formBuilderData: state => state.formBuilder.data,
    formBuilderAppId: state => state.formBuilder.appid,
    formBuilderPageId: state => state.formBuilder.pageid,
    formBuilderFormId: state => state.formBuilder.formid,
    // fetchQuotes: state => state.quotes,
    quote: state => state.quote,
  },
  mutations: {
    MENUITEMS: (state, payload) => {
      state.menuItems = payload;
    },
    PAGEDATA: (state, payload) => {
      state.appForm = payload;
    },
    FORMDATA: (state, payload) => {
      state.customFormData = (payload !== null ? payload : {});
    },
    updateFormBuilderAppId: (state, payload) => {
      state.formBuilder.appid = payload;
    },
    updateFormBuilderPageId: (state, payload) => {
      state.formBuilder.pageid = payload;
    },
    updateFormBuilderFormId: (state, payload) => {
      state.formBuilder.formid = payload;
    },
    FORMBUILDERDATA: (state, payload) => {
      state.formBuilder.data = payload;
    },
    FORMBUILDERIDS: (state, payload) => {
      state.formBuilder.appid = String(payload.appid);
      state.formBuilder.pageid = String(payload.pageid);
    },
    FORMBUILDERFORMID: (state, payload) => {
      state.formBuilder.formId = String(payload);
    },
    SETFORMBUILDERFORM: (state, payload) => {
      state.formBuilder = payload;
    },
    QUOTE: (state, payload) => {
      state.quote = payload;
    }
  },
  actions: {
    fetchMenus: (context, payload) => {
      axios({
        method: 'get',
        url: `${context.getters.serverUrl}/menus`,
      })
        .then((response) => {
          context.commit('MENUITEMS', response.data);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    },
    fetchPage: (context, payload) => {
      axios({
        method: 'get',
        url: `${context.getters.serverUrl}/pages/${payload.appid}/${payload.pageid}`,
      })
        .then((response) => {
          context.commit('PAGEDATA', response.data);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    },
    fetchForm: (context, payload) => {
      axios({
        method: 'get',
        url: `${context.getters.serverUrl}/pages/forms/${payload.appid}/${payload.pageid}`,
      })
        .then((response) => {
          context.commit('PAGEDATA', response.data);
          context.commit('FORMDATA', response.data.data);
        })
        .catch((err) => {
          console.log(err.response.data);
          context.commit('FORMDATA', {});
        });
    },
    clearFormBuilder: (context) => {
      context.commit('SETFORMBUILDERFORM',
        {
          appid: '',
          pageid: '',
          formid: '',
          data: {},
        },
      );
    },
    saveFormBuilderToFile: (context, payload) => {
      axios({
        method: 'post',
        data: payload.data,
        url: `${context.getters.serverUrl}/pages/form/${payload.appid}/${payload.pageid}`,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          context.commit('FORMBUILDERIDS', response.data);
        })
        .catch((err) => {
          console.log(err.response.data);
        });
    },
    loadFormBuilderToFile: (context, payload) => {
      axios({
        method: 'get',
        data: payload.data,
        url: `${context.getters.serverUrl}/pages/form/${payload.appid}/${payload.pageid}`,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          context.commit('SETFORMBUILDERFORM', response.data);
        })
        .catch((err) => {
          console.log(err.response.data);
          context.dispatch('clearFormBuilder');
        });
    },
    saveFormBuilder: (context, payload) => {
      const formId = payload.formid;
      if (formId  === undefined || formId === '') {
        // add
        axios({
          method: 'post',
          data: payload.data,
          url: `${context.getters.serverUrl}/pages/forms/${payload.appid}/${payload.pageid}`,
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            context.commit('FORMBUILDERFORMID', response.data.id);
          })
          .catch((err) => {
            console.log(err.response.data);
          });
      } else {
        // update
        axios({
          method: 'put',
          data: payload.data,
          url: `${context.getters.serverUrl}/pages/forms/${payload.appid}/${payload.pageid}/${formId}`,
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            context.commit('FORMBUILDERFORMID', response.data.id);
          })
          .catch((err) => {
            console.log(err.response.data);
          });
      }
    },
    loadFormBuilder: (context, payload) => {
      axios({
        method: 'get',
        data: payload.data,
        url: `${context.getters.serverUrl}/pages/forms/${payload.appid}/${payload.pageid}`,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.data.formid === null) {
            response.data.formid = '';
          }
          // context.commit('FORMBUILDERDATA', response.data.formjson);
          // context.commit('FORMBUILDERFORMID', response.data.formid);
          context.commit('SETFORMBUILDERFORM', response.data);
        })
        .catch((err) => {
          console.log(err.response.data);
          context.dispatch('clearFormBuilder');
        });
    },
    setQuote: (context, payload) => {
      context.commit('QUOTE', payload);
    }
  },
});
