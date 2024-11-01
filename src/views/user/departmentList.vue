<template>
  <div class="department-container">
    <v-row class="mb-12" style="padding-left:30px">
      <!-- style="margin:40px 50px" -->
      <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle || '부서 관리' }}</h1>
    </v-row>

    <v-row justify="end" class="mb-4">
      <v-col class="d-flex justify-end">
        <v-btn v-create v-if="editMode" @click="openCreateDialog">부서 추가</v-btn>
        <v-btn v-list @click="toggleEditMode">{{ editMode ? '편집 완료' : '편집' }}</v-btn>
        <v-btn v-cancel v-if="editMode" @click="cancelEdit">취소</v-btn>
      </v-col>
    </v-row>

    <!-- <div class="button-group">
      <v-btn v-if="editMode" @click="openCreateDialog" class="primary-btn">부서 추가</v-btn>
      <v-btn @click="toggleEditMode" class="success-btn">{{ editMode ? '편집 완료' : '편집' }}</v-btn>
      <v-btn v-if="editMode" @click="cancelEdit" color="error">취소</v-btn>
    </div> -->

    <!-- :class="fileList.length > 0 ? 'chat-content-with-file' : 'chat-content'" id="messageContainer" -->
    <div class="content-container">
      <div class="tree-container">
        <v-card v-for="department in topLevelDepartments" :key="department.id" class="mb-4 tree-card">
          <DepartmentNode :department="department" :depth="0" :editMode="editMode" @fetch-users="fetchUsersByDepartment"
            @drag-start="dragStart" @drop="drop" @open-edit-dialog="openEditDialog"
            @delete-department="deleteDepartment" />
          <div v-if="!editMode" class="detailed-view-btn">
              <v-icon @click="showDetailedView(department)" >mdi-magnify</v-icon> <!-- 아이콘 변경 -->
          </div>
        </v-card>
      </div>

      <!-- 사용자 목록 -->
      <div class="user-box">
        <h3>{{ selectedDepartmentName }}</h3>
        <v-text-field label="이름 검색" v-model="searchQuery" @input="searchUsers" clearable
          class="search-box"></v-text-field>
        <div v-if="users.length === 0" class="no-users">
          <v-alert type="info" color="blue lighten-4">해당 부서에 소속된 사용자가 없습니다.</v-alert>
        </div>
        <div v-else class="user-grid">
          <v-card v-for="user in users" :key="user.userNum" class="user-card">
            <div class="user-card-content">
              <img :src="user.profileImage || defaultProfile" alt="profile" class="user-profile" />
              <div class="user-details">
                <p class="user-name">{{ user.name }}</p>
                <p>사번: {{ user.userNum }}</p>
                <p>직급: {{ getPositionName(user.positionId) }}</p>
              </div>
            </div>
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
          <v-select label="상위 부서" v-model="departmentForm.parentId" :items="parentOptions" item-title="name"
            item-value="id"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn 
            text 
            :class="isEdit ? 'v-edit' : 'v-save'" 
            @click="saveDepartment"
          >
            {{ isEdit ? '수정' : '추가' }}
          </v-btn>
        
          <v-btn v-cancel class="error-btn" text @click="closeDialog">취소</v-btn>
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
          <div class="container">
            <h1 class="level-1 rectangle">{{ selectedDepartment.name }}</h1>
            <ol class="level-2-wrapper">
              <li v-for="child in selectedDepartment.children" :key="child.id">
                <h2 class="level-2 rectangle">{{ child.name }}</h2>
                <ol class="level-3-wrapper">
                  <li v-for="subChild in child.children" :key="subChild.id">
                    <h3 class="level-3 rectangle">{{ subChild.name }}</h3>
                    <ol class="level-4-wrapper">
                      <li v-for="subSubChild in subChild.children" :key="subSubChild.id">
                        <h4 class="level-4 rectangle">{{ subSubChild.name }}</h4>
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>
            </ol>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn v-close text @click="detailedViewDialog = false">닫기</v-btn>
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
      detailedViewDialog: false, // Detailed view dialog visibility
      selectedDepartment: null, // Currently selected department
      isEdit: false, // Edit mode flag
      editMode: false, // Toggle edit mode
      draggedItem: null, // Dragging department reference
      positions: [], // Positions list
      selectedDepartmentName: '', // Selected department name
      searchQuery: '', // 검색 입력값
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
      this.detailedViewDialog = true;
    },
    async fetchUsersByDepartment(departmentId) {
      try {
        this.selectedDepartmentId = departmentId;
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

    async searchUsers() {
      if (!this.selectedDepartmentId) {
        console.error('No department selected');
        return;
      }
      try {
        const response = await axios.get(`/user/department/${this.selectedDepartmentId}/search`, {
          params: {
            searchQuery: this.searchQuery || '',
          },
        });
        this.users = response.data;
      } catch (error) {
        console.error('Error searching users:', error);
      }
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
        this.draggedItem.parentId = parentDepartment.id;
        try {
          await axios.put(`/department/${this.draggedItem.id}`, {
            name: this.draggedItem.name,
            parentId: parentDepartment.id,
          });
          this.fetchHierarchy();
        } catch (error) {
          console.error('Error updating department hierarchy:', error);
        }
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
  }
};
</script>

<style scoped>
.department-container {
  border-radius: 12px;
  padding: 20px;
}

.drawer-open {
  transition: margin-right 0.3s ease;
  margin-right: 200px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.v-btn {
  font-size: 16px;
  margin-right: 10px;
}

.primary-btn,
.success-btn,
.error-btn {
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
  padding-bottom: 100px;
  justify-content: flex-start;
}

.tree-container {
  width: 50%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-box {
  position: fixed;
  padding: 20px;
  background-color: #f8f9fa;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  width: 28%;
  height: 40%;
  /* max-height: fit-content; */
  border-radius: 10%;
  bottom: 15%;
  right: 10%;
}

.user-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  /* cursor: pointer; */
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.user-card-content {
  display: flex;
  align-items: center;
}

.user-profile {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
}


.user-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

/* 부서 구조 상세 조회 스타일 */
/* 부서 구조 상세 조회 스타일 */
/* 부서 구조 상세 조회 스타일 */
:root {
  --level-1: #a8d5ba;
  /* Pastel Green */
  --level-2: #f9d7a5;
  /* Pastel Yellow */
  --level-3: #a7c7e7;
  /* Pastel Blue */
  --level-4: #f7a8b8;
  /* Pastel Pink */
}

/* 노드 스타일 */
.rectangle {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  /* 노드 안의 글자 크기 */
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 120px;
  /* 가로 크기 축소 */
  height: 40px;
  /* 직사각형으로 만들기 위한 세로 크기 */
}

/* 숫자 제거 */
ol {
  list-style-type: none;
  /* 리스트에서 숫자 없애기 */
  padding-left: 0;
}

/* 레벨별 간격 조정 */
.level-1 {
  width: 20%;
  margin: 0 auto 50px;
  /* 위 아래 간격 */
  background-color: var(--level-1);
}

.level-2-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin-bottom: 50px;
  /* 위 아래 간격 */
}

.level-2 {
  width: 30%;
  margin: 0 auto 50px;
  /* 위 아래 간격 */
  background-color: var(--level-2);
}

.level-3-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
  width: 50%;
  margin: 0 auto 50px;
  /* 위 아래 간격 */
}

.level-3 {
  margin-bottom: 50px;
  /* 위 아래 간격 */
  background-color: var(--level-3);
}

.level-4-wrapper {
  width: 80%;
  margin-left: auto;
  position: relative;
}

.level-4 {
  background-color: var(--level-4);
  border-radius: 8px;
  margin-bottom: 50px;
  /* 위 아래 간격 */
}

/* 연결 선 제거 */
.level-1::before,
.level-2-wrapper::before,
.level-2::before,
.level-3-wrapper::before,
.level-4-wrapper::before {
  display: none;
}

/* 추가 스타일 */
.detailed-view-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.detailed-view-icon {
  font-size: 12px;
}
</style>
