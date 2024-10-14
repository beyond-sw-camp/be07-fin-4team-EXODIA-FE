<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <div class="button-group">
      <v-btn v-if="editMode" @click="openCreateDialog" color="primary">부서 추가</v-btn>
      <v-btn @click="toggleEditMode" color="success">{{ editMode ? '편집 완료' : '편집' }}</v-btn>
      <v-btn v-if="editMode" @click="cancelEdit" color="error">취소</v-btn>
    </div>

    <!-- 트리 구조 UI -->
    <div class="tree-container">
      <ul>
        <DepartmentNode
          v-for="department in hierarchy"
          :key="department.id"
          :department="department"
          :depth="0"
          :editMode="editMode"
          @drag-start="dragStart"
          @drop="drop"
          @edit-department="openEditDialog"
          @fetch-users="fetchUsersByDepartment"
        />
      </ul>
    </div>

    <!-- 사용자 리스트 패널 -->
    <transition name="slide-fade">
      <div class="user-list" v-if="users.length">
        <h3>사용자 정보</h3>
        <v-card v-for="user in users" :key="user.userNum" class="mb-3">
          <v-row>
            <v-col cols="4">
              <img :src="user.profileImage || defaultProfile" alt="profile" style="width:100%;" />
            </v-col>
            <v-col cols="8">
              <p>{{ user.name }}</p>
              <p>사번: {{ user.userNum }}</p>
              <p>직급: {{ getPositionName(user.positionId) }}</p>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </transition>

    <!-- 부서 추가/수정 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEdit ? '부서 수정' : '부서 추가' }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field label="부서명" v-model="departmentForm.name"></v-text-field>
          <v-select
            label="상위 부서"
            v-model="departmentForm.parentId"
            :items="parentOptions"
            item-title="name"
            item-value="id"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="saveDepartment">{{ isEdit ? '수정' : '추가' }}</v-btn>
          <v-btn color="red darken-1" text @click="closeDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import DepartmentNode from './DepartmentNode.vue'; // 부서 노드 컴포넌트

export default {
  data() {
    return {
      hierarchy: [],
      users: [],
      defaultProfile: '/assets/default-profile.png',
      departmentForm: { id: null, name: '', parentId: null },
      parentOptions: [],
      dialog: false,
      isEdit: false,
      editMode: false,
      draggedItem: null,
      positions: [],
    };
  },
  components: {
    DepartmentNode,
  },
  methods: {
    async fetchHierarchy() {
      try {
        const response = await axios.get('/department/hierarchy');
        this.hierarchy = response.data;
        this.parentOptions = this.flattenHierarchy(this.hierarchy);
      } catch (error) {
        console.error('Error fetching department hierarchy:', error);
      }
    },
    flattenHierarchy(departments) {
      const flat = [];
      const recurse = (dept) => {
        flat.push(dept);
        if (dept.children) {
          dept.children.forEach(recurse);
        }
      };
      departments.forEach(recurse);
      return flat;
    },
    async fetchUsersByDepartment(departmentId) {
      try {
        const response = await axios.get(`/department/${departmentId}/users`);
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users for department:', error);
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get('/positions');
        this.positions = response.data;
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    },
    getPositionName(positionId) {
      const position = this.positions.find((pos) => pos.id === positionId);
      return position ? position.name : '알 수 없음';
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.fetchHierarchy();
      }
    },
    openCreateDialog() {
      this.isEdit = false;
      this.departmentForm = { id: null, name: '', parentId: null };
      this.dialog = true;
    },
    openEditDialog(department) {
      this.isEdit = true;
      this.departmentForm = { id: department.id, name: department.name, parentId: department.parentId || null };
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    dragStart(department) {
      this.draggedItem = department;
    },
    async drop(parentDepartment) {
      if (this.draggedItem && this.draggedItem.id !== parentDepartment.id) {
        await axios.put(`/department/${this.draggedItem.id}`, {
          name: this.draggedItem.name,
          parentId: parentDepartment.id
        });
        this.fetchHierarchy();
      }
    },
    async saveDepartment() {
      try {
        if (this.isEdit) {
          await axios.put(`/department/${this.departmentForm.id}`, {
            name: this.departmentForm.name,
            parentId: this.departmentForm.parentId,
          });
        } else {
          const response = await axios.post('/department', {
            name: this.departmentForm.name,
            parentId: this.departmentForm.parentId || null,
          });
          this.hierarchy.push(response.data);
        }
        this.closeDialog();
        this.fetchHierarchy();
      } catch (error) {
        console.error('Error saving department:', error);
      }
    },
    async deleteDepartment(departmentId) {
      try {
        await axios.delete(`/department/${departmentId}`);
        this.fetchHierarchy();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    },
  },
  mounted() {
    this.fetchHierarchy();
    this.fetchPositions();
  },
};
</script>

<style scoped>
.tree-container {
  padding: 20px;
  margin: 0 auto;
}

.tree-node {
  display: inline-block;
  padding: 15px;
  margin: 10px;
  background-color: #f0f0f0;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.tree-node:hover {
  transform: scale(1.05);
}

.button-group {
  margin-bottom: 20px;
}

.user-list {
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 100%;
  background-color: #f5f5f5;
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
  overflow-y: auto;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease;
}
.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
