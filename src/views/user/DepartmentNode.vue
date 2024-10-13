<template>
    <li class="tree-node">
      <div
        :style="getNodeStyle(depth)"
        :draggable="editMode"
        @dragstart="$emit('drag-start', department)"
        @dragover.prevent
        @drop="$emit('drop', department)"
        @click="editMode ? $emit('edit-department', department) : $emit('fetch-users', department.id)"
      >
        {{ department.name || '이름 없음' }}
        <button v-if="editMode" @click.stop="$emit('edit-department', department)">편집</button>
        <button v-if="editMode" @click.stop="$emit('delete-department', department.id)">삭제</button>
      </div>
      <ul v-if="department.children && department.children.length">
        <DepartmentNode
          v-for="child in department.children"
          :key="child.id"
          :department="child"
          :depth="depth + 1"
          :editMode="editMode"
          @drag-start="$emit('drag-start', child)"
          @drop="$emit('drop', child)"
          @edit-department="$emit('edit-department', child)"
          @fetch-users="$emit('fetch-users', child.id)"
        />
      </ul>
    </li>
  </template>
  
  <script>
  export default {
    name: 'DepartmentNode',
    props: {
      department: Object,
      depth: Number,
      editMode: Boolean
    },
    methods: {
      getNodeStyle(depth) {
        const colors = ['#ffeb3b', '#64b5f6', '#81c784'];
        const color = colors[depth % colors.length];
        return {
          cursor: this.editMode ? 'move' : 'pointer',
          backgroundColor: color,
          padding: '10px',
          margin: '10px',
          borderRadius: '10px',
          textAlign: 'center',
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .tree-node {
    list-style: none;
  }
  </style>
  