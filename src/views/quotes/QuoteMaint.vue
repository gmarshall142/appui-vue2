<template>
  <div class="support">
    <h1>Quote Maintenance</h1>
    <v-spacer></v-spacer>

    <v-container fluid>
      <v-form v-model="valid" ref="form" lazy-validation>
        <v-text-field
          label="Quote Text"
          v-model="quote.quote_string"
          :rules="quoteRules"
          required
          multi-line
        ></v-text-field>
        <v-text-field
          label="Author First Name"
          v-model="quote.author_first_name"
        ></v-text-field>
        <v-text-field
          label="Author Last Name"
          v-model="quote.author_last_name"
        ></v-text-field>
        <v-text-field
          label="Source"
          v-model="quote.source"
        ></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
          <v-btn color="blue darken-1" flat :disabled="!valid" @click.native="save">Save</v-btn>
        </v-card-actions>
      </v-form>
      <!--<v-layout row>-->
        <!--<v-flex xs8>-->
          <!--<v-container grid-list-md text-xs-center style="padding-top: 0;">-->
            <!--<v-select-->
              <!--ref="applicationId"-->
              <!--:items="apps"-->
              <!--item-text="name"-->
              <!--item-value="id"-->
              <!--box-->
              <!--clearable-->
              <!--label="Applications"-->
              <!--@change="fetchRows"-->
            <!--&gt;</v-select>-->
            <!--<v-form ref="form" v-model="valid">-->
              <!--<v-layout row wrap>-->
                <!--<v-flex xs2 class="text-xs-left">-->
                  <!--<v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle;">ID:&nbsp;&nbsp;&nbsp;&nbsp;{{editRecord.id}}</v-card-text>-->
                <!--</v-flex>-->
                <!--<v-flex xs5>-->
                  <!--<v-text-field v-model="editRecord.title" :rules="rules.name" label="Title" required :disabled="formEnabled"></v-text-field>-->
                <!--</v-flex>-->
                <!--<v-flex xs5>-->
                  <!--<v-text-field v-model="editRecord.name" :rules="rules.shortname" label="Name" required :disabled="formEnabled"></v-text-field>-->
                <!--</v-flex>-->
              <!--</v-layout>-->
              <!--<v-layout row wrap>-->
                <!--<v-flex xs12>-->
                  <!--<v-textarea v-model="editRecord.description" auto-grow label="Description" rows="1"  :disabled="formEnabled"></v-textarea>-->
                <!--</v-flex>-->
              <!--</v-layout>-->

              <!--<v-layout row wrap>-->
                <!--<v-flex xs11 class="text-xs-left">-->
                  <!--<v-btn :disabled="!valid" @click="submit">Submit</v-btn>-->
                  <!--<v-btn @click="clear">Clear</v-btn>-->
                <!--</v-flex>-->
                <!--<v-flex xs1>-->
                  <!--<v-tooltip bottom>-->
                    <!--<v-btn @click="menuAdd" icon slot="activator" :disabled="disableMenuAdd">-->
                      <!--<v-icon>chevron_right</v-icon>-->
                    <!--</v-btn>-->
                    <!--<span>Add application to menu.</span>-->
                  <!--</v-tooltip>-->
                <!--</v-flex>-->
              <!--</v-layout>-->
            <!--</v-form>-->
          <!--</v-container>-->
        <!--</v-flex>-->
        <!--<v-flex xs4>-->
          <!--<div>-->
            <!--<v-expansion-panel ref="menTreeExpansion" v-model="panel">-->
              <!--<v-expansion-panel-content>-->
                <!--<div slot="header">Menu</div>-->
                <!--<menu-tree-->
                  <!--ref="menuTree"-->
                  <!--disableSystem="true"-->
                  <!--@MenuUpdate="setEditHasMenuItem"-->
                  <!--@MenuSave="showAlert('success', 'Menu saved.')"-->
                <!--&gt;</menu-tree>-->
              <!--</v-expansion-panel-content>-->
            <!--</v-expansion-panel>-->
          <!--</div>-->
        <!--</v-flex>-->
      <!--</v-layout>-->
    </v-container>

    <alertctl ref="alertCtrl"></alertctl>

    <v-spacer></v-spacer>

    <!--<maint-data-table-->
      <!--ref="dataTable"-->
      <!--formTitle="Application Pages"-->
      <!--v-bind="{headers, items, deleteItem, submitItem, promptColumn}"-->
      <!--v-on:edit-item="editItem"-->
    <!--&gt;</maint-data-table>-->
  </div>
