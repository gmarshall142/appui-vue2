<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>Please confirm the deletion of the item: {{deleteName}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click.native="dialog = false; deleteParentItem()">Delete</v-btn>
          <v-btn color="green darken-1" text @click.native="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card id="datatable-card">
      <v-card-title class="search-card">
        <h4>{{formTitle}}</h4>
        <v-spacer></v-spacer>
        <!-- Export Menu -->
        <v-menu offset-y bottom :close-on-content-click="true" open-on-hover>
          <template v-slot:activator="{ on }">
            <v-btn text v-on="on">Export<v-icon small>arrow_drop_down</v-icon></v-btn>
          </template>
          <v-list>
            <v-list-item  v-if="isFullResult" @click="pdf">
              <div class="btn">PDF</div>
            </v-list-item>
            <v-list-item  v-else @click="pdf">
              <div class="btn">PDF (Server)</div>
            </v-list-item>
            <v-list-item v-if="isFullResult">
              <download-excel
                class="btn"
                :fetch="fetchData"
                :before-generate="startDownload"
                :before-finish="finishDownload"
                worksheet="Export"
                name="filename.xls"
              >Excel
              </download-excel>
            </v-list-item>
            <v-list-item v-else @click="excelHandler">
              <div class="btn">Excel (Server)</div>
            </v-list-item>
            <v-list-item v-if="isFullResult">
              <download-excel
                class="btn"
                type="csv"
                :fetch="fetchData"
                :before-generate="startDownload"
                :before-finish="finishDownload"
                name="filename.csv"
              >CSV
              </download-excel>
            </v-list-item>
            <v-list-item v-else @click="csvHandler">
              <div class="btn">CSV (Server)</div>
            </v-list-item>
            <v-list-item @click="clipboard">
              <div class="btn">Clipboard</div>
            </v-list-item>
            <v-list-item @click="print">
              <div class="btn">Print</div>
            </v-list-item>
<!--            <v-list-item v-if="!isFullResult" @click="serverPDF">-->
<!--              <div class="btn">PDF (Server)</div>-->
<!--            </v-list-item>-->
          </v-list>
        </v-menu>
        <v-progress-circular
          v-if="downloadingFlag"
          indeterminate
          color="primary"
        ></v-progress-circular>
        <v-spacer></v-spacer>
        <div style="margin-right: 10px">
          <!-- search column -->
          <v-select
            class="search-select"
            v-model="searchColumn"
            :items="headers"
            item-text="text"
            item-value="value"
            clearable
            dense
            height="20"
            label="Search Column"
          ></v-select>
        </div>
        <v-spacer></v-spacer>
        <!-- search text -->
        <v-text-field
          class="search-text"
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
          clearable
        ></v-text-field>
      </v-card-title>

      <!-- DataTable -->
      <v-data-table
        ref="dataTable"
        :show-select="showSelect"
        v-model="selected"
        :headers="calcHeaders"
        :items="pageItems"
        :custom-filter="customFilter"
        item-key="id"
        class="results-table elevation-1"
        :search="searchTrigger"
        :server-items-length="serverItemsLength"
        :items-per-page="itemsPerPage"
        :loading="loading"
        options.sync="options"
        :footer-props="{
          showFirstLastPage: true,
          itemsPerPage: listSize
        }"
        :sort-by.sync="orderBy"
        :sort-desc.sync="sortDesc"
        @update:options="updateOptions"
        @pagination="pageHandler"
        @update:sort-by="sortHandler"
        @update:sort-desc="sortHandler"
        dense
      >
        <!-- Rows -->
        <template v-slot:item="{ item }">
          <tr>
            <td v-if="showActions()">
              <v-icon v-if="actions.edit" small class="mr-2" @click="$emit('edit-item', item)">edit</v-icon>
              <v-icon v-if="actions.delete" small @click="handleDelete(item)">delete</v-icon>
            </td>
              <td v-if="showSelect">
                <v-simple-checkbox :value="itemSelected(item)" @input="select(item, $event)"></v-simple-checkbox>
              </td>
            <td
              v-for="header in headers"
              :key="header.value"
              style="white-space: nowrap; max-width: 200px; overflow-x: hidden;"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{ item[header.value] }}</span>
                </template>
                <span>{{ item[header.value] }}</span>
              </v-tooltip>
            </td>
          </tr>
        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="reset">Reset</v-btn>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import Vue from 'vue';
import downloadExcel from 'vue-json-excel';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import AxiosHelper from '../../modules/axiosHelper';
import bus from '../../modules/bus';

const _ = require('lodash');

