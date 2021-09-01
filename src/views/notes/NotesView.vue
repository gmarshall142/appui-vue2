<template>
  <div class="support">
    <div style="margin: 10px 40px 10px 20px">
      <v-layout row wrap>
        <v-flex xs10 class="text-xs-left">
          <h1>Notes List</h1>
        </v-flex>
        <v-flex xs2 class="text-xs-right">
          <v-btn @click="addNote">Add Note</v-btn>
        </v-flex>
      </v-layout>
    </div>
    <v-spacer></v-spacer>

    <alertctl ref="alertCtrl"></alertctl>

    <v-spacer></v-spacer>

    <data-table
      ref="dataTable"
      formTitle="Notes"
      v-bind="{headers, items, deleteItem, submitItem, promptColumn}"
      v-bind:actions="{ edit: true, delete: true}"
      v-on:edit-item="editItem"
    ></data-table>
  </div>
</template>

<script>
  import DataTable from '../component/DataTable.vue';
  import MenuTree from '../component/MenuTree.vue';
  import AlertControl from '../component/Alert'
  import router from '../../router';
  import AxiosHelper from "../../modules/axiosHelper";
  import bus from "../../modules/bus";

  const _ = require('lodash');
  const axiosHelper = new AxiosHelper();
  // const defaultRecord = {
  //   version: 0,
  //     author_first_name: '',
  //     author_last_name: '',
  //     category: 0,
  //     comment: '',
  //     graphic_url: null,
  //     quote_format: 0,
  //     quote_string: null,
  //     source: '',
  // };

  export default {
    name: 'NotesView',
    props: ['item', 'index', 'submenu'],
    data() {
      return {
        headers: [
          { text: 'ID', value: 'id'},
          { text: 'Topic', value: 'topicname'},
          { text: 'Comment', value: 'comment' },
          { text: 'Note', value: 'notetext' },
          { text: 'Tags', value: 'tags' }
        ],
        apps: [],
        appId: undefined,
        items: [],
        // editRecord: defaultRecord,
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
      DataTable,
      MenuTree,
      alertctl: AlertControl,
    },
    created: function() {
      bus.$on('app-login-change', this.loginChangeHandler);
    },
    beforeDestroy: function() {
      bus.$off('app-login-change', this.loginChangeHandler);
    },
    mounted() {
      this.initializePage();
      console.log('mounted');
    },
    computed: {
      formEnabled() {
        return this.appId === undefined;
      },
    },
    methods: {
      loginChangeHandler: function() {
        console.log(`************* loginChangeHandler`);
      },
      initializePage: function() {
        this.fetchNotes();
      },
      fetchNotes: function() {
        axiosHelper.get('/notes')
          .then((response) => {
            // this.items = response.data;
            this.items = [];
            _.forEach(response.data, (it) => {
              const itm = it;
              itm.topicname = it.topic.name;
              this.items.push(itm);
            })
          })
          .catch((err) => {
            this.$refs.alertCtrl.showAlert('error', 'Quotes request failed.');
          });
      },
      // fetchApps: function() {
      //   axiosHelper.get('/applications')
      //     .then((response) => {
      //       this.apps = response.data;
      //     })
      //     .catch((err) => {
      //       console.log(err.response.data);
      //     });
      // },
      // fetchRows: function(e) {
      //   this.clear();
      //   this.items = [];
      //   this.appId = e;
      //   axiosHelper.get(`/pages/app/${e}`)
      //     .then((response) => {
      //       this.items = response.data;
      //     })
      //     .catch((err) => {
      //       console.log(err.response.data);
      //     });
      // },
      addNote() {
        this.$store.dispatch('setNote', {});
        router.push('/apps/notemaint');
      },
      submitItem() {

      },
      // submit() {
      //   if (this.$refs.form.validate()) {
      //     this.submitItem(this.editIndex, this.quote);
      //   }
      // },
      editItem(item) {
        // this.editIndex = this.items.indexOf(item);
        // TODO: set store quote and navigate to QuoteMaint
        //this.editRecord = item;
        // this.setEditHasMenuItem();
        this.$store.dispatch('setNote', item);
        router.push('/apps/notemaint');
      },
      getAppItem: function() {
        const appItems = this.$refs.menuTree.getAppItems();
        return _.find(appItems, (it) => {
          return it.appid === this.appId
        });
      },
      deleteItem: function(item) {
        // const items = this.items;
        // console.log(`delete in NotesView: ${idx}  id: ${items[idx].id}`);
        return axiosHelper.delete(`/notes/${item.id}`)
          .then((response) => {
            const self = this;
            const id = Number(response.data.id);

            _.remove(self.items, (it) => {
              return it.id === id;
            });
            self.items = this.updateItems(self);
            this.$refs.alertCtrl.showAlert('success', 'Note deleted.');
          })
          .catch((err) => {
            this.$refs.alertCtrl.showAlert('error', 'NOte failed.');
          });
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
