<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <!-- 편집 모드 토글 및 부서 추가 버튼 -->
    <div class="button-group">
      <button v-if="editMode" @click="openCreateDialog">부서 추가</button>
      <button @click="toggleEditMode">{{ editMode ? '편집 완료' : '편집' }}</button>
      <button v-if="editMode" @click="cancelEdit">취소</button>
    </div>

    <!-- 부서 계층 트리 -->
    <div class="tree-container">
      <ul>
        <li v-for="department in hierarchy" :key="department.id" class="tree-item">
          <div class="tree-node" :style="getNodeStyle(department, 0)"
            :draggable="editMode"
            @dragstart="dragStart(department)"
            @dragover.prevent
            @drop="drop(department)"
            @click="editMode ? openEditDialog(department) : fetchUsersByDepartment(department.id)">
            <v-icon>mdi-office-building</v-icon> 
            {{ department.name || '이름 없음' }}
            <v-icon v-if="editMode" @click.stop="deleteDepartment(department.id)">mdi-delete</v-icon>
          </div>
          <ul v-if="department.children && department.children.length">
            <li v-for="child in department.children" :key="child.id" class="tree-item">
              <div class="tree-node" :style="getNodeStyle(child, 1)"
                :draggable="editMode"
                @dragstart="dragStart(child)"
                @dragover.prevent
                @drop="drop(child)"
                @click="editMode ? openEditDialog(child) : fetchUsersByDepartment(child.id)">
                <v-icon>mdi-arrow-right</v-icon>
                {{ child.name || '이름 없음' }}
                <v-icon v-if="editMode" @click.stop="deleteDepartment(child.id)">mdi-delete</v-icon>
              </div>
              <ul v-if="child.children && child.children.length">
                <li v-for="subChild in child.children" :key="subChild.id" class="tree-item">
                  <div class="tree-node" :style="getNodeStyle(subChild, 2)"
                    :draggable="editMode"
                    @dragstart="dragStart(subChild)"
                    @dragover.prevent
                    @drop="drop(subChild)"
                    @click="editMode ? openEditDialog(subChild) : fetchUsersByDepartment(subChild.id)">
                    <v-icon>mdi-subdirectory-arrow-right</v-icon>
                    {{ subChild.name || '이름 없음' }}
                    <v-icon v-if="editMode" @click.stop="deleteDepartment(subChild.id)">mdi-delete</v-icon>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 사용자 리스트 -->
    <transition name="slide-fade">
      <div class="user-list" v-if="users.length">
        <h3>사용자 정보</h3>
        <v-card v-for="user in users" :key="user.userNum" class="user-card mb-3">
          <v-row>
            <v-col cols="4">
              <img :src="getProfileImage(user.profileImage)" alt="profile" class="profile-image" />
            </v-col>
            <v-col cols="8" class="user-details">
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

export default {
  data() {
    return {
      hierarchy: [],
      users: [],
      defaultProfile: 'https://example.com/default-profile.png', // 기본 프로필 이미지
      departmentForm: { id: null, name: '', parentId: null },
      parentOptions: [],
      dialog: false,
      isEdit: false,
      editMode: false,
      draggedItem: null,
      positions: [],
    };
  },
  methods: {
    async fetchHierarchy() {
      try {
        const response = await axios.get('/department/hierarchy');
        this.hierarchy = response.data;
        this.parentOptions = this.flattenHierarchy(this.hierarchy);
      } catch (error) {
        console.error('부서 계층 구조를 가져오는 중 오류:', error);
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
        console.error('부서별 사용자 정보를 가져오는 중 오류:', error);
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get('/positions');
        this.positions = response.data;
      } catch (error) {
        console.error('직급 목록을 가져오는 중 오류 발생:', error);
      }
    },
    getPositionName(positionId) {
      const position = this.positions.find(pos => pos.id === positionId);
      return position ? position.name : '알 수 없음';
    },
    getProfileImage(profileImage) {
      return profileImage || this.defaultProfile;
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
        console.error('부서 저장 중 오류 발생:', error);
      }
    },
    async deleteDepartment(departmentId) {
      try {
        await axios.delete(`/department/${departmentId}`);
        this.fetchHierarchy();
      } catch (error) {
        console.error('부서 삭제 중 오류 발생:', error);
      }
    },
    getNodeStyle(department, depth) {
      const colors = ['#81d4fa', '#4fc3f7', '#0288d1'];
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
.user-card {
  max-width: 240px;
  margin: 10px;
  padding: 10px;
  border-radius: 12px;
  background-color: #fafafa;
  box-shadow: 3px 3px 12px rgba(0, 0, 0, 0.1);
}

.profile-image {
  width: 100%;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: 14px;
}

.tree-container {
  padding: 20px;
}

.tree-node {
  padding: 12px;
  margin: 5px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 12px;
  min-width: 180px;
  text-align: center;
  transition: background-color 0.3s;
}

.tree-node:hover {
  background-color: #e0e0e0;
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

.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
