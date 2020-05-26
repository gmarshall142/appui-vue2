import axios from 'axios';
import Auth0Plugin from '../auth/authWrapper';

const _ = require('lodash');

export default class AxiosHelper {
  static appContext = undefined;
  static defaultHeaders = {};
  static serverUrl = '';

  init = (context) => {
    AxiosHelper.appContext = context;
    AxiosHelper.defaultHeaders = AxiosHelper.appContext.$store.getters.serviceHeaders;
    AxiosHelper.serverUrl = AxiosHelper.appContext.$store.getters.serverUrl;
//    AxiosHelper.auth = context.$auth;
  };

  request = (config) => {
    return new Promise(async (resolve, reject) => {
      config.withCredentials = true;
      // Get the access token from the auth wrapper
      try {
        const token = await AxiosHelper.appContext.$auth.getTokenSilently();
//    const token = await Auth0Plugin.getTokenSilently()
        config.headers['Authorization'] = `Bearer ${token}`;
      } catch(e) {}

      axios(config)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          console.error(err);
          if(err.response && err.response.status === 401) {
            setTimeout(() => {
              AxiosHelper.appContext.login();
            }, 10);
          }
          // AxiosHelper.appContext.$store.dispatch('log', { level: 'error', data: err });
          reject(err);
        });
    });
  };

  get = (url, headers = AxiosHelper.defaultHeaders) => {
    const fullUrl = `${AxiosHelper.serverUrl}${url}`;
    return this.request({
      method: 'get',
      url: fullUrl,
      withCredentials: true,
      headers: headers
    });
  };

  post = (url, data, headers = AxiosHelper.defaultHeaders) => {
    const fullUrl = `${AxiosHelper.serverUrl}${url}`;
    return this.request({
      method: 'post',
      url: fullUrl,
      data: data,
      withCredentials: true,
      headers: headers
    });
  };

  put = (url, data, headers = AxiosHelper.defaultHeaders) => {
    const fullUrl = `${AxiosHelper.serverUrl}${url}`;
    return this.request({
      method: 'put',
      url: fullUrl,
      data: data,
      withCredentials: true,
      headers: headers
    });
  };


  // TODO: delete
  delete = (url) => {
    const fullUrl = `${AxiosHelper.serverUrl}${url}`;
    return this.request({
      method: 'delete',
      url: fullUrl
    });
  };

  // TODO: save
  save = (url, data) => {
    const recordUrl = data.id ? `/${data.id}` : '';
    const fullUrl = `${AxiosHelper.appContext.$store.getters.serverUrl}${url}${recordUrl}`;
    return this.request({
      method: (data.id ? 'put' : 'post'),
      url: fullUrl,
      data: data
    });
  };

  fetch = (url, context, dataElem) => {
    const requestContext = context;
    axios.get(
      `${context.$store.getters.serverUrl}${url}`,
      {withCredentials: true, headers: context.$store.getters.serviceHeaders}
    )
      .then((response) => {
        requestContext[dataElem] = response.data;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  asyncFetch = async (url, context) => axios.get(
    `${context.$store.getters.serverUrl}${url}`,
    {withCredentials: true, headers: context.$store.getters.serviceHeaders}
  );
}

