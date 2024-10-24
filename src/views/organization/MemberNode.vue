<template>
    <div>
      <input type="checkbox" v-model="isChecked" @change="updateUserSelection" />
      <span>{{ node.userName }} ({{ node.positionName }})</span>
    </div>
  </template>
  
  <script>
  import { useInitOrgChartStore } from '@/views/organization/organizationChart';
  
  export default {
    props: {
      node: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        isChecked: this.node.isChecked,
      };
    },
    methods: {
      updateUserSelection() {
        const store = useInitOrgChartStore();
        store.updateSelectedUser(this.node);
      },
    },
  };
  </script>
  