import axios from 'axios';

const _ = require('lodash');

export default class AxiosHelper {
  static appContext = undefined;

  init = (context) => {
    AxiosHelper.appContext = context;
  };

  request = (config) => {
    return new Promise((resolve, reject) => {
      axios(config)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          if(err.response) {
            console.error(err.response.data );
            if(err.response.status === 401) {
              setTimeout(() => {
                AxiosHelper.appContext.login();
              }, 10);
            }
          } else {
            console.error(err.message);
          }
          AxiosHelper.appContext.$store.dispatch('log', { level: 'error', data: err });
          reject(err);
        });
    });
  };

  get = (url) => {
    const fullUrl = `${AxiosHelper.appContext.$store.getters.serverUrl}${url}`;
    return this.request({
      method: 'get',
      url: fullUrl,
      withCredentials: true,
      headers: AxiosHelper.appContext.$store.getters.serviceHeaders
    });
  };

  post = (url, data) => {
    const fullUrl = `${AxiosHelper.appContext.$store.getters.serverUrl}${url}`;
    return this.request({
      method: 'post',
      url: fullUrl,
      data: data,
      withCredentials: true,
      headers: AxiosHelper.appContext.$store.getters.serviceHeaders
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

