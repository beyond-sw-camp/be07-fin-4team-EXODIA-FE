<template>
  <v-container>
    <h1 class="header">부서 관리</h1>

    <div class="button-group">
      <v-btn v-if="editMode" @click="openCreateDialog" color="primary" elevation="2" class="custom-btn">
        <v-icon left>mdi-plus</v-icon> 부서 추가
      </v-btn>
      <v-btn @click="toggleEditMode" :color="editMode ? 'success' : 'primary'" elevation="2" class="custom-btn">
        <v-icon left>{{ editMode ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
        {{ editMode ? '편집 완료' : '편집' }}
      </v-btn>
      <v-btn v-if="editMode" @click="cancelEdit" color="error" elevation="2" class="custom-btn">
        <v-icon left>mdi-cancel</v-icon> 취소
      </v-btn>
    </div>

    <v-row>
      <v-col cols="8">
        <!-- 트리 구조를 보여주는 UI -->
        <div class="tree-container">
          <ul class="hierarchical-tree">
            <li v-for="department in hierarchy" :key="department.id">
              <div
                class="tree-node"
                :draggable="editMode"
                @dragstart="dragStart(department)"
                @dragover.prevent
                @drop="drop(department)"
                @click="!editMode && selectDepartment(department.id)"
              >
                <v-icon left>mdi-folder-outline</v-icon> {{ department.name }}
                <v-btn icon v-if="editMode" @click.stop="deleteDepartment(department.id)" small>
                  <v-icon color="error">mdi-delete</v-icon>
                </v-btn>
              </div>
              <ul v-if="department.children && department.children.length">
                <li v-for="child in department.children" :key="child.id">
                  <div
                    class="tree-node"
                    :draggable="editMode"
                    @dragstart="dragStart(child)"
                    @dragover.prevent
                    @drop="drop(child)"
                    @click="!editMode && selectDepartment(child.id)"
                  >
                    <v-icon left>mdi-folder-outline</v-icon> {{ child.name }}
                    <v-btn icon v-if="editMode" @click.stop="deleteDepartment(child.id)" small>
                      <v-icon color="error">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </v-col>

      <!-- 선택된 부서에 속한 사용자 목록을 표시하는 오른쪽 창 -->
      <v-navigation-drawer v-model="drawer" right temporary width="400">
        <h3>사용자 정보</h3>
        <v-list v-if="selectedUsers.length > 0">
          <v-list-item v-for="user in selectedUsers" :key="user.userNum" class="user-list-item">
            <v-list-item-avatar>
              <img :src="user.profileImage || '/default-profile.png'" alt="Profile Image"/>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ user.name }} ({{ user.userNum }})</v-list-item-title>
              <v-list-item-subtitle>{{ user.positionName }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info">선택된 부서에 속한 사용자가 없습니다.</v-alert>
      </v-navigation-drawer>
    </v-row>

    <!-- 부서 추가/수정 다이얼로그 -->
    <v-dialog v-model="dialog" persistent max-width="500px">
      <v-card>
        <v-card-title>{{ isEdit ? '부서 수정' : '부서 추가' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="departmentForm.name" label="부서 이름" required></v-text-field>
            <v-select
              v-model="departmentForm.parentId"
              :items="parentOptions"
              label="부모 부서 선택"
              item-text="name"
              item-value="id"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveDepartment">{{ isEdit ? '수정' : '추가' }}</v-btn>
          <v-btn color="red" @click="closeDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      hierarchy: [], // 부서 계층 데이터
      selectedUsers: [], // 선택된 부서의 사용자 리스트
      departmentForm: { id: null, name: "", parentId: null }, // 부서 추가 폼
      parentOptions: [], // 부모 부서 선택 옵션
      editMode: false,
      dialog: false, // 부서 추가/수정 다이얼로그 상태
      drawer: false, // 오른쪽 슬라이드 창 상태
      isEdit: false, // 수정 모드 상태
    };
  },
  methods: {
    async fetchHierarchy() {
      try {
        const response = await this.$axios.get("/department/hierarchy");
        this.hierarchy = response.data;
        this.parentOptions = this.flattenHierarchy(this.hierarchy);
      } catch (error) {
        console.error("부서 계층 데이터를 가져오는 중 오류:", error);
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

    async selectDepartment(departmentId) {
      try {
        const response = await this.$axios.get(`/department/${departmentId}/users`);
        this.selectedUsers = response.data;
        this.drawer = true; // 부서를 선택하면 drawer 열기
      } catch (error) {
        console.error("부서 사용자 목록을 가져오는 중 오류:", error);
      }
    },

    dragStart(department) {
      this.draggedItem = department; // 드래그 중인 항목 저장
    },

    drop(parentDepartment) {
      if (this.draggedItem && this.draggedItem.id !== parentDepartment.id) {
        this.draggedItem.parentId = parentDepartment.id;
        this.updateDepartmentParent(this.draggedItem.id, parentDepartment.id);
      }
    },

    async updateDepartmentParent(departmentId, newParentId) {
      try {
        await this.$axios.put(`/department/${departmentId}`, {
          name: this.draggedItem.name,
          parentId: newParentId,
        });
        this.fetchHierarchy(); // 계층 업데이트 후 새로고침
      } catch (error) {
        console.error("부서 부모 업데이트 중 오류:", error);
      }
    },

    openCreateDialog() {
      this.isEdit = false; // 부서 추가 모드
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
    },

    async saveDepartment() {
      try {
        if (this.isEdit) {
          await this.$axios.put(`/department/${this.departmentForm.id}`, {
            name: this.departmentForm.name,
            parentId: this.departmentForm.parentId,
          });
        } else {
          await this.$axios.post("/department", {
            name: this.departmentForm.name,
            parentId: this.departmentForm.parentId || null,
          });
        }
        this.dialog = false;
        this.fetchHierarchy();
      } catch (error) {
        console.error("부서 저장 중 오류:", error);
      }
    },

    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.fetchHierarchy(); // 편집 모드 해제 시 새로고침
      }
    },
  },

  mounted() {
    this.fetchHierarchy();
  },
};
</script>
<style scoped>
.department-container {
  margin: 20px;
}

.header {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.button-group {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.custom-btn {
  font-weight: bold;
}

.tree-container {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.hierarchical-tree ul {
  list-style-type: none;
  padding-left: 0;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  background-color: #e0f7fa;
  margin: 5px 0;
  cursor: pointer;
}

.user-list-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.v-avatar img {
  object-fit: cover;
}

.v-navigation-drawer {
  padding: 20px;
}
</style>
