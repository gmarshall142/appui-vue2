<template>
  <div class="support">
    <div style="margin: 10px 40px 10px 20px">
      <v-layout row wrap>
        <v-flex xs10 class="text-xs-left">
          <h1>Quote Maintenance</h1>
        </v-flex>
        <v-flex xs2 class="text-xs-right">
          <v-btn @click="showList">Show List</v-btn>
        </v-flex>
      </v-layout>
    </div>
    <v-spacer></v-spacer>

    <alertctl ref="alertCtrl"></alertctl>

    <div style="margin: 20px 20px">
      <v-container fluid grid-list-md text-xs-center>
        <v-form v-model="valid" ref="form">
          <v-layout row wrap>
            <!-- ID, First, Last -->
            <v-flex xs2 class="text-xs-left">
              <v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle;">ID:&nbsp;&nbsp;&nbsp;&nbsp;{{quote.id}}</v-card-text>
            </v-flex>
            <v-flex xs5>
              <v-text-field
                label="Author First Name"
                v-model="quote.author_first_name"
              ></v-text-field>
            </v-flex>
            <v-flex xs5>
              <v-text-field
                label="Author Last Name"
                v-model="quote.author_last_name"
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs3>
              <!-- Category -->
              <v-select
                v-model="quote.categoryid"
                :items="categories"
                label="Category"
                item-text="name"
                item-value="id"
                clearable
              ></v-select>
            </v-flex>
            <v-flex xs1 />
            <v-flex xs3>
              <!-- Format -->
              <v-select
                v-model="quote.formatid"
                :items="formats"
                label="Format"
                item-text="name"
                item-value="id"
                clearable
              ></v-select>
            </v-flex>
            <v-flex xs1 />
            <v-flex xs4>
              <!-- Updatedat -->
              <v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle; font-size: small">Updated:&nbsp;&nbsp;&nbsp;&nbsp;{{quote.updatedat}}</v-card-text>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <!-- Quote -->
            <v-flex xs12 class="text-xs-left">
              <v-textarea
                label="Quote Text"
                v-model="quote.quote_string"
                :rules="quoteRules"
                required
                box
                rows="3"
              ></v-textarea>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs5>
              <!-- Source -->
              <v-text-field
                label="Source"
                v-model="quote.source"
              ></v-text-field>
            </v-flex>
            <v-flex xs2 />
            <v-flex xs5>
              <!-- Graphic URL -->
              <v-text-field
                label="Graphic URL"
                v-model="quote.graphic_url"
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <!-- Comment -->
              <v-textarea
                label="Comment"
                v-model="quote.comment"
                required
                rows="1"
              ></v-textarea>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs11 class="text-xs-left">
              <v-btn :disabled="!valid" @click="submit">Submit</v-btn>
              <v-btn @click="clear">Clear</v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-container>
    </div>


        <!--<v-text-field-->
          <!--label="Source"-->
          <!--v-model="quote.source"-->
        <!--&gt;</v-text-field>-->
        <!--<v-card-actions>-->
          <!--<v-spacer></v-spacer>-->
          <!--<v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>-->
          <!--<v-btn color="blue darken-1" flat :disabled="!valid" @click.native="save">Save</v-btn>-->
        <!--</v-card-actions>-->
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
  import router from '../../router';
  import Helper from '../../modules/helper';

  const _ = require('lodash');
  const helper = new Helper();
  const emptyRecord = {
    id: undefined,
    formatid: 1,
    categoryid: undefined,
    quote_string: '',
    author_first_name: '',
    author_last_name: '',
    source: '',
    comment: ''
  };

  export default {
    name: 'QuoteMaint',
    // props: ['quote'],
    data: () => ({
      categories: [],
      formats: [],
      valid: true,
      quoteRules: [
        v => !!v || 'Quote string is required',
      ],
      select: null,
    }),
    components: {
      MaintDataTable,
      MenuTree,
      alertctl: AlertControl,
    },
    mounted() {
      if (this.quote.id === undefined) {
        this.$store.dispatch('setQuote', _.cloneDeep(emptyRecord));
      }
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
      quote() {
        return this.$store.getters.quote;
      },
      formEnabled() {
        return this.appId === undefined;
      },
    },
    methods: {
      initializePage: function() {
        helper.fetch(this, 'categories', '/quotes/categories');
        helper.fetch(this, 'formats', '/quotes/formats');
      },
      // fetchRows: function(e) {
      //   this.clear();
      //   this.items = [];
      //   this.appId = e;
      //   axios.get(`${this.$store.getters.serverUrl}/pages/app/${e}`)
      //     .then((response) => {
      //       this.items = response.data;
      //     })
      //     .catch((err) => {
      //       console.log(err.response.data);
      //     });
      // },
      showList() {
        router.push('/apps/quoteslist');
      },
      clear() {
        this.$refs.form.reset();
        // this.editIndex = -1;
        // this.editRecord = _.cloneDeep(emptyRecord);
        this.$store.dispatch('setQuote', _.cloneDeep(emptyRecord));
      },
      submit() {
        if (this.$refs.form.validate()) {
          if (this.quote.id === undefined) {
            // add --------------------
            axios.post(`${this.$store.getters.serverUrl}/quotes`, this.quote, this.requestHeaders)
              .then((response) => {
                this.clear();
                this.$refs.alertCtrl.showAlert('success', 'Quote added.')
              })
              .catch((err) => {
                console.log(err);
                this.$refs.alertCtrl.showAlert('error', `Quotes add failed.`);
              });
          } else {
            // update -----------------
            axios.put(`${this.$store.getters.serverUrl}/quotes/${this.quote.id}`, this.quote, this.requestHeaders)
              .then((response) => {
                this.clear();
                this.$refs.alertCtrl.showAlert('success', 'Quote updated.')
              })
              .catch((err) => {
                console.log(err);
                this.$refs.alertCtrl.showAlert('error', `Quotes update failed.`);
              });
          }
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
     //  editItem(item) {
     //    this.editIndex = this.items.indexOf(item);
     //    this.editRecord = item;
     //    this.setEditHasMenuItem();
     //  },
     //  getAppItem: function() {
     //    const appItems = this.$refs.menuTree.getAppItems();
     //    return _.find(appItems, (it) => {
     //      return it.appid === this.appId
     //    });
     //  },
      // appMenuHasPage: function(children, id) {
      //   return _.find(children, (it) => {
      //     console.log(`id: ${id} : pageid: ${it.pageid}`);
      //     if (it.pageid === id) {
      //       console.log(`------------------ fnd: ${it.pageid}`);
      //       return true;
      //     } else {
      //       return this.appMenuHasPage(it.children, id);
      //     }
      //   })
      // },
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
      // updateItems: function(self) {
      //   // It was necessary to force the datatable to update by creating a new items array
      //   const newList = [];
      //   _.forEach(self.items, (it) => {
      //     newList.push(it);
      //   });
      //   return newList;
      // },
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
