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
        <v-menu offset-y bottom :close-on-content-click="true" open-on-hover>
          <template v-slot:activator="{ on }">
            <v-btn text v-on="on">Export<v-icon small>arrow_drop_down</v-icon></v-btn>
          </template>
          <v-list>
            <v-list-item @click="pdf">
              <div class="btn">PDF</div>
            </v-list-item>
            <v-list-item>
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
            <v-list-item>
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
            <v-list-item @click="clipboard">
              <div class="btn">Clipboard</div>
            </v-list-item>
            <v-list-item @click="print">
              <div class="btn">Print</div>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-progress-circular
          v-if="downloadingFlag"
          indeterminate
          color="primary"
        ></v-progress-circular>
        <v-spacer></v-spacer>
        <div style="margin-right: 10px">
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
        :headers="calcHeaders"
        :items="items"
        :search="search"
        :custom-filter="customFilter"
        class="results-table elevation-1"
        item-key="id"
        :items-per-page="itemsPerPage"
        :sort-by="sortBy"
        dense
      >
        <!-- Rows -->
        <template v-slot:item="{ item }">
          <tr>
            <td v-if="showActions()">
              <v-icon v-if="actions.edit" small class="mr-2" @click="$emit('edit-item', item)">edit</v-icon>
              <v-icon v-if="actions.delete" small @click="handleDelete(item)">delete</v-icon>
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
          <v-btn color="primary" @click="initialize">Reset</v-btn>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import DownloadExcel from 'vue-json-excel';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const _ = require('lodash');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default {
  name: 'DataTable',
  components: {
    'download-excel': DownloadExcel
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
      default: () => ['name']
    }
  },
  data() {
    return {
      downloadingFlag: false,
      search: '',
      searchColumn: undefined,
      dialog: false,
      deleteIndex: -1
    };
  },
  computed: {
    deleteName() {
      return (this.items && this.items[this.deleteIndex] ? this.items[this.deleteIndex][this.promptColumn] : '');
    },
    calcHeaders() {
      if(this.showActions()) {
        return _.concat([{ text: 'Actions', value: 'actions' },], this.headers);
      }
      return this.headers;
    }
  },
  beforeDestroy: function() {
    // console.log('*** beforeDestroy');
  },
  destroyed: function() {
    // console.log('*** destroyed');
  },
  methods: {
    initialize() {
      // console.log('------> initialize');
    },
    showActions: function() {
      return this.actions.edit || this.actions.delete;
    },
    fetchData: function() {
      // console.log('************ fetchData');
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
    pdf: function() {
      this.createPdf().download('datatable.pdf');
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

      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.log(`Copying text command was ${msg}`);
      } catch (err) {
        this.$store.dispatch('log', { level: 'error', data: `Unable to copy: ${err}` });
      }

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
      this.deleteIndex = this.items.indexOf(item);
      this.dialog = true;
    },
    deleteParentItem() {
      this.deleteItem(this.items[this.deleteIndex]);
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
