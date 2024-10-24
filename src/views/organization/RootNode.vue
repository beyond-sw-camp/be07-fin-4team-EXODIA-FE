<template>
    <ul>
      <li>
        <MemberNode v-if="node.nodeType === 'USER'" :node="node" />
        <DepartmentNode v-if="node.nodeType === 'DEPARTMENT'" :node="node" />
      </li>
    </ul>
  </template>
  
  <script>
  export default {
    props: {
      node: {
        type: Object,
        required: true,
      },
    },
  };
  </script>
  