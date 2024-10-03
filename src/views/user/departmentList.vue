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
        </div>
      </div>

      <!-- 각 레벨 간 연결선 -->
      <div v-for="(level, index) in levelsWithChildren" :key="'line-' + index" class="line-group">
        <div v-for="(department, deptIndex) in level" :key="'line-' + index + '-' + deptIndex" class="line-item">
          <div class="horizontal-line"></div>
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
      departments: [], // 전체 부서 목록
      levels: [], // 계층화된 부서 리스트
      draggedItem: null, // 드래그된 아이템 저장
      departmentForm: {
        id: null,
        name: "",
        parentId: null,
      },
      parentOptions: [], // 상위 부서 선택 옵션
      dialog: false, // 다이얼로그 표시 여부
      isEdit: false, // 수정 모드 여부
      editMode: false, // 편집 모드 상태
      departmentBackup: [], // 편집 전 원본 데이터 저장
      isChanged: false, // 변경 사항 여부
    };
  },
  computed: {
    levelsWithChildren() {
      // 자식이 있는 레벨만 필터링하여 반환
      return this.levels.filter(level => level.some(department => department.children.length > 0));
    },
  },
  methods: {
    // 서버에서 부서 목록 불러오기
    async fetchDepartments() {
      try {
        const response = await this.$axios.get("/department");
        this.departments = response.data.result;
        this.buildTree(); 
        this.parentOptions = this.departments;
        this.isChanged = false;
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류 발생:", error);
      }
    },
    // 부서를 계층 구조로 빌드
    buildTree() {
      const map = {};
      const roots = [];

      // 모든 부서 객체를 맵으로 저장
      this.departments.forEach(department => {
        map[department.id] = { ...department, children: [] };
      });

      // 부모-자식 관계를 설정하고 자식 노드를 중복 없이 연결
      this.departments.forEach(department => {
        if (department.parentDepartment) {
          if (map[department.parentDepartment.id]) {
            map[department.parentDepartment.id].children.push(map[department.id]);
          }
        } else {
          roots.push(map[department.id]);
        }
      });

      // 계층적으로 배열을 생성하여 levels에 저장
      this.levels = this.createLevels(roots);
    },
    // 부서를 계층별로 레벨화
    createLevels(departments, level = 0, result = []) {
      if (!result[level]) {
        result[level] = [];
      }

      departments.forEach(department => {
        result[level].push(department);
        if (department.children && department.children.length > 0) {
          this.createLevels(department.children, level + 1, result);
        }
      });

      return result;
    },
    // 드래그 시작
    dragStart(department) {
      if (this.editMode) {
        this.draggedItem = department;
      }
    },
    // 드롭 후 부모 변경
    drop(department) {
      if (this.editMode && this.draggedItem.id !== department.id) {
        this.draggedItem.parentDepartment = department.id;
        this.isChanged = true;
        this.buildTree();
      }
    },
    // 부서 추가 다이얼로그 열기
    openCreateDialog() {
      this.isEdit = false;
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
    },
    // 편집 모드 토글
    toggleEditMode() {
      this.editMode = !this.editMode;
      if (!this.editMode) {
        this.departments = JSON.parse(JSON.stringify(this.departmentBackup)); 
        this.buildTree();
        this.isChanged = false;
      } else {
        this.departmentBackup = JSON.parse(JSON.stringify(this.departments)); 
      }
    },
    // 부서 저장
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
    // 모든 변경 사항 저장
    async saveAllChanges() {
      try {
        await this.$axios.post("/department/save", this.departments);
        alert("변경 사항이 저장되었습니다.");
        this.isChanged = false;
      } catch (error) {
        console.error("변경 사항 저장 중 오류 발생:", error);
      }
    },
  },
  mounted() {
    this.fetchDepartments(); 
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

/* 부모와 자식 간의 선 연결 */
.connector {
  width: 2px;
  height: 20px;
  background-color: #000;
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.line-group {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}

.line-item {
  display: flex;
  justify-content: center;
  margin: 0 20px;
}

.horizontal-line {
  width: 100%;
  height: 2px;
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
