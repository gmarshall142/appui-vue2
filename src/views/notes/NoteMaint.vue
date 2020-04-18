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
            <!-- Note Topics -->
            <v-flex xs6>
              <v-combobox
                v-model="topic"
                :items="topics"
                label="Topic"
                item-text="name"
                item-value="id"
                :rules="rules.required"
                clearable
                @change="handleTopicChange"
              ></v-combobox>
            </v-flex>
            <v-flex xs6>
              <v-select
                v-model="topicRecord.parentid"
                :items="topics"
                label="SubTopic Of"
                item-text="name"
                item-value="id"
                clearable
                :disabled="parentTopicDisabled"
              ></v-select>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <!-- ID, Comment -->
            <v-flex xs2 class="text-xs-left">
              <v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle;">ID:&nbsp;&nbsp;&nbsp;&nbsp;{{noteRecord.id}}</v-card-text>
            </v-flex>
            <v-flex xs10>
              <v-text-field
                label="Comment"
                v-model="noteRecord.comment"
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <!-- Note -->
            <v-flex xs12 class="text-xs-left">
              <v-textarea
                label="Note"
                v-model="noteRecord.note"
                :rules="rules.note"
                required
                box
                rows="3"
              ></v-textarea>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs6>
              <!-- Tags -->
              <v-text-field
                label="Tags"
                v-model="tagStr"
              ></v-text-field>
            </v-flex>
            <!--<v-flex xs1 />-->
            <v-flex xs6>
              <!-- Attachments -->
              <v-select
                :items="noteRecord.attachments"
                label="Attachments"
                item-text="name"
                item-value="id"
                clearable
              ></v-select>
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
const emptyTopic = {
  id: undefined,
  name: '',
  parentid: undefined
};
const emptyNote = {
  id: undefined,
  topicid: undefined,
  comment: '',
  note: '',
  tags: [],
  attachments: []
};

export default {
  name: 'NoteMaint',
  data: () => ({
    topic: undefined,
    tmpSubTopicId: undefined,
    topics: [],
    noteRecord: _.cloneDeep(emptyNote),
    topicRecord: _.cloneDeep(emptyTopic),
    tagStr: undefined,
    items: [],
    valid: true,
    rules: {
      required: [value => !!value || 'Required.'],
      // title: [
      //   v => !!v || 'Title is required and will be used as a title for the resource.',
      //   v => (v && v.length <= 40) || 'Title must be less than 40 characters'
      // ],
      // apipath: [
      //   v => !!v || 'API path is required.',
      //   v => (v && v.length <= 40) || 'API path must be less than 20 characters'
      // ],
      note: [
        v => (!v || v.length <= 1000) || 'Note must be less than 1000 characters'
      ],
    },
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
    // parentTopicId: {
    //   get() {
    //     if (this.topic === undefined || this.topic === null) {
    //       return undefined;
    //     } if (typeof(this.topic) === 'string') {
    //       return this.tmpSubTopicId;
    //     } else {
    //       return this.topic.parentid;
    //     }
    //   },
    //   set(value) {
    //     if (typeof(this.topic === 'string')) {
    //       this.tmpSubTopicId = value;
    //     }
    //   }
    // },
    formEnabled() {
      return this.appId === undefined;
    },
    parentTopicDisabled() {
      console.log(`id: ${this.topicRecord.id}  name: .${this.topicRecord.name}.`);
      console.log(`parentTopicDisabled: ${this.topicRecord.id === undefined && this.topicRecord.name === ''}`);
      return this.topicRecord.id === undefined && this.topicRecord.name === '';
    },
    // filteredTopics() {
    //   if (this.topic === null || this.topic === undefined) return this.topics;
    //   return _.filter(this.topics, it => it.id !== this.topicRecord.id);
    // }
  },
  methods: {
    initializePage: function() {
      //this.fetchApps();
      helper.fetch(this, 'topics', '/notes/topics');
      // helper.fetch(this, 'formats', '/quotes/formats');
    },
    handleTopicChange(e) {
      if(e === null) e = undefined;
      switch(typeof(e)) {
        case 'object':
          this.topicRecord = e;
          break;
        case 'string':
          this.topicRecord.name = e;
          break;
        case 'undefined':
          this.topicRecord = _.cloneDeep(emptyTopic);
          break;
      }
    },
    showList() {
      router.push('/apps/quoteslist');
    },
    clear() {
      this.$refs.form.reset();
      // this.editIndex = -1;
      // this.editRecord = _.cloneDeep(emptyRecord);
      // this.$store.dispatch('setQuote', _.cloneDeep(emptyRecord));
    },
    submit() {
      if (this.$refs.form.validate()) {
        // check note topic
        if (typeof(this.topic) === 'string') {
          const topicRecord = {
            name: this.topic,
            parentid: this.tmpSubTopicId
          };
          console.log(`*** add topic: ${JSON.stringify(topicRecord)}`);
          axios.post(`${this.$store.getters.serverUrl}/notes/topics`, topicRecord, this.requestHeaders)
            .then((response) => {
              this.submitNote();
              helper.fetch(this, 'topics', '/notes/topics');
            })
            .catch((err) => {
              console.log(err);
              this.$refs.alertCtrl.showAlert('error', `Note topic add failed.`);
            });
        }
      }
    },
    submitNote() {
      console.log(`*** Submit note`);
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
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  h1
    margin 10px 0 0 20px
  div
    margin-top inherit
  .container.grid-list-md .layout .flex
    padding-left 10px
    padding-right 10px
</style>
