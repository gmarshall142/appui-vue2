<template>
  <div>
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn
          refs="saveButton"
          @click="saveMenu"
          :disabled="saveDisabled"
        >Save</v-btn>

        <v-spacer></v-spacer>

        <v-btn @click="setAllExpanded(true)" icon>
          <v-icon>expand</v-icon>
        </v-btn>
        <v-btn @click="setAllExpanded(false)" icon>
          <v-icon>compress</v-icon>
        </v-btn>
      </v-toolbar>

      <vue-tree-list
        ref="vueTreeList"
        :model="menuData"
        @click="onClick"
        @treechange="treeChange"
        default-tree-node-name="new node"
        default-leaf-node-name="new leaf"
      ></vue-tree-list>
    </v-card>
  </div>
</template>

<script>
  import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'
  import axios from 'axios';
  import Helper from '../../modules/helper';
  const _ = require('lodash');
  const helper = new Helper();

  export default {
    name: 'MenuTree',
    props: ['disableSystem', 'pageid'],
    data() {
      return {
        menuData: new Tree([]),
        systemDisabled: false,
        origMenuData: '',
        origRawData: {},
        saveDisabled: false,
        appcnt: 0,
        syscnt: 0,
        appPos: 3, // TODO: pull this information from service
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };
    },
    components: {
      VueTreeList
    },
    computed: {
      // saveDisabled() {
      //   return _.isEqual(this.menuData, this.origMenuData);
      //   // return false;
      // },
    },
    watch: {
    },
    mounted() {
      this.origMenuData = _.clone(this.menuData, true);
      this.initialize();
    },
    methods: {
      initialize() {
        if (this.disableSystem === 'true') this.systemDisabled = true;
        this.fetchRows();
      },
      fetchRows: function() {
        axios({
          method: 'get',
          url:`${this.$store.getters.serverUrl}/menus`,
        })
          .then((response) => {
            this.origRawData = helper.getDictFromArray(response.data, 'id', 'children');
            const nodes = this.getTreeNodes(response.data, 0);
            this.menuData = new Tree(nodes);
            this.origMenuData = _.cloneDeep(this.menuData);
            this.$nextTick(() => {
              this.initialTreeSetup();
            });
          })
          .catch((err) => {
            console.log(err.response.data);
          });
      },
      getTreeNodes: function(data, parentId) {
        const nodes = [];
        _.forEach(data, (it) => {
          const node = {
            name: it.label,
            id: it.id,
            pid: parentId,
            children: this.getTreeNodes(it.children, it.id),
            isSystem: false,
          };
          if (it.appid === 0) {
            node.isSystem = true;
            if (this.systemDisabled) {
              node.dragDisabled = true;
            }
          }
          if (it.pageid > 0) {
            node.isLeaf = true;
          }
          nodes.push(node);
        });
        return nodes;
      },
      initialTreeSetup: function() {
        this.setAllExpanded(false);
        this.setMouseOver();
        // const tree = this.$refs.vueTreeList;
        // this.initNodes(tree.$children, (node) => {
        //   const oldHandler = node.addChild;
        //   node.addChild = function (isLeaf) {
        //     console.log('addChild');
        //     oldHandler(isLeaf);
        //     this.$emit('treechange');
        //   };
        // });
      },
      initNodes: function(nodes, func) {
        _.forEach(nodes, (node) => {
          func(node);
          this.initNodes(node.$children, func);
        });
      },
      setAllExpanded(val) {
        const tree = this.$refs.vueTreeList;
        this.initNodes(tree.$children, (node) => {
          node.expanded = val;
        });
      },
      setMouseOver() {
        const tree = this.$refs.vueTreeList;
        this.initNodes(tree.$children, (node) => {
          if (node.model.isSystem) {
            node.mouseOver = this.mouseOver;
            node.drop = this.drop;
            node.dropUp = this.drop;
            node.dropBottom = this.drop;
          }
        });
      },
      onClick(model) {
        console.log(model)
      },
      mouseOver(e) {
        console.log('onMouseOver');
      },
      drop(e) {
        console.log('drop');
      },
      saveMenu() {
        if (!_.isEqual(this.menuData, this.origMenuData)) {
          this.syscnt = this.appcnt = 0;
          const rootData = this.getRawDataFromNode(this.menuData, 0);
          const newRawData = helper.getDictFromObject(rootData, 'id', 'children');
          const keys = _.toArray(_.mapValues(newRawData, 'id'));
          _.remove(keys, (it) => { return it === 0 }); // remove root

          const updateNodes = [];
          let   newNodes    = [];
          _.forEach(keys, (it) => {
            const newObj = newRawData[it];
            const oldObj = this.origRawData[it];
            const isEqual = _.isEqualWith(newObj, oldObj, (obj1, obj2) => {
              if (obj1 === undefined || obj2 === undefined) return false;
              return obj1.itemposition === obj2.itemposition && obj1.label === obj2.label;
            });
            if (!isEqual) {
              let parentId = newObj.parentid;
              if (parentId === 0) {
                if (it.isSystem) {
                  parentId = null;  // TODO: service should provide this
                } else {
                  parentId = this.appPos;
                }
              }
              if (oldObj === undefined) {
                newNodes.push({
                  id: newObj.id,
                  label: newObj.label,
                  itemposition: newObj.itemposition,
                  parentid: parentId,
                  oldSettings: { id: null },
                });
              } else {
                updateNodes.push({
                  id: newObj.id,
                  label: newObj.label,
                  itemposition: newObj.itemposition,
                  parentid: parentId,
                  oldSettings: {
                    id: oldObj.id,
                    label: oldObj.label,
                    position: oldObj.itemposition,
                    parentid: oldObj.parentid,
                  },
                });
              }
            }
          });
          newNodes = _.orderBy(newNodes, ['id'],['asc']);
          const deleteNodes = this.getDeletedNodes(newRawData);
          axios.all([this.menuAdd(newNodes), this.menuUpdate(updateNodes), this.menuDelete(deleteNodes)])
            .then(axios.spread( (addResult, updateResult, deleteResult) => {
              console.log(`addResult: ${addResult}`);
              console.log(`updateResult: ${updateResult}`);
              console.log(`deleteResult: ${deleteResult}`);
              this.fetchRows();
              this.$store.dispatch('fetchMenus');
            }));
        }
      },
      getRawDataFromNode(node, idx) {
        const children = [];
        _.forEach(node.children, (it, idx) => {
          children.push(this.getRawDataFromNode(it, idx));
        });
        // position
        let pos = idx + 1;
        if (node.pid === 0) {
          if (node.isSystem) {
            this.syscnt++;
            if (this.syscnt === this.appPos) {
              this.syscnt++; // bump syscnt past application position
            }
            pos = this.syscnt;
          } else {
            this.appcnt++;
            pos = this.appcnt;
          }
        }
        const rawItem = {
          label: node.name,
          id: node.id,
          parentid: node.pid,
          itemposition: pos,
          children: children,
        };
        return rawItem;
      },
      getDeletedNodes(rawData) {
        let   deleteNodes = [];
        const deleteDict  = {};

        _.forEach(this.origRawData, (it) => {
          const node = rawData[it.id];
          if (node === undefined) {
            const obj = {
              id: it.id,
              label: it.label,
              parentid: it.parentid,
            };
            deleteNodes.push(obj);
            deleteDict[it.id] = obj;
          }
        });
        deleteNodes = _.sortBy(deleteNodes, (it) => {
          let cnt = 0;
          let node = it;
          while ( (node = deleteDict[node.parentid]) !== undefined) {
            cnt--;
          }
          return cnt;
        });
        console.log('-------------- delete nodes:');
        _.forEach(deleteNodes, (it) => {
          console.log(JSON.stringify(it));
        });
        return deleteNodes;
      },
      menuAdd(data) {
        return axios.post(`${this.$store.getters.serverUrl}/menus/bulk`, data, this.headers);
      },
      menuUpdate(data) {
        return axios.put(`${this.$store.getters.serverUrl}/menus/bulk`, data, this.headers);
      },
      menuDelete(data) {
        return axios({
          method: 'delete',
          data: data,
          url: `${this.$store.getters.serverUrl}/menus/bulk`,
          headers: this.headers,
        });
      },
      treeChange() {
        console.log('treeChange');
      },
      getAppItems() {
        const items = [];
        _.filter(this.menuData.children, (it) => {
          const item = this.origRawData[it.id];
          if (item.parentid === this.appPos) {
            items.push(item);
          }
        });
        return items;
      },
      addApp(appObj) {
        appObj.position = getAppItems().length + 1;
        console.log(`addApp: ${JSON.stringify(appObj)}`);
      },
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
