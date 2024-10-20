<template>
  <div class="department-container">
    <!-- 부서 관리 버튼 및 레이아웃 -->
    <h1>부서 관리</h1>
    <div class="button-group">
      <v-btn v-if="editMode" @click="openCreateDialog" class="primary-btn">부서 추가</v-btn>
      <v-btn @click="toggleEditMode" class="success-btn">{{ editMode ? '편집 완료' : '편집' }}</v-btn>
      <v-btn v-if="editMode" @click="cancelEdit" class="error-btn">취소</v-btn>
    </div>

    <div class="content-container">
      <div class="tree-container">
        <v-card v-for="department in topLevelDepartments" :key="department.id" class="mb-4 tree-card">
          <DepartmentNode
            :department="department"
            :depth="0"
            :editMode="editMode"
            @fetch-users="fetchUsersByDepartment"
            @drag-start="dragStart"
            @drop="drop"
            @open-edit-dialog="openEditDialog"
            @delete-department="deleteDepartment"
          />
          <div class="detailed-view-btn">
            <v-btn @click="showDetailedView(department)" icon>
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </div>
        </v-card>
      </div>

      <!-- 사용자 목록 -->
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
    <v-dialog v-model="dialog" max-width="500px">
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
          <v-btn class="success-btn" text @click="saveDepartment">{{ isEdit ? '수정' : '추가' }}</v-btn>
          <v-btn class="error-btn" text @click="closeDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="detailedViewDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">부서 구조 ({{ selectedDepartment.name }})</span>
        </v-card-title>
        <v-card-text>
          <div class="pyramid-container">
            <div v-for="(level, index) in departmentLevels" :key="index" class="pyramid-level">
              <div v-for="dept in level" :key="dept.id" class="pyramid-item">
                {{ dept.name }}
                <div v-if="index !== 0" class="pyramid-line"></div>
                <div v-if="level.length > 1" class="pyramid-lines"></div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="detailedViewDialog = false">닫기</v-btn>
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
      detailedViewDialog: false,
      selectedDepartment: null,
      departmentLevels: [], 
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

    showDetailedView(department) {
    this.selectedDepartment = department;
    this.buildPyramidStructure(department);
    this.detailedViewDialog = true;
  },
  buildPyramidStructure(department) {
    let levels = [];
    const buildLevel = (dept, depth = 0) => {
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(dept);
      if (dept.children && dept.children.length) {
        dept.children.forEach(child => buildLevel(child, depth + 1));
      }
    };
    buildLevel(department);
    this.departmentLevels = levels;
  },
  hasParent(dept) {
    return dept.parentId !== null;
  },
  // 자식이 있는지 체크
  hasChildren(dept) {
    return dept.children && dept.children.length > 0;
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
},
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
      console.log('Dragging department:', department);
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
  gap: 10px;
  margin-bottom: 20px;
}

.primary-btn, .success-btn, .error-btn {
  padding: 10px 15px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}

.primary-btn {
  background-color: #2196f3;
  color: white;
}

.success-btn {
  background-color: #4caf50;
  color: white;
}

.error-btn {
  background-color: #f44336;
  color: white;
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
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

.tree-node::before,
.tree-node::after {
  display: none;
}

.children-nodes {
  list-style-type: none;
  padding-left: 40px;
  overflow: visible;
  max-height: none;
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
  padding: 20px;
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

.detailed-view-btn {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* 자세히 보기 트리 구조 */
.pyramid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  position: relative;
}

.pyramid-level {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  position: relative;
}

.pyramid-item {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin: 0 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.pyramid-line {
  position: absolute;
  top: -30px; /* 부모와 자식을 연결하는 수직선 */
  left: 50%;
  width: 2px;
  height: 30px;
  background-color: #ccc;
}

.pyramid-lines {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: -30px;
  width: 100%;
  height: 2px;
  background-color: #ccc;
}

/* 부모 노드에는 수직선 제거 */
.pyramid-item:first-child .pyramid-line {
  display: none;
}

/* 자식 노드 간 수평 정렬 */
.pyramid-level .pyramid-item {
  margin: 0 20px;
}

/* 자식 노드 간 연결선 (수평선) */
.pyramid-lines::before,
.pyramid-lines::after {
  content: '';
  position: absolute;
  width: 50%;
  height: 2px;
  background-color: #ccc;
  top: -15px; /* 자식 간의 수평선 위치 조정 */
}

/* 수평선이 좌우로 펼쳐지게 조정 */
.pyramid-lines::before {
  left: -50%;
}

.pyramid-lines::after {
  right: -50%;
}

</style>
