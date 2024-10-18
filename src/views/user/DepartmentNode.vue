<template>
    <li class="tree-node">
      <div
        :style="getNodeStyle(depth)"
        :draggable="editMode"
        @dragstart="$emit('drag-start', department)"
        @dragover.prevent
        @drop="$emit('drop', department)"
        @click="handleClick"
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
        const colors = ['#e3f2fd', '#bbdefb', '#90caf9'];
        const color = colors[depth % colors.length];
        return {
          cursor: this.editMode ? 'move' : 'pointer',
          backgroundColor: color,
          padding: '20px',
          margin: '20px 0',
          borderRadius: '15px',
          textAlign: 'center',
          border: '2px solid #64b5f6',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          width: '250px',
          minHeight: '50px',
          fontSize: '14px',
        };
      },
      getIconForDepth(depth) {
        const icons = {
          0: 'mdi-office-building',
          1: 'mdi-domain',
          2: 'mdi-account-group',
        };
        return icons[depth] || 'mdi-folder';
      },
      handleClick() {
        console.log('Clicked department ID:', this.department.id);
        this.$emit('fetch-users', this.department.id); // 클릭한 노드의 ID를 상위로 전달
      },
    },
  };
  </script>
  
  

<style scoped>
.tree-node {
  list-style: none;
  position: relative;
  margin-left: 40px;
  max-height: none;
}

.children-nodes {
  list-style-type: none;
  max-height: none;
  overflow: visible; 
  padding-left: 20px;
}

.node-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.node-content {
  font-size: 1rem;
  color: #333;
}

.node-actions {
  margin-top: 5px;
}

.node-actions v-btn {
  margin-left: 5px;
}
</style>
