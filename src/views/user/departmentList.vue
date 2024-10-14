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
          <ul v-if="department.children && department.children.length" class="children-nodes">
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
              <ul v-if="child.children && child.children.length" class="children-nodes">
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
        // 업데이트 시 name도 함께 전송
        await axios.put(`/department/${this.draggedItem.id}`, {
          name: this.draggedItem.name, // 이름도 유지
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
.department-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
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
  overflow-y: auto;
  max-height: 100vh;
  transition: transform 0.3s ease;
}

.tree-shifted {
  transform: translateX(-350px);
}

.children-nodes {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap;
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

@media screen and (max-width: 768px) {
  .tree-wrapper {
    max-height: 100vh;
  }

  .user-list {
    width: 100%;
    height: 50vh;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }
}
</style>
