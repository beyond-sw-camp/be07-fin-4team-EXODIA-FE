<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <div class="button-group">
      <button v-if="editMode" @click="openCreateDialog">부서 추가</button>
      <button @click="toggleEditMode">{{ editMode ? '편집 완료' : '편집' }}</button>
      <button v-if="editMode" @click="cancelEdit">취소</button>
    </div>

    <!-- 트리 구조를 보여주는 UI -->
    <div class="tree-container">
      <ul>
        <li v-for="department in hierarchy" :key="department.id" class="tree-item">
          <div
            class="tree-node"
            :style="getNodeStyle(department, 0)"
            :draggable="editMode"
            @dragstart="dragStart(department)"
            @dragover.prevent
            @drop="drop(department)"
            @click="editMode ? openEditDialog(department) : fetchUsersByDepartment(department.id)"
          >
            {{ department.name || '이름 없음' }}
            <button v-if="editMode" @click.stop="deleteDepartment(department.id)">삭제</button>
          </div>
          <ul v-if="department.children && department.children.length">
            <li v-for="child in department.children" :key="child.id" class="tree-item">
              <div
                class="tree-node"
                :style="getNodeStyle(child, 1)"
                :draggable="editMode"
                @dragstart="dragStart(child)"
                @dragover.prevent
                @drop="drop(child)"
                @click="editMode ? openEditDialog(child) : fetchUsersByDepartment(child.id)"
              >
                {{ child.name || '이름 없음' }}
                <button v-if="editMode" @click.stop="deleteDepartment(child.id)">삭제</button>
              </div>
              <ul v-if="child.children && child.children.length">
                <li v-for="subChild in child.children" :key="subChild.id" class="tree-item">
                  <div
                    class="tree-node"
                    :style="getNodeStyle(subChild, 2)"
                    :draggable="editMode"
                    @dragstart="dragStart(subChild)"
                    @dragover.prevent
                    @drop="drop(subChild)"
                    @click="editMode ? openEditDialog(subChild) : fetchUsersByDepartment(subChild.id)"
                  >
                    {{ subChild.name || '이름 없음' }}
                    <button v-if="editMode" @click.stop="deleteDepartment(subChild.id)">삭제</button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 사용자 정보 표시 패널 -->
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
            item-text="name"
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
      hierarchy: [],
      users: [],
      defaultProfile: '/assets/default-profile.png', // 기본 프로필 이미지 경로
      departmentForm: { id: null, name: '', parentId: null },
      parentOptions: [],
      dialog: false,
      isEdit: false,
      editMode: false,
      draggedItem: null,
      positions: [], // 직급 리스트
    };
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
      return position ? position.name : '알 수 없음'; // 직급 이름을 찾아서 반환
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.fetchHierarchy(); // 편집 모드 종료 시 계층 데이터 새로고침
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
        this.draggedItem.parentId = parentDepartment.id;
        await axios.put(`/department/${this.draggedItem.id}`, {
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
    getNodeStyle(department, depth) {
      const colors = ['#ffeb3b', '#64b5f6', '#81c784'];
      const color = colors[depth % colors.length];
      return {
        cursor: this.editMode ? 'move' : 'pointer',
        opacity: this.draggedItem && this.draggedItem.id === department.id ? 0.5 : 1,
        backgroundColor: color,
        padding: '15px',
        margin: '10px',
        borderRadius: '10px',
        boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        position: 'relative',
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
.tree-item {
  position: relative;
}

.tree-container {
  padding: 20px;
}

.tree-item {
  position: relative;
}

.tree-item:before {
  content: '';
  position: absolute;
  top: 0;
  left: -20px;
  width: 1px;
  height: 100%;
  background: #ccc;
}

.tree-node {
  padding: 10px;
  margin: 5px;
  background-color: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: inline-block;
  min-width: 150px;
  text-align: center;
  position: relative;
}

ul {
  list-style-type: none;
  padding-left: 20px;
}

.button-group {
  margin-bottom: 20px;
}

.button-group button {
  margin-right: 10px;
  padding: 10px 15px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-group button:hover {
  background-color: #45a049;
}

.dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 300px;
}

.dialog-input,
.dialog-select {
  margin-bottom: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
}

.save-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 5px;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 5px;
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
