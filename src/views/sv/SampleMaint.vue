<template>
  <div class="support">
    <div style="margin: 10px 40px 10px 20px">
      <v-layout row wrap>
        <v-flex xs10 class="text-xs-left">
          <h1>Note Maintenance</h1>
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
              <!--<v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle;">ID:&nbsp;&nbsp;&nbsp;&nbsp;{{quote.id}}</v-card-text>-->
            </v-flex>
            <v-flex xs5>
              <!--<v-text-field-->
                <!--label="Author First Name"-->
                <!--v-model="quote.author_first_name"-->
              <!--&gt;</v-text-field>-->
            </v-flex>
            <v-flex xs5>
              <!--<v-text-field-->
                <!--label="Author Last Name"-->
                <!--v-model="quote.author_last_name"-->
              <!--&gt;</v-text-field>-->
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs3>
              <!-- Category -->
              <!--<v-select-->
                <!--v-model="quote.categoryid"-->
                <!--:items="categories"-->
                <!--label="Category"-->
                <!--item-text="name"-->
                <!--item-value="id"-->
                <!--clearable-->
              <!--&gt;</v-select>-->
            </v-flex>
            <v-flex xs1 />
            <v-flex xs3>
              <!-- Format -->
              <!--<v-select-->
                <!--v-model="quote.formatid"-->
                <!--:items="formats"-->
                <!--label="Format"-->
                <!--item-text="name"-->
                <!--item-value="id"-->
                <!--clearable-->
              <!--&gt;</v-select>-->
            </v-flex>
            <v-flex xs1 />
            <v-flex xs4>
              <!-- Updatedat -->
              <!--<v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle; font-size: small">Updated:&nbsp;&nbsp;&nbsp;&nbsp;{{quote.updatedat}}</v-card-text>-->
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <!-- Quote -->
            <v-flex xs12 class="text-xs-left">
              <!--<v-textarea-->
                <!--label="Quote Text"-->
                <!--v-model="quote.quote_string"-->
                <!--:rules="quoteRules"-->
                <!--required-->
                <!--box-->
                <!--rows="3"-->
              <!--&gt;</v-textarea>-->
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs5>
              <!-- Source -->
              <!--<v-text-field-->
                <!--label="Source"-->
                <!--v-model="quote.source"-->
              <!--&gt;</v-text-field>-->
            </v-flex>
            <v-flex xs2 />
            <v-flex xs5>
              <!-- Graphic URL -->
              <!--<v-text-field-->
                <!--label="Graphic URL"-->
                <!--v-model="quote.graphic_url"-->
              <!--&gt;</v-text-field>-->
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <!-- Comment -->
              <!--<v-textarea-->
                <!--label="Comment"-->
                <!--v-model="quote.comment"-->
                <!--:rules="comment"-->
                <!--required-->
                <!--rows="1"-->
              <!--&gt;</v-textarea>-->
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
  };

  export default {
    name: 'QuoteMaint',
    data: () => ({
      categories: [],
      formats: [],
      valid: true,
      // quoteRules: [
      //   v => !!v || 'Quote string is required',
      // ],
      select: null,
    }),
    components: {
      MaintDataTable,
      MenuTree,
      alertctl: AlertControl,
    },
    mounted() {
      // if (this.quote.id === undefined) {
      //   this.$store.dispatch('setQuote', _.cloneDeep(emptyRecord));
      // }
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
      // quote() {
      //   return this.$store.getters.quote;
      // },
      formEnabled() {
        return this.appId === undefined;
      },
    },
    methods: {
      initializePage: function() {
        this.fetchApps();
        // helper.fetch(this, 'categories', '/quotes/categories');
        // helper.fetch(this, 'formats', '/quotes/formats');
      },
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
          // if (this.quote.id === undefined) {
            // add --------------------
            // axios.post(`${this.$store.getters.serverUrl}/quotes`, this.quote, this.requestHeaders)
            //   .then((response) => {
            //     this.clear();
            //     this.$refs.alertCtrl.showAlert('success', 'Quote added.')
            //   })
            //   .catch((err) => {
            //     console.log(err);
            //     this.$refs.alertCtrl.showAlert('error', `Quotes add failed.`);
            //   });
          // } else {
            // update -----------------
          //   axios.put(`${this.$store.getters.serverUrl}/quotes/${this.quote.id}`, this.quote, this.requestHeaders)
          //     .then((response) => {
          //       this.clear();
          //       this.$refs.alertCtrl.showAlert('success', 'Quote updated.')
          //     })
          //     .catch((err) => {
          //       console.log(err);
          //       this.$refs.alertCtrl.showAlert('error', `Quotes update failed.`);
          //     });
          // }
        }
      },
      deleteItem: function(idx) {
        const items = this.items;
        console.log(`delete in AppMaint: ${idx}  id: ${items[idx].id}`);
        // return axios.delete(`${this.$store.getters.serverUrl}/pages/${items[idx].id}`, this.requestHeaders)
        //   .then((response) => {
        //     const self = this;
        //     const id = Number(response.data.id);
        //
        //     _.remove(self.items, (it) => {
        //       return it.id === id;
        //     });
        //     self.items = this.updateItems(self);
        //     this.clear();
        //     //this.showAlert('success', 'Page deleted.')
        //     // this.$refs.appForm.formio.setAlert('success', 'It worked');
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      },
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
