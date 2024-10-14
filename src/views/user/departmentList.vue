<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <!-- 버튼 그룹 -->
    <div class="button-group">
      <button v-if="editMode" @click="openCreateDialog" class="primary-btn">부서 추가</button>
      <button @click="toggleEditMode" class="secondary-btn">{{ editMode ? '편집 완료' : '편집' }}</button>
      <button v-if="editMode" @click="cancelEdit" class="cancel-btn">취소</button>
    </div>

    <!-- 트리 구조를 보여주는 UI -->
    <div class="tree-wrapper">
      <ul class="tree-root">
        <li v-for="department in hierarchy" :key="department.id" class="tree-item">
          <div
            class="tree-node"
            :style="getNodeStyle(department)"
            :draggable="editMode"
            @dragstart="dragStart(department)"
            @dragover.prevent
            @drop="drop(department)"
            @click="editMode ? openEditDialog(department) : fetchUsersByDepartment(department.id)"
          >
            <strong>{{ department.name || '이름 없음' }}</strong>
            <button v-if="editMode" class="delete-btn" @click.stop="deleteDepartment(department.id)">삭제</button>
          </div>
          <ul v-if="department.children && department.children.length" class="children-nodes">
            <li v-for="child in department.children" :key="child.id" class="tree-item">
              <div
                class="tree-node child-node"
                :style="getNodeStyle(child)"
                :draggable="editMode"
                @dragstart="dragStart(child)"
                @dragover.prevent
                @drop="drop(child)"
                @click="editMode ? openEditDialog(child) : fetchUsersByDepartment(child.id)"
              >
                - {{ child.name || '이름 없음' }}
                <button v-if="editMode" class="delete-btn" @click.stop="deleteDepartment(child.id)">삭제</button>
              </div>
              <!-- 자식의 자식들까지 처리 -->
              <ul v-if="child.children && child.children.length" class="children-nodes">
                <li v-for="subChild in child.children" :key="subChild.id" class="tree-item">
                  <div
                    class="tree-node"
                    :style="getNodeStyle(subChild)"
                    :draggable="editMode"
                    @dragstart="dragStart(subChild)"
                    @dragover.prevent
                    @drop="drop(subChild)"
                    @click="editMode ? openEditDialog(subChild) : fetchUsersByDepartment(subChild.id)"
                  >
                    -- {{ subChild.name || '이름 없음' }}
                    <button v-if="editMode" class="delete-btn" @click.stop="deleteDepartment(subChild.id)">삭제</button>
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
      defaultProfile: 'https://example.com/default-profile.png',
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
      const position = this.positions.find((pos) => pos.id === positionId);
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
    getNodeStyle(department) {
      return {
        padding: '15px 20px',
        margin: '10px',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        cursor: this.editMode ? 'move' : 'pointer',
        opacity: this.draggedItem && this.draggedItem.id === department.id ? 0.6 : 1,
        transition: 'all 0.3s ease',
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'center',
        display: 'inline-block',
        minWidth: '200px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
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
.department-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.button-group {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tree-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; /* 세로 스크롤 추가 */
  max-height: 80vh; /* 트리 최대 높이 제한 */
}

.children-nodes {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap; /* 자식 노드가 화면 너비를 넘으면 다음 줄로 내려가도록 */
}

.tree-item {
  list-style-type: none;
}

.tree-node {
  text-align: center;
}

.user-list {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background-color: #f8f9fa;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
}

.user-card {
  max-width: 200px;
  padding: 10px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.profile-image {
  width: 100%;
  border-radius: 50%;
}

.primary-btn,
.secondary-btn,
.cancel-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  margin-right: 10px;
  cursor: pointer;
}

.primary-btn {
  background-color: #28a745;
  color: white;
}

.secondary-btn {
  background-color: #007bff;
  color: white;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  margin-top: 10px;
}
</style>
