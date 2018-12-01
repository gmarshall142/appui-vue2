<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>Please confirm the deletion of the item: {{deleteName}}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" flat @click.native="dialog = false; deleteParentItem()">Delete</v-btn>
          <v-btn color="green darken-1" flat @click.native="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card id="datatable-card">
      <v-card-title>
        {{formTitle}}
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        :pagination.sync="pagination"
        :search="search"
        :custom-filter="customFilter"
        class="elevation-1"
        item-key="id"
      >
        <template slot="headers" slot-scope="props">
          <th>Actions</th>
          <th
            v-for="header in props.headers"
            :key="header.text"
            :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
            @click="changeSort(header.value)"
          >
            <v-icon small>arrow_upward</v-icon>
            {{ header.text }}
          </th>
        </template>
        <template slot="items" slot-scope="props">
          <td class="justify-center layout px-0" style="padding-top: 16px">
            <v-icon small class="mr-2" @click="$emit('edit-item', props.item)">edit</v-icon>
            <v-icon small @click="handleDelete(props.item)">delete</v-icon>
          </td>
          <td
            v-for="header in headers"
            style="white-space: nowrap; max-width: 200px; overflow-x: hidden;"
          >
            <v-tooltip bottom>
              <span slot="activator">{{ props.item[header.value] }}</span>
              <span>{{ props.item[header.value] }}</span>
            </v-tooltip>
          </td>
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
  const _ = require('lodash/core');

  export default {
    name: 'MaintDataTable',
    props: ['formTitle', 'headers', 'items', 'deleteItem', 'submitItem', 'promptColumn'],
    data() {
      return {
        pagination: {
          sortBy: 'name',
          rowsPerPage: 10,
        },
        search: '',
        dialog: false,
        deleteIndex: -1,
      };
    },
    computed: {
      deleteName() {
        return (this.items && this.items[this.deleteIndex] ? this.items[this.deleteIndex][this.promptColumn] : '');
      }
    },
    mounted() {
      // this.fetchingForm = true;
      // // this.$store.dispatch('setFormioAppId', this.$route.params.appid);
      // // this.$store.dispatch('fetchForm', {appid: this.$route.params.appid, pageid: this.$route.params.pageid});
      // this.initializePage();
      console.log('mounted');
    },
    methods: {
      initialize() {
        console.log('------> initialize');
      },
      customFilter(items, search, filter) {
        const newSearch = search.toString().toLowerCase();
        if (newSearch === '') {
          return this.items;
        }
        return items.filter(it => {
          // TODO: make this simpler; key is to break out of lodash forEach when found
          const keys = _.keys(it);
          let fnd = false;
          _.forEach(keys, (key) => {
            if (it[key]) {
              const str = it[key].toString().toLowerCase();
              if (str.indexOf(newSearch) > -1) fnd = true;
            }
          });
          return fnd;
        });
      },
      changeSort(column) {
        if (this.pagination.sortBy === column) {
          this.pagination.descending = !this.pagination.descending;
        } else {
          this.pagination.sortBy = column;
          this.pagination.descending = false;
        }
      },
      handleDelete(item) {
        this.deleteIndex = this.items.indexOf(item);
        this.dialog = true;
      },
      deleteParentItem() {
        this.deleteItem(this.deleteIndex);
      },
    },
  };
</script>

