<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <div class="button-group">
      <v-btn v-if="editMode" @click="openCreateDialog" color="primary">부서 추가</v-btn>
      <v-btn @click="toggleEditMode" color="success">{{ editMode ? '편집 완료' : '편집' }}</v-btn>
      <v-btn v-if="editMode" @click="cancelEdit" color="error">취소</v-btn>
    </div>

    <!-- 최상위 부서별로 트리 카드로 표시 -->
    <div class="tree-container">
      <v-card v-for="department in topLevelDepartments" :key="department.id" class="mb-3">
        <v-card-title>{{ department.name || '이름 없음' }}</v-card-title>
        <v-card-text>
          <ul class="tree-root">
            <li class="tree-item">
              <div
                class="tree-node"
                :style="getNodeStyle(0)"
                :draggable="editMode"
                @dragstart="dragStart(department)"
                @dragover.prevent
                @drop="drop(department)"
                @click="fetchUsersByDepartment(department.id)"
              >
                {{ department.name || '이름 없음' }}
                <v-btn v-if="editMode" icon @click.stop="openEditDialog(department)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
              <ul v-if="department.children && department.children.length" class="children-nodes">
                <li v-for="child in department.children" :key="child.id" class="tree-item">
                  <div
                    class="tree-node"
                    :style="getNodeStyle(1)"
                    :draggable="editMode"
                    @dragstart="dragStart(child)"
                    @dragover.prevent
                    @drop="drop(child)"
                    @click="fetchUsersByDepartment(child.id)"
                  >
                    {{ child.name || '이름 없음' }}
                    <v-btn v-if="editMode" icon @click.stop="openEditDialog(child)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </div>
                  <ul v-if="child.children && child.children.length" class="children-nodes">
                    <li v-for="subChild in child.children" :key="subChild.id" class="tree-item">
                      <div
                        class="tree-node"
                        :style="getNodeStyle(2)"
                        :draggable="editMode"
                        @dragstart="dragStart(subChild)"
                        @dragover.prevent
                        @drop="drop(subChild)"
                        @click="fetchUsersByDepartment(subChild.id)"
                      >
                        {{ subChild.name || '이름 없음' }}
                        <v-btn v-if="editMode" icon @click.stop="openEditDialog(subChild)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </v-card-text>
      </v-card>
    </div>

    <!-- 사용자 리스트 패널 -->
    <transition name="slide-fade">
      <div class="user-list" v-if="users.length">
        <h3>사용자 정보</h3>
        <v-card v-for="user in users" :key="user.userNum" class="user-card mb-3">
          <v-row>
            <v-col cols="4">
              <img :src="user.profileImage || defaultProfile" alt="profile" class="user-profile" />
            </v-col>
            <v-col cols="8" class="user-details">
              <p class="user-name">{{ user.name }}</p>
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

export default {
  data() {
    return {
      hierarchy: [], // 부서 계층 구조 데이터
      users: [], // 사용자 목록 데이터
      defaultProfile: '/assets/default-profile.png', // 기본 프로필 이미지
      departmentForm: { id: null, name: '', parentId: null }, // 부서 추가/수정 폼 데이터
      parentOptions: [], // 상위 부서 선택 옵션
      dialog: false, // 다이얼로그 표시 여부
      isEdit: false, // 수정 모드 여부
      editMode: false, // 편집 모드 여부
      draggedItem: null, // 드래그 중인 항목
      positions: [], // 직급 목록
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
      const position = this.positions.find(pos => pos.id === positionId);
      return position ? position.name : '알 수 없음';
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.fetchHierarchy(); // 편집 완료 후 다시 계층 구조 새로고침
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
    cancelEdit() {
      this.editMode = false;
      this.fetchHierarchy();
    },
    dragStart(department) {
      this.draggedItem = department;
    },
    async drop(parentDepartment) {
      if (this.draggedItem && this.draggedItem.id !== parentDepartment.id) {
        // Drag and drop 시, 부서명에 null이 들어가지 않도록 department 데이터를 제대로 업데이트
        this.draggedItem.parentId = parentDepartment.id;
        await axios.put(`/department/${this.draggedItem.id}`, {
          name: this.draggedItem.name,
          parentId: parentDepartment.id,
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
    getNodeStyle(depth) {
      const colors = ['#e3f2fd', '#bbdefb', '#90caf9'];
      return {
        backgroundColor: colors[depth % colors.length],
        padding: '10px 20px',
        margin: '10px 0',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      };
    },
  },
  mounted() {
    this.fetchHierarchy();
    this.fetchPositions();
  },
};
</script>

<style scoped>
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
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  color: #333;
  text-align: center;
}

.children-nodes {
  list-style-type: none;
  padding-left: 30px;
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

.button-group {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.user-card {
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  background-color: #ffffff;
  padding: 15px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-list {
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.user-profile {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
}

.user-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.user-details p {
  margin: 0;
  color: #666;
}

.user-list-enter-active, .user-list-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
