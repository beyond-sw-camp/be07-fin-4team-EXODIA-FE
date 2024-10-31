<!-- src\views\user\DepartmentNode.vue -->

<template>
  <ul class="tree-root">
    <li class="tree-item">
      <details>
        <summary>
          <div class="tree-node" :style="getNodeStyle(depth)" :draggable="editMode" @dragstart="onDragStart(department)"
            @dragover.prevent @drop="onDrop(department)" @click="$emit('fetch-users', department.id)">
            <v-icon large>{{ getIconForDepth(depth) }}</v-icon>
            {{ department.name || '이름 없음' }}

            <!-- 삭제 및 수정 버튼 -->
            <v-icon v-if="editMode" color="black" style="font-size: 18px; padding-left:10px; padding-right: 13px" @click.stop="$emit('openEditDialog', department)">mdi-pencil</v-icon>
            <v-icon v-if="editMode" color="black" style="font-size: 18px;" @click.stop="onDeleteDepartment(department)">mdi-delete</v-icon>
          </div>
        </summary>

        <!-- 자식 노드를 재귀적으로 렌더링 -->
        <ul v-if="department.children && department.children.length" class="children-nodes">
          <tree-node v-for="child in department.children" :key="child.id" :department="child" :depth="depth + 1"
            :edit-mode="editMode" @fetch-users="$emit('fetch-users', $event)" @dragStart="onDragStart($event)"
            @drop="onDrop($event)" @openEditDialog="$emit('openEditDialog', $event)" />
        </ul>
      </details>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    department: Object,
    depth: Number,
    editMode: Boolean,
  },
  methods: {
    getNodeStyle(depth) {
      const colors = ['#e3f2fd', '#bbdefb', '#90caf9', '#6a95b8', '#4778a1'];
      return {
        backgroundColor: colors[depth % colors.length],
        padding: '15px 30px',
        margin: '10px 0',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        position: 'relative',
      };
    },
    getIconForDepth(depth) {
      const icons = ['mdi-domain', 'mdi-office-building', 'mdi-account-group', 'mdi-folder'];
      return icons[depth] || 'mdi-file';
    },
    onDragStart(department) {
      this.$emit('drag-start', department);
    },
    onDrop(department) {
      this.$emit('drop', department);
    },
    onDeleteDepartment(department) {
      if (confirm(`부서 '${department.name}'를 정말 삭제하시겠습니까?`)) {
        this.$emit('delete-department', department.id);
      }
    },
  },
};
</script>

<!-- 트리 구조에 연결선을 표시하지 않음 -->
<style scoped>
.tree-root {
  list-style-type: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.tree-item {
  position: relative;
}

.tree-node {
  position: relative;
  display: inline-block;
  margin: 15px 0;
  padding: 10px 30px;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  color: #333;
  text-align: center;
}

.children-nodes {
  list-style-type: none;
  padding-left: 40px;
}
</style>
