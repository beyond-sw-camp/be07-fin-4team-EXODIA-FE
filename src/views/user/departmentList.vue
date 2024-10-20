<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <div class="button-group">
      <v-btn v-if="editMode" @click="openCreateDialog" color="primary">부서 추가</v-btn>
      <v-btn @click="toggleEditMode" color="success">{{ editMode ? '편집 완료' : '편집' }}</v-btn>
      <v-btn v-if="editMode" @click="cancelEdit" color="error">취소</v-btn>
    </div>

    <div class="content-container">
      <div class="tree-container">
        <!-- Recursively Render Departments -->
        <v-card v-for="department in topLevelDepartments" :key="department.id" class="mb-4 tree-card">
          <DepartmentNode
            :department="department"
            :depth="0"
            :editMode="editMode"
            @fetch-users="fetchUsersByDepartment"
            @drag-start="dragStart"
            @drop="drop"
            @open-edit-dialog="openEditDialog"
          />
        </v-card>
      </div>

      <div class="user-box">
        <h3>{{ selectedDepartmentName }}</h3>
        <div v-if="users.length === 0" class="no-users">
          <v-alert type="info" color="blue lighten-4">해당 부서에 소속된 사용자가 없습니다.</v-alert>
        </div>
        <div v-else class="user-grid">
          <v-card v-for="user in users" :key="user.userNum" class="user-card">
            <img :src="user.profileImage || defaultProfile" alt="profile" class="user-profile" />
            <p class="user-name">{{ user.name }}</p>
            <p>사번: {{ user.userNum }}</p>
            <p>직급: {{ getPositionName(user.positionId) }}</p>
          </v-card>
        </div>
      </div>
      
    </div>

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
import DepartmentNode from './DepartmentNode.vue'; // Recursive child component

export default {
  components: { DepartmentNode },
  data() {
    return {
      hierarchy: [], // Department hierarchy data
      users: [], // User list data
      defaultProfile: '/assets/default-profile.png', // Default profile image
      departmentForm: { id: null, name: '', parentId: null }, // Department form data for add/edit
      parentOptions: [], // Parent department options
      dialog: false, // Dialog visibility
      isEdit: false, // Edit mode flag
      editMode: false, // Toggle edit mode
      draggedItem: null, // Dragging department reference
      positions: [], // Positions list
      selectedDepartmentName: '' // Selected department name
    };
  },
  computed: {
    topLevelDepartments() {
      return this.hierarchy.filter(department => !department.parentId);
    }
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

    async fetchUsersByDepartment(departmentId) {4
      console.log("Fetching users for department:", departmentId); 
  try {
    const response = await axios.get(`/department/${departmentId}/users`);
    this.users = response.data;
    this.selectedDepartmentName = this.findDepartmentName(this.hierarchy, departmentId) || '부서 없음';
  } catch (error) {
    console.error('Error fetching users for department:', error);
  }
}

,
    findDepartmentName(departmentList, id) {
      for (const department of departmentList) {
        if (department.id === id) return department.name;
        if (department.children) {
          const found = this.findDepartmentName(department.children, id);
          if (found) return found;
        }
      }
      return null;
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
      const position = this.positions.find(pos => pos.id === positionId);
      return position ? position.name : '알 수 없음';
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) this.fetchHierarchy();
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
    cancelEdit() {
      this.editMode = false;
      this.fetchHierarchy();
    },
    dragStart(department) {
      this.draggedItem = department;
    },
    async drop(parentDepartment) {
    if (this.draggedItem && this.draggedItem.id !== parentDepartment.id) {
      // parentId 업데이트
      this.draggedItem.parentId = parentDepartment.id;

        try {
          await axios.put(`/department/${this.draggedItem.id}`, {
            name: this.draggedItem.name,
            parentId: parentDepartment.id,
          });
          this.fetchHierarchy(); // 계층 구조 다시 불러오기
          
          // 드래그가 완료된 후, 선택된 부서로부터 사용자 목록 가져오기
          this.fetchUsersByDepartment(parentDepartment.id);
        } catch (error) {
          console.error('Error updating department hierarchy:', error);
        }
      }
    },
    isCircular(department, childId) {
      if (!department.children) return false;
      for (const child of department.children) {
        if (child.id === childId || this.isCircular(child, childId)) {
          return true;
        }
      }
      return false;
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
    }
  },
  mounted() {
    this.fetchHierarchy();
    this.fetchPositions();
  }
};
</script>
<style scoped>
.department-container {
  padding: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.content-container {
  display: flex;
  flex-direction: column;
  height: auto; 
  justify-content: flex-start;
}

.tree-container {
  width: 50%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: visible; 
}

.tree-card {
  margin-right: 20px;
  height: auto;
  flex-grow: 1;
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
  overflow: visible;
  max-height: none;
}

.tree-node::before {
  content: '';
  position: absolute;
  left: -15px;
  top: 50%;
  width: 15px;
  height: 1px;
  background-color: #ccc;
}

.tree-node::after {
  content: '';
  position: absolute;
  left: -15px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #ccc;
}

.tree-item:first-child .tree-node::after {
  top: 50%;
}

.tree-item:last-child .tree-node::after {
  bottom: 50%;
}

.user-box {
  position: fixed;
  padding: 20px;
  background-color: #f8f9fa;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  width: 28%;    
  height: 50%;
  border-radius: 5%; 
  bottom: 10%; 
  right: 10%;   
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.user-card {
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  flex-direction: column;
}

.user-profile {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.no-users {
  color: #1565c0;
  background-color: #e3f2fd;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}
</style>
