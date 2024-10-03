<template>
  <div class="department-container">
    <h1>부서 관리</h1>
    <button @click="openCreateDialog">부서 추가</button>
    <button @click="saveAllChanges">변경 사항 저장</button>

    <!-- 트리 구조 -->
    <ul class="tree-list">
      <li
        v-for="department in departments"
        :key="department.id"
        class="tree-item"
        draggable="true"
        @dragstart="dragStart(department)"
        @dragover.prevent
        @drop="drop(department)"
      >
        <span>{{ department.name }}</span>
        <ul v-if="department.children && department.children.length">
          <li
            v-for="child in department.children"
            :key="child.id"
            class="tree-item"
            draggable="true"
            @dragstart="dragStart(child)"
            @dragover.prevent
            @drop="drop(child)"
          >
            <span>{{ child.name }}</span>
          </li>
        </ul>
      </li>
    </ul>

    <!-- 부서 추가/수정 다이얼로그 -->
    <div v-if="dialog">
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
      departments: [], // 트리 구조 데이터
      draggedItem: null, // 드래그 중인 아이템
      departmentForm: {
        id: null,
        name: "",
        parentId: null,
      },
      parentOptions: [], // 상위 부서 옵션
      dialog: false,
      isEdit: false,
    };
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await this.$axios.get("/department");
        this.departments = this.buildTree(response.data.result);
        this.parentOptions = response.data.result;
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류 발생:", error);
      }
    },
    buildTree(departments) {
      const map = {};
      const roots = [];
      departments.forEach(department => {
        map[department.id] = { ...department, children: [] };
      });
      departments.forEach(department => {
        if (department.parentDepartment) {
          map[department.parentDepartment.id].children.push(map[department.id]);
        } else {
          roots.push(map[department.id]);
        }
      });
      return roots;
    },
    dragStart(department) {
      this.draggedItem = department;
    },
    drop(department) {
      if (this.draggedItem.id !== department.id) {
        // 드래그된 아이템의 부모 부서를 새로운 부모 부서로 업데이트
        this.draggedItem.parentDepartment = department.id;
        this.saveAllChanges(); // 변경 사항 저장
        this.fetchDepartments(); // 다시 트리 구조 불러오기
      }
    },
    openCreateDialog() {
      this.isEdit = false;
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
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
      // 변경 사항 저장 로직
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

.tree-list {
  list-style: none;
  padding-left: 20px;
}

.tree-item {
  margin: 5px 0;
  padding: 5px;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  cursor: move;
}

.tree-item:hover {
  background-color: #f1f1f1;
}
</style>
