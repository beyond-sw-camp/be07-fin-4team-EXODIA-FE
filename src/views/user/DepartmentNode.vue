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
        <v-icon :class="getIconForDepth(depth)" class="node-icon"></v-icon>
        <span class="node-content">{{ department.name || '이름 없음' }}</span>
        <div class="node-actions" v-if="editMode">
          <v-btn icon small @click.stop="$emit('edit-department', department)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click.stop="$emit('delete-department', department.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
      <ul v-if="department.children && department.children.length" class="children-nodes">
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
      editMode: Boolean,
    },
    methods: {
      getNodeStyle(depth) {
        const colors = ['#f3f4f6', '#e5e7eb', '#d1d5db']; // 세련된 그레이톤
        const color = colors[depth % colors.length];
        return {
          cursor: this.editMode ? 'move' : 'pointer',
          backgroundColor: color,
          padding: '10px 20px',
          margin: '10px 0',
          borderRadius: '8px',
          textAlign: 'left',
          border: '1px solid #d1d5db',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          width: '250px',
          position: 'relative',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
        };
      },
      getIconForDepth(depth) {
        const icons = ['mdi-office-building', 'mdi-domain', 'mdi-account-group', 'mdi-folder-open', 'mdi-account-supervisor'];
        return icons[depth % icons.length];
      },
    },
  };
  </script>
  
  <style scoped>
  .tree-node {
    list-style: none;
    margin-left: 30px;
    position: relative;
  }
  
  .children-nodes {
    list-style: none;
    padding-left: 20px;
    border-left: 2px solid #ccc; /* 부모-자식 간 연결 선 */
  }
  
  .node-icon {
    margin-right: 10px;
    vertical-align: middle;
    color: #4a90e2; /* 아이콘 색상 */
  }
  
  .node-content {
    flex-grow: 1;
    color: #2c3e50;
  }
  
  .node-actions v-btn {
    margin-left: 5px;
  }
  
  .node-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  </style>
  