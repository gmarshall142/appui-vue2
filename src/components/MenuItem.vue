<template>
  <v-list-item
    slot="activator"
    v-if="item.children.length === 0"
    :to="item.routingPath"
  >
    <v-list-item-action>
      <v-icon v-html="item.icon"></v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-subtitle v-if="submenu">{{ item.label }}</v-list-item-subtitle>
      <v-list-item-title v-else>{{ item.label }}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
  <v-list-group
    v-else
    :key="item.label"
    :group="String(item.id)"
    :sub-group="submenu"
    :value="false"
    no-action
  >
    <v-list-item slot="activator">
      <v-list-item-content>
        <v-list-item-title>{{ item.label }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <template v-for="(childItem, childIndex) in item.children">
      <menu-item :item="childItem" :index="childIndex" :submenu=true />
    </template>
  </v-list-group>
</template>

<script>
export default {
  name: 'MenuItem',
  props: ['item', 'index', 'submenu'],
  data() {
    return {};
  },
  computed: {
    path() {
      return '/about';
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
h3
  margin 40px 0 0

ul
  list-style-type none
  padding 0

li
  display inline-block
  margin 0 10px

a
  color #42b983
</style>
