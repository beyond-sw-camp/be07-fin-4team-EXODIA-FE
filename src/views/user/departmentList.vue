<template>
  <div class="department-container">
    <h1>부서 관리</h1>

    <div class="button-group">
      <button v-if="editMode" @click="openCreateDialog">부서 추가</button>
      <button @click="completeEdit">{{ editMode ? '편집 완료' : '편집' }}</button>
      <button v-if="editMode" @click="cancelEdit">취소</button>
    </div>

    <div class="tree-container">
      <div v-for="(level, index) in levels" :key="index" class="tree-level">
        <div
          v-for="department in level"
          :key="department.id"
          class="tree-item"
          :draggable="editMode"
          @dragstart="dragStart(department)"
          @dragover.prevent
          @drop="drop(department)"
          :style="getNodeStyle(index)"
        >
          <div class="tree-node">
            {{ department.name }}
          </div>
          <div v-if="department.children.length" class="connector"></div>
        </div>
      </div>
    </div>

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
      departments: [],
      levels: [],
      draggedItem: null,
      departmentForm: { id: null, name: "", parentId: null },
      parentOptions: [],
      dialog: false,
      isEdit: false,
      editMode: false,
      departmentBackup: [],
      isChanged: false,
    };
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await this.$axios.get("/department");
        this.departments = response.data.result;
        this.buildTree(); 
        this.parentOptions = this.departments;
        this.isChanged = false;
      } catch (error) {
        console.error("Error fetching department data:", error);
      }
    },

    buildTree() {
      const map = {};
      const roots = [];

      this.departments.forEach(department => {
        map[department.id] = { ...department, children: [] };
      });

      this.departments.forEach(department => {
        if (department.parentId) {
          if (map[department.parentId]) {
            map[department.parentId].children.push(map[department.id]);
          }
        } else {
          roots.push(map[department.id]);
        }
      });

      this.levels = this.createLevels(roots);
    },

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

    dragStart(department) {
      if (this.editMode) {
        this.draggedItem = department;
      }
    },

    drop(department) {
      if (this.editMode && this.draggedItem.id !== department.id) {
        const draggedItemIndex = this.departments.findIndex(d => d.id === this.draggedItem.id);
        if (draggedItemIndex !== -1) {
          this.departments[draggedItemIndex].parentId = department.id;
          this.isChanged = true;
          this.buildTree();
        }
      }
    },

    openCreateDialog() {
      this.isEdit = false;
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
    },

    async completeEdit() {
      if (this.editMode) {
        this.saveAllChanges();
      }
      this.editMode = !this.editMode;
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
            parentId: this.departmentForm.parentId,
          });
        }
        this.dialog = false;
        this.fetchDepartments();
      } catch (error) {
        console.error("Error saving department:", error);
      }
    },

    async saveAllChanges() {
      try {
        await this.$axios.post("/department/save", this.departments);
        alert("Changes have been saved.");
        this.$router.push("/department/list");
      } catch (error) {
        console.error("Error saving changes:", error);
      }
    },

    cancelEdit() {
      this.departments = JSON.parse(JSON.stringify(this.departmentBackup)); 
      this.buildTree();
      this.editMode = false;
      this.isChanged = false;
    },

    getNodeStyle(level) {
      const colors = ["#e0e0e0", "#c0c0c0", "#a0a0a0", "#808080", "#606060"];
      return {
        backgroundColor: colors[level % colors.length],
      };
    }
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

.tree-container {
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
  cursor: default;
  transition: background-color 0.3s;
  min-width: 150px;
}

.tree-node:hover {
  background-color: #f1f1f1;
}

.connector {
  height: 20px;
  border-left: 2px solid black;
  margin-left: 75px;
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

.dialog {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
}
</style>
