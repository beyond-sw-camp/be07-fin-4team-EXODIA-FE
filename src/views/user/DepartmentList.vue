<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="12">
          <h1>부서 관리</h1>
          <v-btn color="primary" @click="openCreateDialog">부서 추가</v-btn>
          <v-btn color="success" @click="saveAllChanges">변경 사항 저장</v-btn>
        </v-col>
      </v-row>

      <!-- 트리 구조 -->
      <v-row>
        <v-col cols="12">
          <v-treeview
            :items="departments"
            activatable
            open-all
            item-text="name"
            item-key="id"
            dense
            v-model="selected"
            @input="onSelect"
          >
            <template v-slot:prepend="{ item }">
              <v-icon>mdi-office-building</v-icon>
              <span>{{ item.name }}</span>
            </template>
          </v-treeview>
        </v-col>
      </v-row>

      <!-- 부서 추가/수정 다이얼로그 -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>{{ isEdit ? '부서 수정' : '부서 추가' }}</v-card-title>
          <v-card-text>
            <v-text-field label="부서 이름" v-model="departmentForm.name"></v-text-field>
            <v-select
              label="상위 부서"
              :items="parentOptions"
              v-model="departmentForm.parentId"
              item-text="name"
              item-value="id"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveDepartment">{{ isEdit ? '수정' : '추가' }}</v-btn>
            <v-btn color="red" @click="dialog = false">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      departments: [], // 부서 트리 데이터
      departmentForm: {
        id: null,
        name: "",
        parentId: null,
      },
      parentOptions: [], // 상위 부서 옵션
      dialog: false,
      isEdit: false,
      selected: [], // 선택된 부서
    };
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await axios.get("/department");
        const departmentsData = response.data.result;
        console.log("받은 부서 데이터:", departmentsData);
        this.departments = this.buildTree(departmentsData);
        this.parentOptions = departmentsData;
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류 발생:", error);
      }
    },
    buildTree(departments) {
      const map = {};
      const roots = [];
      departments.forEach((department) => {
        map[department.id] = { ...department, children: [] };
      });
      departments.forEach((department) => {
        if (department.parentDepartment) {
          map[department.parentDepartment.id].children.push(map[department.id]);
        } else {
          roots.push(map[department.id]);
        }
      });
      return roots;
    },
    onSelect(items) {
      if (items.length) {
        this.departmentForm.id = items[0];
      }
    },
    openCreateDialog() {
      this.isEdit = false;
      this.departmentForm = { id: null, name: "", parentId: null };
      this.dialog = true;
    },
    async saveDepartment() {
      if (this.isEdit) {
        await axios.put(`/department/${this.departmentForm.id}`, {
          name: this.departmentForm.name,
          parentId: this.departmentForm.parentId,
        });
      } else {
        await axios.post("/department", {
          name: this.departmentForm.name,
          parentId: this.departmentForm.parentId,
        });
      }
      this.dialog = false;
      this.fetchDepartments();
    },
    async saveAllChanges() {
      // 부서 수정 저장 로직 추가
    },
  },
  mounted() {
    this.fetchDepartments();
  },
};
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  padding: 5px;
}
</style>
