<template>
  <div>
    <div class="menutree">
      <h1>Menu Tree</h1>
      <menu-tree
        disableSystem="false"
      ></menu-tree>
    </div>
  </div>
</template>

<script>
  import MenuTree from '../component/MenuTree.vue';

  export default {
    data() {
      return {
      };
    },
    components: {
      MenuTree
    },
    methods: {
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
