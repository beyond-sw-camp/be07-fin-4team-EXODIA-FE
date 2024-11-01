<template>
    <div>
      <template v-for="node in tree" :key="node.id">
        <RootNode :node="node" />
      </template>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      tree: {
        type: Array,
        required: true,
      },
    },
  };
  </script>
  