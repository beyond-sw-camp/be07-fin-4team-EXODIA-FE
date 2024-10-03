<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <!-- 버튼들 -->
    <div class="button-group">
      <button @click="openCreateDialog">부서 추가</button>
      <button @click="toggleEditMode">{{ editMode ? '편집 완료' : '편집' }}</button>
      <button :disabled="!editMode || !isChanged" @click="saveAllChanges" class="save-button">변경 사항 저장</button>
    </div>

    <!-- 트리 구조 표시 -->
    <div class="pyramid-tree">
      <div v-for="(level, index) in levels" :key="index" class="tree-level">
        <div v-for="department in level" :key="department.id" class="tree-item">
          <div class="tree-node">
            {{ department.name }}
          </div>
          <!-- 세로 줄 표시 -->
          <div v-if="department.children && department.children.length" class="vertical-line"></div>
          <div v-if="department.children && department.children.length" class="sub-tree">
            <div v-for="child in department.children" :key="child.id" class="tree-item">
              <div class="tree-node">{{ child.name }}</div>
              <!-- 자식 노드를 부모 노드 아래에 정확하게 배치 -->
              <div v-if="child.children.length" class="vertical-line"></div>
            </div>
          </div>
        </div>
      </div>
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
      <button @click="dialog = false">취소</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      departments: [], // 전체 부서 리스트
      levels: [], // depth별 부서들을 가로로 배치
      draggedItem: null, // 드래그 중인 아이템
      departmentForm: {
        id: null,
        name: "",
        parentId: null,
      },
      parentOptions: [], // 부모 부서 선택 리스트
      dialog: false,
      isEdit: false,
      editMode: false, // 편집 모드 상태
      departmentBackup: [], // 변경 전 부서 데이터 백업
      isChanged: false, // 변경 사항 여부
    };
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await this.$axios.get("/department");
        this.departments = response.data.result;
        this.buildTree(); // 부서를 depth 별로 나눠서 가로로 표시할 준비
        this.parentOptions = this.departments; // 부모 부서 선택 리스트
        this.isChanged = false; // 변경 사항 초기화
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류 발생:", error);
      }
    },
    buildTree() {
      const map = {};
      this.levels = [];
      this.departments.forEach(department => {
        map[department.id] = { ...department, children: [] };
      });
      this.departments.forEach(department => {
        if (department.parentDepartment) {
          map[department.parentDepartment.id].children.push(map[department.id]);
        } else {
          if (!this.levels[0]) this.levels[0] = [];
          this.levels[0].push(map[department.id]);
        }
      });
      // depth에 따라 레벨별로 나누기
      const recursiveAddToLevel = (dept, level) => {
        if (!this.levels[level]) this.levels[level] = [];
        dept.children.forEach(child => {
          this.levels[level].push(child);
          recursiveAddToLevel(child, level + 1);
        });
      };
      this.levels[0].forEach(dept => recursiveAddToLevel(dept, 1));
    },
    dragStart(department) {
      if (this.editMode) {
        this.draggedItem = department;
      }
    },
    drop(department) {
      if (this.editMode && this.draggedItem.id !== department.id) {
        this.draggedItem.parentDepartment = department.id;
        this.isChanged = true; // 변경 사항 표시
        this.buildTree(); // 다시 트리 구조 빌드
      }
    },
    openCreateDialog() {
      this.isEdit = false;
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.departments = JSON.parse(JSON.stringify(this.departmentBackup)); // 복구
        this.buildTree();
        this.isChanged = false;
      } else {
        this.departmentBackup = JSON.parse(JSON.stringify(this.departments)); // 백업
      }
    },
    async saveDepartment() {
      if (this.isEdit) {
        await this.$axios.put(`/department/${this.departmentForm.id}`, {
          name: this.departmentForm.name,
          parentId: this.departmentForm.parentId,
        });
      } else {
        await this.$axios.post("/department", {
          name: this.departmentForm.name,
          parentId: this.departmentForm.parentId,
        });
      }
      this.dialog = false;
      this.fetchDepartments();
    },
    async saveAllChanges() {
      try {
        await this.$axios.post("/department/save", this.departments);
        alert("변경 사항이 저장되었습니다.");
        this.isChanged = false; // 변경 사항 초기화
      } catch (error) {
        console.error("변경 사항 저장 중 오류 발생:", error);
      }
    },
  },
  mounted() {
    this.fetchDepartments(); // 컴포넌트가 마운트되었을 때 부서 데이터를 불러옴
  },
};
</script>

<style scoped>
.department-container {
  margin: 20px;
}

.pyramid-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tree-level {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.tree-item {
  margin: 10px 20px;
  position: relative;
}

.tree-node {
  display: inline-block;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  cursor: default;
  transition: background-color 0.3s;
  min-width: 150px;
}

.tree-node:hover {
  background-color: #f1f1f1;
}

.vertical-line {
  position: absolute;
  left: 50%;
  top: 50%;
  height: 100%;
  width: 2px;
  background-color: #000;
}

.button-group {
  margin-bottom: 20px;
  text-align: center;
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

.save-button[disabled] {
  background-color: #ccc;
  cursor: not-allowed;
}

.dialog {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
</style>
