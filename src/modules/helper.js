import axios from 'axios';

const _ = require('lodash');

export default class Helper {

  getDictFromArray = (arr, key, childrenKey, dict = {}) => {
    _.forEach(arr, (it) => {
      this.getDictFromObject(it, key, childrenKey, dict);
    });
    return dict;
  };

  getDictFromObject = (obj, key, childrenKey, dict = {}) => {
    dict[obj[key]] = obj;
    _.forEach(obj[childrenKey], (it) => {
      this.getDictFromObject(it, key, childrenKey, dict);
    });
    return dict;
  };

  getSubmissionFields = (data) => {
    console.log('-------------> getSubmissionFields');
    console.log(data);

    let subArray = [];
    _.forEach(data, (value, key) => {
      if (key !== 'submit') {
        this.fieldMapId = null;
        this.findComponentKey(key, this.formio.components);
        console.log(`-----------> key: ${key}  fieldMapId: ${this.fieldMapId}`);

        let subValue;
        if (typeof(value) === 'string') {
          subValue = value;
        } else {
          subValue = value.value;
        }
        subArray.push({key: key, value: subValue, fieldid: this.fieldMapId});
      }
    });
    return subArray;
  };

  findComponentKey = (key, components) => {
    //console.log(`components: ${this.formio.components}`);
    if (this.fieldMapId !== null) {
      return;
    }
    
    _.forEach(components, (component) => {
      if (component.originalComponent.key === key && component.originalComponent.datamap) {
        this.fieldMapId = component.originalComponent.datamap.fieldid;
        return false;
      }
      this.findComponentKey(key, component.components);
    });
  };

  fetch = (context, dataElem, url) => {
    const requestContext = context;
    axios.get(`${context.$store.getters.serverUrl}${url}`)
      .then((response) => {
        requestContext[dataElem] = response.data;
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  asyncFetch = async (url, context) => axios.get(`${context.$store.getters.serverUrl}${url}`);

}

