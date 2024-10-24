<template>
    <div>
      <div>
        <input type="checkbox" v-model="node.isChecked" @change="updateDepartmentSelection" />
        <span>{{ node.name }} ({{ node.userCount || 0 }})</span>
      </div>
      <NodeList v-if="isOpened" :tree="node.childrenList" />
    </div>
  </template>
  
  <script>
  import { useInitOrgChartStore } from '@/views/organization/organizationChart';
  import NodeList from './NodeList.vue';
  
  export default {
    components: { NodeList },
    props: {
      node: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        isOpened: false,
      };
    },
    methods: {
      updateDepartmentSelection() {
        const store = useInitOrgChartStore();
        store.updateSelectedUsersByDepartment(this.node, this.node.isChecked);
      },
    },
  };
  </script>
  