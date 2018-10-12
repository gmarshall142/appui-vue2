<template>
  <div>
    <div class="menutree">
      <h1>Menu Tree</h1>
      <v-jstree :data="data" whole-row @item-click="itemClick" draggable></v-jstree>
    </div>
  </div>
</template>

<script>
  import VJstree from 'vue-jstree';

  export default {
    props: ['appid', 'pageid'],
    data() {
      return {
        data: [
          {
            text: 'Home'
          },
          {
            text: 'Dashboard'
          },
          {
            text: 'VTAMP',
            children: [
              {
                text: 'New Request'
              },
              {
                text: 'Active Requests'
              },
              {
                text: 'Simple Search'
              },
              {
                text: 'Reports',
                children: [
                  { text: 'VTAMP Ad-Hoc Report'},
                  { text: 'PBL Report'}
                ]
              },
              {
                text: 'Admin',
                children: [
                  { text: 'Settings'}
                ]
              },
            ]
          },
          {
            text: 'ECP'
          },
          {
            text: 'DCN'
          },
          {
            text: 'Project Tasks',
            children: [
              { text: 'Add Project Task'},
              { text: 'View Project Tasks'}
            ]
          },
          {
            text: 'Administration',
            children: [
              { text: 'Form Builder'},
              { text: 'Menu Maintenance', children: [{ text: 'Menu Maintenance' }, { text: 'Menu Tree' }] },
              { text: 'Contact Us', children: [{ text: 'Email Administrators' }, { text: 'Website Issues' }]}
            ]
          },
          {
            text: 'Support'
          },
          {
            text: 'Help'
          },
        ],
      };
    },
    components: {
      VJstree
    },
    methods: {
      itemClick (node) {
        console.log(node.model.text + ' clicked !')
      }
    }
  };

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
  h1
    margin 10px 0 0 20px
  div
    margin 20px 20px
</style>
