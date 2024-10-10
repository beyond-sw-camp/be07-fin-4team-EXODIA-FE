<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>직원 목록</h1>
      </v-col>
      <v-col class="d-flex justify-end">
        <v-btn color="primary" @click="goToCreate">직원 생성</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="searchType"
          :items="searchOptions"
          item-title="text"
          item-value="value"
          label="검색 기준"
          required
        ></v-select>
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="검색어를 입력하세요."
          append-icon="mdi-magnify"
          @click:append="performSearch"
          required
        ></v-text-field>
      </v-col>
    </v-row>

    <div v-if="users.length > 0">
      <table class="employee-table">
        <thead>
          <tr>
            <th>사번</th>
            <th>부서</th>
            <th>이름</th>
            <th>직급</th>
            <th>입사일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userNum" @click="viewUser(user)">
            <td>{{ user.userNum }}</td>
            <td>{{ getDepartmentName(user.departmentId) }}</td>
            <td>{{ user.name }}</td>
            <td>{{ getPositionName(user.positionId) }}</td>
            <td>{{ user.joinDate }}</td>
            <td>
              <button class="edit-btn" @click.stop="editUser(user.userNum)">수정</button>
              <button class="delete-btn" @click.stop="openDeleteDialog(user.userNum)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else>
      <p>직원 데이터가 없습니다.</p>
    </div>

    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">직원 삭제</v-card-title>
        <v-card-text>
          <v-text-field v-model="deleteInfo.deletedBy" label="담당자" required></v-text-field>
          <v-textarea v-model="deleteInfo.reason" label="삭제 사유" required></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="red--text" @click="confirmDelete">삭제</v-btn>
          <v-btn class="green--text" @click="closeDeleteDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeManagement",
  data() {
    return {
      users: [],
      searchQuery: "",
      searchType: "all",
      searchOptions: [
        { text: "전체", value: "all" },
        { text: "이름", value: "name" },
        { text: "부서", value: "department" },
        { text: "직급", value: "position" },
      ],
      departments: [], // 부서 목록
      positions: [], // 직급 목록
      deleteDialog: false,
      deleteInfo: {
        userNum: "",
        deletedBy: "",
        reason: "",
      },
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("/user/list");
        this.users = response.data;
      } catch (error) {
        console.error("직원 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get("/department");
        this.departments = response.data;
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    async fetchPositions() {
      try {
        const response = await axios.get("/positions");
        this.positions = response.data;
      } catch (error) {
        console.error("직급 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    getDepartmentName(departmentId) {
      if (this.departments && this.departments.length > 0) {
        const department = this.departments.find(dept => dept.id === departmentId);
        return department ? department.name : "알 수 없음";
      }
      return "알 수 없음"; // 부서가 아직 로드되지 않았을 때 기본값 처리
    },

    getPositionName(positionId) {
      if (this.positions && this.positions.length > 0) {
        const position = this.positions.find(pos => pos.id === positionId);
        return position ? position.name : "알 수 없음";
      }
      return "알 수 없음"; // 직급이 아직 로드되지 않았을 때 기본값 처리
    },

    performSearch() {
      // 검색 로직 구현
    },

    viewUser(item) {
      if (item && item.userNum) {
        this.$router.push(`/employee-management/detail/${item.userNum}`);
      }
    },

    goToCreate() {
      this.$router.push("/employee-management/create");
    },

    editUser(userNum) {
      this.$router.push(`/employee-management/edit/${userNum}`);
    },

    openDeleteDialog(userNum) {
      this.deleteInfo.userNum = userNum;
      this.deleteDialog = true;
    },

    confirmDelete() {
      // 삭제 로직 구현
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchDepartments();
    this.fetchPositions();
  },
};
</script>

<style scoped>
.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th,
.employee-table td {
  padding: 10px;
  text-align: left;
}

.employee-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.employee-table tr:hover {
  background-color: #f0f0f0;
}

.edit-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

p {
  text-align: center;
}
</style>
