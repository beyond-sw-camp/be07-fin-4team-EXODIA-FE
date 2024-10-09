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

    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="users"
          item-value="userNum"
          class="elevation-1"
          @click:row="viewUser"
          style="width: 100%"
        >
          <template v-slot:item="{ item }">
            <tr @click="viewUser(item)">
              <td style="padding: 10px;">{{ item.userNum }}</td>
              <td style="padding: 10px;">{{ getDepartmentName(item.departmentId) }}</td>
              <td style="padding: 10px;">{{ item.name }}</td>
              <td style="padding: 10px;">{{ getPositionName(item.positionId) }}</td>
              <td style="padding: 10px;">{{ item.joinDate }}</td>
              <td style="padding: 10px;">
                <v-btn text class="green--text" @click.stop="editUser(item.userNum)">수정</v-btn>
                <v-btn text class="red--text" @click.stop="openDeleteDialog(item.userNum)">삭제</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

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
      headers: [
        { text: "사번", value: "userNum", align: 'center' },
        { text: "부서", value: "departmentId", align: 'center' },
        { text: "이름", value: "name", align: 'center' },
        { text: "직급", value: "positionId", align: 'center' },
        { text: "입사일", value: "joinDate", align: 'center' },
        { text: "관리", value: "actions", sortable: false, align: 'center' },
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
        console.log("직급 데이터:", this.positions); 
      } catch (error) {
        console.error("직급 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    getDepartmentName(departmentId) {
      const department = this.departments.find(dept => dept.id === departmentId);
      return department ? department.name : "알 수 없음";
    },

    getPositionName(positionId) {
      const position = this.positions.find(pos => pos.id === positionId);
      return position ? position.name : "알 수 없음";
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
.v-btn {
  margin-right: 10px;
}

.v-data-table__wrapper {
  text-align: center;
}

.green--text {
  color: #4caf50 !important;
}

.red--text {
  color: #f44336 !important;
}

table {
  width: 100%;
}

td {
  text-align: center;
  padding: 10px;
}
</style>