const axiosHelper = new AxiosHelper();
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default {
  name: 'DataTable',
  components: {
    downloadExcel
  },
  props: {
    formTitle: String,
    headers: Array,
    items: Array,
    deleteItem: Function,
    promptColumn: String,
    actions: {
      type: Object,
      default: () => ({ edit: true, delete: true })
    },
    itemsPerPage: {
      type: Number,
      default: () => 15
    },
    sortBy: {
      type: Array,
      default: () => ['id']
    },
    pageFunc: Function,
    showSelect: {
      type: Boolean,
      default: false
    },
    selectedModel: Array,
    totalResults: Number,
    reset: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      updateNow: false,
      downloadingFlag: false,
      search: '',
      searchColumn: undefined,
      dialog: false,
      deleteIndex: -1,
      localDeleteItem: undefined,
      Item: undefined,
      listSize: [10, 25, 50, 100, -1],
      orderBy: this.sortBy,
      sortDesc: undefined,
      options: {
        page: 0,
        itemsPerPage: this.itemsPerPage
      },
      pagination: {
        page: 0,
        itemsPerPage: this.itemsPerPage
      },
      offset: 0,
      results: undefined,
      reloading: false,
      selected: [],
      queryTotalCount: undefined
    };
  },
  mounted() {
    // this.results = this.items;
    // Vue.set(this, 'results', this.items);
  },
  watch: {
    // eslint-disable-next-line quote-props
    items: function () {
      if(this.totalResults) {
        this.queryTotalCount = this.totalResults;
      } else if(this.items.length > 0
        && this.items[0].total_count) {
        // capture total_count
        this.queryTotalCount = this.items[0].total_count;
      }
      this.results = _.cloneDeep(this.items);
    },
    search: _.debounce(function() {
      this.searchHandler();
    }, 500),
    selectedModel: function() {
      this.selected = this.selectedModel;
    },
    searchColumn: function() {
      if(this.searchColumn === undefined) {
        this.search = '';
      }
      this.searchHandler();
    }
  },
  computed: {
    deleteName() {
      // return (this.items && this.items[this.deleteIndex] ? this.items[this.deleteIndex][this.promptColumn] : '');
      return (this.localDeleteItem ? this.localDeleteItem[this.promptColumn] : '');
    },
    calcHeaders() {
      if(this.showActions()) {
        return _.concat([{ text: 'Actions', value: 'actions' }], this.headers);
      }
      return this.headers;
    },
    serverItemsLength() {
      if(this.items.length > 0
        // && this.items[0].total_count
        && this.queryTotalCount
        && Number(this.queryTotalCount) !== this.items.length) {
        // && Number(this.items[0].total_count) !== this.items.length) {
        if(this.results
          && this.results.length > 0
          && this.results[0].total_count) {
          // && Number(this.results[0].total_count) !== this.results.length) {
          return Number(this.results[0].total_count);
        } else if(this.results) {
          return this.results.length;
        }
      }
      return undefined;
    },
    pageItems() {
      if(this.serverItemsLength === undefined) {
        return this.items;
      }
      if(!this.results) {
        return [];
      }

      const { page, itemsPerPage } = this.options;
      const start = ((page - 1 >= 0 ? page - 1 : 0) * itemsPerPage) - this.offset;
      const stop = (page * itemsPerPage) - this.offset;
      return this.results.slice(start, stop);
    },
    store() {
      return this.$store ? this.$store : this.$root.store;
    },
    isFullResult() {
      return this.serverItemsLength === undefined || this.items.length === this.queryTotalCount;
    },
    loading() {
      return this.reloading;
    },
    searchTrigger() {
      return this.search;
    }
  },
  methods: {
    forceUpdate: function() {
      this.$nextTick(() => {
        this.updateNow = !this.updateNow;
        this.updateNow = !this.updateNow;
      });
    },
    showActions: function() {
      return this.actions.edit || this.actions.delete;
    },
    showAlert: function(level, msg) {
      bus.$emit('alert-msg', { method: 'alert', level: level, msg: msg });
    },
    select: function(item, flag) {
      bus.$emit('select-user', { user: item, select: flag });
    },
    itemSelected: function(item) {
      const fnd = _.find(this.selected, it => it.id === item.id);
      return !!fnd;
    },
    clearPaging: function() {
      this.options.page = 0;
      this.offset = 0;
      this.results = [];
    },
    fetchData: function() {
      const data = [];
      const headers = [];
      const headerValues = [];
      _.forEach(this.headers, (header) => {
        headers.push(header.text);
        headerValues.push(header.value);
      });
      _.forEach(this.items, (item) => {
        const obj = {};
        _.forEach(headerValues, (header, idx) => {
          obj[headers[idx]] = item[header];
        });
        data.push(obj);
      });
      return data;
    },
    startDownload: function() {
      this.downloadingFlag = true;
    },
    finishDownload: function() {
      this.downloadingFlag = false;
    },
    pdf: async function() {
      if(this.isFullResult) {
        this.createPdf().download('datatable.pdf');
      } else {
        try {
          const docDefinition = await this.exportHandler('pdf');
          const pdf = pdfMake.createPdf(docDefinition);
          pdf.download('datatable.pdf');
        } catch(ignore) {}
      }
    },
    excelHandler: async function() {
      try {
        const xls = await this.exportHandler('excel');
        this.downloadObject(xls, 'filename.xls');
      } catch(ignore) {}
    },
    csvHandler: async function() {
      try {
        const csv = await this.exportHandler('csv');
        this.downloadObject(csv, 'filename.csv');
      } catch(ignore) {}
    },
    downloadObject: function(exportObj, exportName) {
      try {
        const blob = new Blob([this.s2ab(exportObj)], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = exportName;
        document.body.appendChild(a); // required for firefox
        a.click();
        document.body.removeChild(a);
      } catch(error) {
        console.error(`error: ${error}`);
        this.showAlert('error', 'Export failed.');
      }
    },
    s2ab: function(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF; // eslint-disable-line no-bitwise
      return buf;
    },
    print: function() {
      this.createPdf().print();
    },
    createPdf: function() {
      const dataTable = this.$refs.dataTable;
      const docDefinition = this.generateDoc(dataTable);
      return pdfMake.createPdf(docDefinition);
    },
    clipboard: function() {
      const data = JSON.stringify(this.fetchData(), null, 2);

      const textArea = document.createElement('textarea');
      textArea.value = data;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      document.body.removeChild(textArea);
    },
    customFilter(items, search, filter) {
      const newSearch = search.toString().toLowerCase();
      if (newSearch === '') {
        return true;
      }
      let keys = _.keys(filter);
      if(this.searchColumn !== undefined) {
        keys = [this.searchColumn];
      }
      let fnd = false;
      _.forEach(keys, (key) => {
        if (filter[key]) {
          const str = filter[key].toString().toLowerCase();
          if (str.indexOf(newSearch) > -1) fnd = true;
        }
      });
      return fnd;
    },
    handleDelete(item) {
      // this.deleteIndex = this.items.indexOf(item);
      this.localDeleteItem = item;
      this.dialog = true;
    },
    deleteParentItem() {
      // this.deleteItem(this.items[this.deleteIndex]);
      this.deleteItem(this.localDeleteItem);
    },
    generateDoc: function(tbl) {
      const body = [];
      const headerText = [];
      const widths = [];
      _.forEach(tbl.headers, (it) => {
        let width = '*';
        const datatype = it.datatype ? it.datatype : 'string';
        if(datatype === 'integer' || datatype === 'integer[]') {
          width = 'auto';
        }
        widths.push(width);
      });

      _.forEach(tbl.headers, (hdr) => {
        headerText.push({ text: hdr.text, style: 'header' });
      });
      body.push(headerText);
      _.forEach(tbl.items, (itm) => {
        const row = [];
        _.forEach(tbl.headers, (it) => {
          const datatype = it.datatype ? it.datatype : 'string';
          // handle array
          if(datatype.endsWith('[]') && itm[it.value] !== null) {
            row.push({ text: _.join(itm[it.value]) });
          } else {
            row.push({ text: itm[it.value] });
          }
        });
        body.push(row);
      });

      const table = {
        headerRows: 1,
        widths: widths,
        body: body
      };
      return {
        pageOrientation: 'landscape',
        content: [
          {
            layout: 'lightHorizontalLines',
            table: table
          }
        ],
        styles: {
          header: {
            bold: true,
            margin: [0, 10, 0, 10],
            alignment: 'left'
          }
        },
        defaultStyle: {
          fontSize: 8,
          bold: false
        }
      };
    },
    updateOptions: function(options) {
      this.options = options;
    },
    pageHandler: function(e) {
      if(e.pageCount === 0) {
        return;
      }

      if(e.pageStart === 0 && e.pageStop === 0) {
        e.pageStart = (e.page - 1) * e.itemsPerPage;
        e.pageStop = ((e.page) * e.itemsPerPage) - 1;
      }
      const rangeStart = this.offset;
      const rangeStop = this.offset + this.items.length;
      const start = ((e.page - 1) * e.itemsPerPage) - this.offset;

      if(!_.inRange(e.pageStart, rangeStart - 1, rangeStop + 1)
        || !_.inRange(e.pageStop, rangeStart - 1, rangeStop + 1)
        || start < 0) {
        // page out of range
        let offset = e.pageStart;
        const lastOffset = (e.itemsLength - this.store.getters.queryMaxResults) + 1;
        // check for near end of results set
        if(lastOffset > 0 && this.offset - e.itemsPerPage > lastOffset) {
          offset = lastOffset;
        }
        this.query({ page: e.page, offset: offset });
      }
    },
    sortHandler: function() {
      this.query({
        page: 1,
        offset: 0,
        sortBy: this.orderBy,
        sortDesc: this.sortDesc
      });
    },
    searchHandler: function() {
      if(this.items.length !== this.queryTotalCount && !this.reloading) {
        this.options.page = 1;
        this.query({
          page: 1,
          offset: 0,
          searchColumn: this.searchColumn,
          searchValue: this.search,
          sortBy: this.sortBy
        });
      }
    },
    exportHandler: async function(type) {
      const queryObject = this.getQueryObject({
        page: 1,
        offset: 0,
        searchColumn: this.searchColumn,
        searchValue: this.search,
        sortBy: this.sortBy,
        exportType: type
      });
      if(this.pageFunc) {
        try {
          return await this.pageFunc(queryObject);
        } catch(error) {
          console.error(`error: ${error}`);
          this.showAlert('error', 'Export failed.');
          return null;
        }
      } else {
        return new Promise((resolve, reject) => {
          const queryAction = this.getQueryAction();
          queryObject.exportType = type;
          if(queryAction) {
            axiosHelper.post(queryAction.actiondata.url, queryObject)
              .then((response) => {
                resolve(response.data);
              })
              .catch((err) => {
                this.showAlert('error', 'Export failed.');
                reject(err);
              });
          } else {
            reject();
          }
        });
      }
    },
    query: function(obj) {
      if(this.search && this.search.length > 0 && this.searchColumn === undefined) {
        this.showAlert('error', 'Search column must be selected for large result sets.');
        return;
      }

      // console.log('********** query **********');
      const queryObject = this.getQueryObject(obj);

      if(this.pageFunc) {
        this.reloading = true;
        this.pageFunc(queryObject)
          .then((response) => {
            if(response.data) {
              Vue.set(this, 'results', response.data);
            } else {
              Vue.set(this, 'results', response.results);
            }
            this.offset = queryObject.offset;
          })
          .catch((error) => {
            console.error(`error: ${error}`);
            this.showAlert('error', 'Query failed.');
          })
          .finally(() => {
            this.reloading = false;
          });
      } else {
        const queryAction = this.getQueryAction();
        if(queryAction) {
          this.reloading = true;
          axiosHelper.post(queryAction.actiondata.url, queryObject)
            .then((response) => {
              Vue.set(this, 'results', response.data.data);
              this.offset = queryObject.offset;
            })
            .catch(() => {
              this.showAlert('error', 'Paging failed.');
            })
            .finally(() => {
              this.reloading = false;
            });
        }
      }
    },
    getQueryAction: function() {
      const pageActions = this.store.getters.pageActions;
      return _.find(pageActions, action => action.eventname === 'load' && action.actionname === 'query');
    },
    getQueryObject: function(obj) {
      const queryObject = {
        page: obj.page,
        offset: obj.offset,
        exportType: obj.exportType,
        searchValue: this.search && this.search.length > 0 ? this.search : undefined
      };
      if(this.searchColumn) {
        const fnd = _.find(this.headers, it => it.value === this.searchColumn);
        if(fnd) {
          if(fnd.tablename && fnd.columnname) {
            queryObject.searchColumn = `${fnd.tablename}.${fnd.columnname}`;
            queryObject.searchColumnId = fnd.id;
          } else {
            queryObject.searchColumn = fnd.value;
          }
        }
      }
      if(this.orderBy && this.orderBy.length > 0) {
        const fnd = _.find(this.headers, it => it.value === this.orderBy[0]);
        if(fnd) {
          if(fnd.tablename && fnd.columnname) {
            queryObject.sortBy = `${fnd.tablename}.${fnd.columnname}`;
          } else {
            queryObject.sortBy = fnd.value;
          }
          queryObject.sortById = fnd.id;
          queryObject.sortDesc = (this.sortDesc && this.sortDesc.length > 0 ? this.sortDesc[0] : false);
        }
      }
      return queryObject;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  .results-table /deep/ table.v-table tbody td
    height 32px

  .search-text
    padding-top 0
    margin-top -16px
</style>
