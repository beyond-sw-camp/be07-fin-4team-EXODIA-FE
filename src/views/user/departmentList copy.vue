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

    <!-- 부서 상세 조회 모달 -->
<v-dialog v-model="detailedViewDialog" max-width="90%" max-height="90vh">
  <v-card>
    <v-card-title>
      <span class="headline">부서 구조 ({{ selectedDepartment.name }})</span>
    </v-card-title>
    <v-card-text class="scrollable-content">
      <div id="chart-container">
        <figure class="org-chart cf">
          <ul class="administration">
            <li>
              <ul class="director">
                <li>
                  <a href="#"><span>{{ selectedDepartment.name }}</span></a>
                  <ul class="subdirector">
                    <li v-for="(child, index) in selectedDepartment.children" :key="index">
                      <a href="#"><span>{{ child.name }}</span></a>
                    </li>
                  </ul>
                  <ul class="departments cf">
                    <li v-for="(dept, index) in selectedDepartment.children" :key="index" class="department dep-a">
                      <a href="#"><span>{{ dept.name }}</span></a>
                      <ul class="sections">
                        <li v-for="(subDept, subIndex) in dept.children" :key="subIndex" class="section">
                          <a href="#"><span>{{ subDept.name }}</span></a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </figure>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn
        class="v-close"
        text
        @click="detailedViewDialog = false"
      >
        닫기
      </v-btn>

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
    // this.buildPyramidStructure(department);
    this.detailedViewDialog = true;
  },
  // buildPyramidStructure(department) {
  //   let levels = [];
  //   const buildLevel = (dept, depth = 0) => {
  //     if (!levels[depth]) levels[depth] = [];
  //     levels[depth].push(dept);
  //     if (dept.children && dept.children.length) {
  //       dept.children.forEach(child => buildLevel(child, depth + 1));
  //     }
  //   };
  //   buildLevel(department);
  //   this.departmentLevels = levels;
  // },
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
#chart-container {
  font-family: Arial, sans-serif;
  height: 420px;
  border: 2px dashed #aaa;
  border-radius: 5px;
  overflow: auto;
  text-align: center;
}

.org-chart {
  background: white;
}

.scrollable-content {
  max-height: 80vh;
  overflow-y: auto;
}

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

/* 부서 트리 스타일 */
* {
  box-sizing: border-box;
  position: relative;
}

.cf:before,
.cf:after {
  content: " ";
  display: table;
}

.cf:after {
  clear: both;
}

.cf {
  zoom: 1;
}

.content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

ul a {
  display: block;
  background: #ccc;
  border: 4px solid #fff;
  text-align: center;
  overflow: hidden;
  font-size: .7em;
  text-decoration: none;
  font-weight: bold;
  color: #333;
  height: 70px;
  margin-bottom: -26px;
  box-shadow: 4px 4px 9px -4px rgba(0, 0, 0, 0.4);
  transition: all linear .1s;
}

ul a span {
  display: block;
  margin-top: -0.7em;
}

ul.director{
  display: flex;
  justify-content: center;
}

ul.departments {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

li {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.administration > li > a {
  margin-bottom: 25px;
}

.director > li > a {
  width: 50%;
  margin: 0 auto;
}

.subdirector:after {
  content: "";
  display: block;
  width: 0;
  height: 130px;
  border-left: 4px solid #fff;
  left: 45.45%;
  position: relative;
}

.subdirector,
.departments {
  position: absolute;
  width: 100%;
}

.subdirector > li:first-child,
.departments > li:first-child {
  width: 18.6%;
  height: 64px;
  margin: 0 auto 92px auto;
  padding-top: 25px;
  border-bottom: 4px solid white;
}

.subdirector > li:first-child {
  float: right;
  right: 27.2%;
  border-left: 4px solid white;
}

.departments > li:first-child {
  float: left;
  left: 27.2%;
  border-right: 4px solid white;
}

.subdirector > li:first-child a,
.departments > li:first-child a {
  width: 100%;
}

.subdirector > li:first-child a {
  left: 25px;
}

.departments > li:first-child a {
  right: 25px;
}

.department {
  border-left: 4px solid #fff;
  width: 18.6%;
  float: left;
  margin-left: 7%;
  margin-bottom: 60px;
}

.department > a {
  margin: 0 0 -26px -4px;
}

ul.sections li.section a {
  background: #38aae1;
  color: #fff;
  text-transform: uppercase;
  border: 0;
}

.department li a {
  background: #fff;
  top: 48px;
  position: absolute;
  z-index: 1;
  width: 90%;
  height: 60px;
  vertical-align: middle;
  right: -1px;
}

.department li a:hover {
  box-shadow: 8px 8px 9px -4px rgba(0, 0, 0, 0.1);
  height: 80px;
  width: 95%;
  top: 39px;
}

/* 부서 색상 */
.department.dep-a a{ background: #FFD600; }
.department.dep-b a{ background: #AAD4E7; }
.department.dep-c a{ background: #FDB0FD; }
.department.dep-d a{ background: #A3A2A2; }
.department.dep-e a{ background: #f0f0f0; }

.scrollable-content {
  max-height: 80vh;
  overflow-y: auto;
}

</style>