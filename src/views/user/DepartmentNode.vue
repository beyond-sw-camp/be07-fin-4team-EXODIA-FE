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
          <button @click.stop="$emit('edit-department', department)">편집</button>
          <button @click.stop="$emit('delete-department', department.id)">삭제</button>
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
        // 세련된 디자인을 위한 은은한 중립적 색상 및 테두리 추가
        const colors = ['#f2f2f2', '#e6e6e6', '#d9d9d9']; 
        const color = colors[depth % colors.length];
        return {
          cursor: this.editMode ? 'move' : 'pointer',
          backgroundColor: color,
          padding: '20px',
          margin: '20px 0',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #ccc',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          width: '180px', // 고정된 너비
          minHeight: '50px',
        };
      },
      getIconForDepth(depth) {
        const icons = ['mdi-office-building', 'mdi-domain', 'mdi-account-group'];
        return icons[depth % icons.length]; // 각 depth별로 다른 아이콘 제공
      },
    },
  };
  </script>
  
  <style scoped>
  .tree-node {
    list-style: none;
    position: relative;
    margin-left: 40px;
  }
  
  .children-nodes {
    list-style-type: none;
    padding-left: 40px;
    display: block; /* 자식 노드를 세로로 정렬 */
  }
  
  .tree-node::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    width: 2px;
    height: 20px;
    background-color: #b0b0b0;
  }
  
  .tree-node::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    width: 2px;
    height: 20px;
    background-color: #b0b0b0;
  }
  
  .node-content {
    font-size: 1rem;
    color: #333;
  }
  
  .node-icon {
    margin-right: 8px;
    vertical-align: middle;
  }
  
  .node-actions {
    margin-top: 10px;
  }
  
  .node-actions button {
    margin-left: 5px;
    background-color: #f0f0f0;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .node-actions button:hover {
    background-color: #e0e0e0;
  }
  </style>
  