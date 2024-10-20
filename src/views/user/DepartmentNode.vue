<template>
  <v-card class="mb-4 tree-card">
    <v-card-title>{{ department.name || '이름 없음' }}</v-card-title>
    <v-card-text>
      <ul class="tree-root">
        <li class="tree-item">
          <details>
            <summary>
              <div
                class="tree-node"
                :style="getNodeStyle(depth)"
                :draggable="editMode"
                @dragstart="$emit('dragStart', department)"
                @dragover.prevent
                @drop="$emit('drop', department)"
                @click="$emit('fetch-users', department.id)" 
              >
                <v-icon large>{{ getIconForDepth(depth) }}</v-icon>
                {{ department.name || '이름 없음' }}
                <v-btn v-if="editMode" icon @click.stop="$emit('openEditDialog', department)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </summary>
            <ul v-if="department.children && department.children.length" class="children-nodes">
              <tree-node
                v-for="child in department.children"
                :key="child.id"
                :department="child"
                :depth="depth + 1"
                :edit-mode="editMode"
                @fetch-users="$emit('fetch-users', $event)" 
                @dragStart="$emit('dragStart', $event)"
                @drop="$emit('drop', $event)"
                @openEditDialog="$emit('openEditDialog', $event)"
              />
            </ul>
          </details>
        </li>
      </ul>
    </v-card-text>
  </v-card>
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
      };
    },
    getIconForDepth(depth) {
      const icons = ['mdi-domain', 'mdi-office-building', 'mdi-account-group', 'mdi-folder'];
      return icons[depth] || 'mdi-file';
    }
  }
}
</script>
<style scoped>
.tree-card {
  margin-right: 20px;
  height: auto;
}

.tree-root {
  list-style-type: none;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
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
