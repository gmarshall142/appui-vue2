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
          <v-row class="layout">
            <!-- Note Topics -->
            <v-col cols="6">
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
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="topicRecord.parentid"
                :items="topics"
                label="SubTopic Of"
                item-text="name"
                item-value="id"
                clearable
                :disabled="parentTopicDisabled"
              ></v-select>
            </v-col>
          </v-row>
          <v-row class="layout">
            <!-- ID, Comment -->
            <v-col cols="2" class="text-xs-left">
              <v-card-text class="text-xs-left" style="height: 50%; vertical-align: middle;">ID:&nbsp;&nbsp;&nbsp;&nbsp;{{note.id}}</v-card-text>
            </v-col>
            <v-col cols="10">
              <v-text-field
                label="Comment"
                v-model="note.comment"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="layout">
            <!-- Note -->
            <v-col cols="12" class="text-xs-left">
              <v-textarea
                label="Note"
                v-model="note.notetext"
                :rules="rules.note"
                required
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
          <!-- Tags -->
          <v-row class="layout">
            <v-col cols="12">
              <v-combobox
                v-model="tagModel"
                :items="tags"
                item-text="name"
                item-value="id"
                label="Tags"
                small-chips
                multiple
                clearable
                dense
                hide-selected
              ></v-combobox>
            </v-col>
          </v-row>
          <!-- Attachments -->
          <v-row class="layout">
            <v-col cols="6">
              <template>
                <v-card
                  class="mx-auto"
                  tile
                >
                  <v-list-item v-for="na in noteattachments">
                      <a :href="na.attachment.href">{{na.attachment.name}}</a>
                      <v-spacer></v-spacer>
                      <v-icon class="attachment-delete" @click="handleDelete(na)">delete</v-icon>
                  </v-list-item>
                </v-card>
              </template>            </v-col>
            <v-col cols="6">
              <v-file-input v-model="files" multiple small-chips label="Attachments"></v-file-input>
            </v-col>
          </v-row>
          <v-row class="layout">
            <v-col cols="11" class="text-xs-left">
              <v-btn class="form-button" :disabled="!valid" @click="submit">Submit</v-btn>
              <v-btn class="form-button" @click="clear">Clear</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </div>
  </div>
</template>

<script>
//import axios from 'axios';
import MaintDataTable from '../component/MaintDataTable.vue';
import MenuTree from '../component/MenuTree.vue';
import AlertControl from '../component/Alert'
import router from '../../router';
import Helper from '../../modules/helper';
import AxiosHelper from '../../modules/axiosHelper';

const _ = require('lodash');

const helper = new Helper();
const axiosHelper = new AxiosHelper();

const emptyTopic = {
  id: undefined,
  name: '',
  parentid: undefined
};
const emptyNote = {
  id: undefined,
  topicid: undefined,
  comment: '',
  notetext: '',
  tags: [],
  attachments: []
};

export default {
  name: 'NoteMaint',
  data: () => ({
    topic: undefined,
    tmpSubTopicId: undefined,
    topics: [],
    note: _.cloneDeep(emptyNote),
    topicRecord: _.cloneDeep(emptyTopic),
    tagStr: undefined,
    items: [],
    tagModel: undefined,
    tags: [],
    files: [],
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
    // check for edit note
    this.note = this.$store.getters.note;
    this.setTopic();
  },
  computed: {
    noteattachments: {
      get() {
        //return this.note.noteattachments;
        const ret = _.cloneDeep(this.note.noteattachments);
        _.forEach(ret, it => {
          const fnd = _.find(it.attachment.links, link => {
            return link.type === 'GET';
          });
          if(fnd) {
            it.attachment.href = fnd.href;
          }
        });
        return _.sortBy(ret, ['attachment.name']);
      },
      // set(value) {
      //   console.log('------------- items.set');
      //   this.items = value;
      // }
    },
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
      helper.fetch(this, 'topics', '/notes/topics');
      this.fetchTags();
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
    handleDelete(item) {
      console.log(`delete: ${JSON.stringify(item)}`);
      // this.deleteIndex = this.items.indexOf(item);
      // this.dialog = true;
    },
    fetchTags: function() {
      helper.asyncFetch('/master/tags', this)
      .then((resp) => {
        this.tags = resp.data;
        this.setTagsModel();
      })
    },
    showList() {
      router.push('/apps/noteslist');
    },
    clear() {
      this.$refs.form.reset();
      this.note = _.cloneDeep(emptyNote);
      this.topicRecord = _.cloneDeep(emptyTopic);
    },
    setTopic() {
      if(this.note.topicid) {
        axiosHelper.get(`/notes/topics/${this.note.topicid}`)
          .then((resp) => {
            this.topicRecord = resp.data;
            this.topic = resp.data.name;
          })
      }
    },
    setTagsModel() {
      this.tagModel = [];
      _.forEach(this.note.tags, it => {
        const fnd = _.find(this.tags, tag => tag.id === it);
        if(fnd) this.tagModel.push(fnd);
      });
    },
    submit() {
      if (this.$refs.form.validate()) {
        // check note topic
        // if(!this.note.topic) {
        if (typeof(this.topic) === 'string') {
          const topicRecord = {
            name: this.topic,
            parentid: this.tmpSubTopicId
          };
          this.note.topicRecord = this.topicRecord;
          axiosHelper.post('/notes/topics', topicRecord)
            .then((response) => {
              //this.submitNote();
              this.topicRecord = response.data;
              helper.fetch(this, 'topics', '/notes/topics');
            })
            .catch((err) => {
              console.log(err);
              this.$refs.alertCtrl.showAlert('error', `Note topic add failed.`);
            });
        // } else {
        //   this.submitNote();
        }
        this.submitNote();
      }
    },
    submitNote() {
      console.log(`*** Submit note`);
      this.note.topicid = this.topic.id;
      this.note.tagModel = this.tagModel;
      let formData = new FormData();
      formData.append('note', JSON.stringify(this.note));
      _.forEach(this.files, file => formData.append('files', file, file.name));
      const recordUrl = this.note.id ? `/${this.note.id}` : '';
      const fullUrl = `${this.$store.getters.serverUrl}/notes${recordUrl}`;
      axiosHelper.request({
        method: (this.note.id ? 'put' : 'post'),
        url: fullUrl,
        data: formData
      })
        .then(() => {
          this.clear();
          this.$refs.alertCtrl.showAlert('success', 'Note saved.')
        })
        .catch(() => {
          this.$refs.alertCtrl.showAlert('error', `Note save failed.`);
        });
      // axiosHelper.save('/notes', formData)
      //   .then((response) => {
      //     this.clear();
      //     this.$refs.alertCtrl.showAlert('success', 'Note saved.')
      //   })
      //   .catch((err) => {
      //     this.$refs.alertCtrl.showAlert('error', `Note save failed.`);
      //   });
      // axiosHelper.post('/files/upload', formData)
      //   .then(response => {
      //     console.log(`response: ${response}`);
      //   })
      //   .catch(error => {
      //     console.log(error);
      //   })
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
  .attachment-delete
    text-align right
</style>
