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
        <li v-for="department in hierarchy" :key="department.id">
          <div
            class="tree-node"
            :style="getNodeStyle(department)"
            :draggable="editMode"
            @dragstart="dragStart(department)"
            @dragover.prevent
            @drop="drop(department)"
          >
            {{ department.name }}
            <button v-if="editMode" @click="deleteDepartment(department.id)">삭제</button>
          </div>
          <ul v-if="department.children && department.children.length">
            <li v-for="child in department.children" :key="child.id">
              <div
                class="tree-node"
                :style="getNodeStyle(child)"
                :draggable="editMode"
                @dragstart="dragStart(child)"
                @dragover.prevent
                @drop="drop(child)"
              >
                {{ child.name }}
                <button v-if="editMode" @click="deleteDepartment(child.id)">삭제</button>
              </div>
              <ul v-if="child.children && child.children.length">
                <li v-for="subChild in child.children" :key="subChild.id">
                  <div
                    class="tree-node"
                    :style="getNodeStyle(subChild)"
                    :draggable="editMode"
                    @dragstart="dragStart(subChild)"
                    @dragover.prevent
                    @drop="drop(subChild)"
                  >
                    {{ subChild.name }}
                    <button v-if="editMode" @click="deleteDepartment(subChild.id)">삭제</button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 부서 추가/수정 다이얼로그 -->
    <div v-if="dialog" class="dialog">
      <h3>{{ isEdit ? '부서 수정' : '부서 추가' }}</h3>
      <input v-model="departmentForm.name" placeholder="부서 이름" />
      <select v-model="departmentForm.parentId">
        <option v-for="option in parentOptions" :value="option.id" :key="option.id">
          {{ option.name }}
        </option>
      </select>
      <button @click="saveDepartment">{{ isEdit ? '수정' : '추가' }}</button>
      <button @click="closeDialog">취소</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      hierarchy: [], // 서버에서 받아온 부서 계층 데이터
      departmentForm: { id: null, name: "", parentId: null },
      parentOptions: [], // 부모 부서 선택 옵션
      dialog: false,
      isEdit: false,
      editMode: false,
      draggedItem: null, // 드래그 중인 항목
    };
  },
  methods: {
    async fetchHierarchy() {
      try {
        const response = await this.$axios.get("/department/hierarchy");
        this.hierarchy = response.data; 
        this.parentOptions = this.flattenHierarchy(this.hierarchy); 
      } catch (error) {
        console.error("Error fetching department hierarchy:", error);
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

    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.fetchHierarchy(); // 편집 모드 종료 시 계층 데이터 새로고침
      }
    },

    openCreateDialog() {
      this.isEdit = false; // 새로운 부서 추가 모드
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
    },

    dragStart(department) {
      this.draggedItem = department; // 드래그 중인 항목을 저장
    },

    drop(department) {
      if (this.draggedItem && this.draggedItem.id !== department.id) {
        const newParentId = department.id;

        // 드래그된 항목을 계층에서 제거
        this.removeDepartment(this.draggedItem.id);

        // 드래그된 항목의 parentId를 새로운 부모 ID로 설정
        this.draggedItem.parentId = newParentId;

        // 드래그된 항목을 새로운 부모 아래에 추가
        this.addDepartmentToHierarchy(this.draggedItem, department);

        // 변경 사항 저장
        this.saveAllChanges();

        // 드래그한 항목 초기화
        this.draggedItem = null;
      }
    },

    removeDepartment(departmentId) {
      this.hierarchy = this.hierarchy.filter(department => department.id !== departmentId);
      this.hierarchy.forEach(department => {
        if (department.children) {
          department.children = department.children.filter(child => child.id !== departmentId);
        }
      });
    },

    addDepartmentToHierarchy(department, newParent) {
      if (!newParent.children) {
        newParent.children = [];
      }
      newParent.children.push(department);
    },

    async saveAllChanges() {
      try {
        await this.$axios.post("/department/saveAll", this.hierarchy);
        alert("변경사항이 저장되었습니다.");
        this.fetchHierarchy(); // 저장 후 계층 데이터를 다시 불러옴
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    },

    getNodeStyle(department) {
      return {
        cursor: this.editMode ? 'move' : 'default',
        opacity: this.draggedItem && this.draggedItem.id === department.id ? 0.5 : 1,
      };
    },

    async saveDepartment() {
      try {
        if (this.isEdit) {
          // 수정 로직
        } else {
          // 추가 로직
          const response = await this.$axios.post("/department/add", this.departmentForm);
          this.hierarchy.push(response.data); // 추가된 부서 계층에 추가
        }
        this.closeDialog();
        this.fetchHierarchy(); // 변경 사항 반영
      } catch (error) {
        console.error("Error saving department:", error);
      }
    },

    deleteDepartment(departmentId) {
      // 삭제 로직
      this.removeDepartment(departmentId);
      this.saveAllChanges(); // 삭제 후 저장
    },
  },

  mounted() {
    this.fetchHierarchy(); // 컴포넌트가 마운트될 때 계층 데이터를 서버에서 불러옴
  },
};
</script>

<style scoped>
.department-container {
  margin: 20px;
}

.tree-container {
  padding: 20px;
}

.tree-node {
  padding: 10px;
  margin: 5px;
  background-color: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: inline-block;
  min-width: 150px;
  text-align: center;
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
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-group button:hover {
  background-color: #45a049;
}

.dialog {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}

.tree-node button {
  margin-left: 10px;
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px;
  cursor: pointer;
}

.tree-node button:hover {
  background-color: #ff0000;
}
</style>
