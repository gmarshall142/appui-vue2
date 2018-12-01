<template>
  <div class="support">
    <h1>Quotes List</h1>
    <v-spacer></v-spacer>

    <alertctl ref="alertCtrl"></alertctl>

    <v-spacer></v-spacer>

    <maint-data-table
      ref="dataTable"
      formTitle="Application Pages"
      v-bind="{headers, items, deleteItem, submitItem, promptColumn}"
      v-on:edit-item="editItem"
    ></maint-data-table>
  </div>
</template>

<script>
  import axios from 'axios';
  import MaintDataTable from '../component/MaintDataTable.vue';
  import MenuTree from '../component/MenuTree.vue';
  import AlertControl from '../component/Alert'
  const _ = require('lodash');
  const defaultRecord = {
    version: 0,
      author_first_name: '',
      author_last_name: '',
      category: 0,
      comment: '',
      graphic_url: null,
      quote_format: 0,
      quote_string: null,
      source: '',
  };

  export default {
    name: 'QuotesView',
    props: ['item', 'index', 'submenu'],
    data() {
      return {
        headers: [
          { text: 'ID', value: 'id'},
          { text: 'Author First Name', value: 'author_first_name' },
          { text: 'Author Last Name', value: 'author_last_name' },
          { text: 'Quote', value: 'quote_string' },
          { text: 'Source', value: 'source' },
        ],
        apps: [],
        appId: undefined,
        items: [],
        editRecord: defaultRecord,
        editIndex: -1,
        valid: false,
        editHasMenuItem: false,
        promptColumn: 'id',
        requestHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        panel: [],
        rules: {
          name: [
            v => !!v || 'Title is required and will be used as a label for the application.',
            v => (v && v.length <= 40) || 'Name must be less than 40 characters'
          ],
          shortname: [
            v => !!v || 'Name is required and will be used to identify the application .',
            v => (v && v.length <= 20) || 'Short Name must be less than 30 characters'
          ],
          description: [
            v => (v && v.length <= 60) || 'Description must be less than 60 characters'
          ]
        },
      };
    },
    components: {
      MaintDataTable,
      MenuTree,
      alertctl: AlertControl,
    },
    mounted() {
      this.initializePage();
      console.log('mounted');
    },
    computed: {
      // items: {
      //   get() {
      //     return this.items;
      //   },
      //   set(value) {
      //     console.log('------------- items.set');
      //     this.items = value;
      //   }
      // },
      // disableMenuAdd() {
      //   return this.editRecord.id === null || this.editHasMenuItem;
      // },
      formEnabled() {
        return this.appId === undefined;
      },
    },
    methods: {
      initializePage: function() {
        this.fetchQuotes();
      },
      fetchQuotes: function() {
        axios.get('http://localhost:3000/quotes', this.$store.getters.serviceHeaders)
          .then((response) => {
            this.items = response.data;
          })
          .catch((err) => {
            console.log(err.response.data);
            this.$refs.alertCtrl.showAlert('error', 'Quotes request failed.');
          });
      },
      fetchApps: function() {
        axios.get(`${this.$store.getters.serverUrl}/applications`)
          .then((response) => {
            this.apps = response.data;
          })
          .catch((err) => {
            console.log(err.response.data);
          });
      },
      fetchRows: function(e) {
        this.clear();
        this.items = [];
        this.appId = e;
        axios.get(`${this.$store.getters.serverUrl}/pages/app/${e}`)
          .then((response) => {
            this.items = response.data;
          })
          .catch((err) => {
            console.log(err.response.data);
          });
      },
      submit() {
        if (this.$refs.form.validate()) {
          this.submitItem(this.editIndex, this.editRecord);
        }
      },
     //  menuAdd() {
     //    console.log(`------------ menuAdd: ${this.editRecord}`);
     //    const appItem = this.getAppItem();
     //    this.$refs.menuTree.addApp({
     //      appid: this.appId,
     //      label: this.editRecord.title,
     //      routerpath: '',
     //      pageid: this.editRecord.id,
     //      parentid: appItem.id,
     //      position: appItem.children.length + 1,
     //    }, this.$refs.menuTree.MenuNodeTypes.PAGE);
     // },
      editItem(item) {
        this.editIndex = this.items.indexOf(item);
        // TODO: set store quote and navigate to QuoteMaint
        //this.editRecord = item;
        // this.setEditHasMenuItem();
      },
      getAppItem: function() {
        const appItems = this.$refs.menuTree.getAppItems();
        return _.find(appItems, (it) => {
          return it.appid === this.appId
        });
      },
      deleteItem: function(idx) {
        const items = this.items;
        console.log(`delete in QuoteView: ${idx}  id: ${items[idx].id}`);
        return axios.delete(`${this.$store.getters.serverUrl}/quotes/${items[idx].id}`, this.requestHeaders)
          .then((response) => {
            const self = this;
            const id = Number(response.data.id);

            _.remove(self.items, (it) => {
              return it.id === id;
            });
            self.items = this.updateItems(self);
            this.$refs.alertCtrl.showAlert('success', 'Quote deleted.');
          })
          .catch((err) => {
            console.log(err);
            this.$refs.alertCtrl.showAlert('error', 'Delete failed.');
          });
      },
      submitItem: function(idx, record) {
        if (idx > -1 && record.id !== null) {
          // update -----------------
          return axios.put(`${this.$store.getters.serverUrl}/pages/${record.id}`, record, this.requestHeaders)
            .then((response) => {
              const itemIdx = _.findIndex(this.items, (it) => { return it.id === response.data.id });
              this.items[itemIdx] = response.data;
              this.items = this.updateItems(this);
              //this.showAlert('success', 'Page updated.')
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          // add --------------------
          record.appid = this.appId;
          return axios.post(`${this.$store.getters.serverUrl}/pages`, record, this.requestHeaders)
            .then((response) => {
              this.items.push(response.data);
              this.items = this.updateItems(this);
              this.editItem(response.data);
              //this.showAlert('success', 'Page added.')
            })
            .catch((err) => {
              console.log(err);
              this.$refs.alertCtrl.showAlert('error', `Quotes request failed.`);
            });
        }
      },
      updateItems: function(self) {
        // It was necessary to force the datatable to update by creating a new items array
        const newList = [];
        _.forEach(self.items, (it) => {
          newList.push(it);
        });
        return newList;
      },
      // showAlert: function(type, msg, duration = 3000) {
      //   this.alertShow = true;
      //   this.alertType = type;
      //   this.alertMsg  = msg;
      //   setTimeout(() => {
      //     this.alertShow = false;
      //   }, duration);
      // },
      // setEditHasMenuItem: function() {
      //   const appItem = this.getAppItem();
      //   const fndItem = this.appMenuHasPage(appItem.children, this.editRecord.id);
      //   this.editHasMenuItem = !!fndItem;
      //   console.log(`editHasMenuItem: ${this.editHasMenuItem}`);
      // }
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  h1
    margin 10px 0 0 20px
  div
    margin-top inherit
</style>