</template>

<script>
  import axios from 'axios';
  import MaintDataTable from '../component/MaintDataTable.vue';
  import MenuTree from '../component/MenuTree.vue';
  import AlertControl from '../component/Alert'
  const _ = require('lodash');

  export default {
    name: 'QuoteMaint',
    // props: ['quote'],
    data: () => ({
      quote: {
        id: undefined,
        quote_string: '',
        author_first_name: '',
        author_last_name: '',
        source: '',
      },
      valid: true,
      quoteRules: [
        v => !!v || 'Quote string is required',
      ],
      select: null,
    }),
    // props: ['item', 'index', 'submenu'],
    // data() {
    //   return {
    //     headers: [
    //       { text: 'ID', value: 'id' },
    //       { text: 'Title', value: 'title' },
    //       { text: 'Name', value: 'name' },
    //       { text: 'Description', value: 'description' },
    //     ],
    //     apps: [],
    //     appId: undefined,
    //     items: [],
    //     // alertShow: false,
    //     // alertType: 'success',
    //     // alertMsg: '',
    //     editRecord: {
    //       id: null,
    //       appid: 0,
    //       title: '',
    //       name: '',
    //       description: '',
    //     },
    //     editIndex: -1,
    //     valid: false,
    //     editHasMenuItem: false,
    //     promptColumn: 'title',
    //     requestHeaders: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     panel: [],
    //     rules: {
    //       name: [
    //         v => !!v || 'Title is required and will be used as a label for the application.',
    //         v => (v && v.length <= 40) || 'Name must be less than 40 characters'
    //       ],
    //       shortname: [
    //         v => !!v || 'Name is required and will be used to identify the application .',
    //         v => (v && v.length <= 20) || 'Short Name must be less than 30 characters'
    //       ],
    //       description: [
    //         v => (v && v.length <= 60) || 'Description must be less than 60 characters'
    //       ]
    //     },
    //   };
    // },
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
      items: {
        get() {
          return this.items;
        },
        set(value) {
          console.log('------------- items.set');
          this.items = value;
        }
      },
      // disableMenuAdd() {
      //   return this.editRecord.id === null || this.editHasMenuItem;
      // },
      quote() {
        return this.$store.getters.getQuote;
      },
      formEnabled() {
        return this.appId === undefined;
      },
    },
    methods: {
      initializePage: function() {
        this.fetchApps();
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
      clear() {
        this.editIndex = -1;
        this.editHasMenuItem = false;
        this.editRecord = {id: null};
        this.$refs.form.reset();
      },
      submit() {
        if (this.$refs.form.validate()) {
          this.submitItem(this.editIndex, this.editRecord);
        }
      },
      menuAdd() {
        console.log(`------------ menuAdd: ${this.editRecord}`);
        const appItem = this.getAppItem();
        this.$refs.menuTree.addApp({
          appid: this.appId,
          label: this.editRecord.title,
          routerpath: '',
          pageid: this.editRecord.id,
          parentid: appItem.id,
          position: appItem.children.length + 1,
        }, this.$refs.menuTree.MenuNodeTypes.PAGE);
     },
      editItem(item) {
        this.editIndex = this.items.indexOf(item);
        this.editRecord = item;
        this.setEditHasMenuItem();
      },
      getAppItem: function() {
        const appItems = this.$refs.menuTree.getAppItems();
        return _.find(appItems, (it) => {
          return it.appid === this.appId
        });
      },
      appMenuHasPage: function(children, id) {
        return _.find(children, (it) => {
          console.log(`id: ${id} : pageid: ${it.pageid}`);
          if (it.pageid === id) {
            console.log(`------------------ fnd: ${it.pageid}`);
            return true;
          } else {
            return this.appMenuHasPage(it.children, id);
          }
        })
      },
      deleteItem: function(idx) {
        const items = this.items;
        console.log(`delete in AppMaint: ${idx}  id: ${items[idx].id}`);
        return axios.delete(`${this.$store.getters.serverUrl}/pages/${items[idx].id}`, this.requestHeaders)
          .then((response) => {
            const self = this;
            const id = Number(response.data.id);

            _.remove(self.items, (it) => {
              return it.id === id;
            });
            self.items = this.updateItems(self);
            this.clear();
            //this.showAlert('success', 'Page deleted.')
            // this.$refs.appForm.formio.setAlert('success', 'It worked');
          })
          .catch((err) => {
            console.log(err);
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
