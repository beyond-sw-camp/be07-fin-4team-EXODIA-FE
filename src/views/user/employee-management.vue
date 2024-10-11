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
        <thead >
          <tr style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px ; padding:4px; color:#444444; font-weight:600;">
            <th>번호</th> <!-- 행 번호 추가 -->
            <th>사번</th>
            <th>부서</th>
            <th>이름</th>
            <th>직급</th>
            <th>입사일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.userNum" @click="viewUser(user)">
            <td>{{ index + 1 }}</td> <!-- 행 번호 표시 -->
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

    <!-- 삭제 다이얼로그 -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">직원 삭제</v-card-title>
        <v-card-text>
          <v-text-field v-model="adminCode" label="관리자 코드" required type="password"></v-text-field>
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
      users: [], // 직원 목록을 저장
      searchQuery: "", // 검색어 저장
      searchType: "all", // 검색 기준 (이름, 부서, 직급)
      searchOptions: [
        { text: "전체", value: "all" },
        { text: "이름", value: "name" },
        { text: "부서", value: "department" },
        { text: "직급", value: "position" },
      ],
      departments: [], // 부서 목록 저장
      positions: [], // 직급 목록 저장
      deleteDialog: false, // 삭제 확인 Dialog의 상태
      deleteInfo: {
        userNum: "", // 삭제하려는 직원의 사번
        reason: "", // 삭제 사유
      },
      adminCode: "", // 관리자 코드
      correctAdminCode: "12341234", // 실제 관리자 코드
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("/user/list");
        this.users = response.data; // 서버에서 가져온 직원 목록을 저장
      } catch (error) {
        console.error("직원 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get("/department");
        this.departments = response.data; // 부서 목록을 서버에서 가져와 저장
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    async fetchPositions() {
      try {
        const response = await axios.get("/positions");
        this.positions = response.data; // 직급 목록을 서버에서 가져와 저장
      } catch (error) {
        console.error("직급 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    getDepartmentName(departmentId) {
      if (this.departments && this.departments.length > 0) {
        const department = this.departments.find((dept) => dept.id === departmentId);
        return department ? department.name : "알 수 없음";
      }
      return "알 수 없음"; // 부서가 아직 로드되지 않았을 때 기본값 처리
    },

    getPositionName(positionId) {
      if (this.positions && this.positions.length > 0) {
        const position = this.positions.find((pos) => pos.id === positionId);
        return position ? position.name : "알 수 없음";
      }
      return "알 수 없음"; // 직급이 아직 로드되지 않았을 때 기본값 처리
    },

    async performSearch() {
      try {
        const response = await axios.get("/user/search", {
          params: {
            search: this.searchQuery,
            searchType: this.searchType,
          },
        });
        this.users = response.data;
      } catch (error) {
        console.error("검색 중 오류가 발생했습니다:", error);
      }
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
      this.deleteInfo.userNum = userNum; // 삭제하려는 직원의 사번 설정
      this.deleteDialog = true; // 삭제 Dialog를 표시
    },

    async confirmDelete() {
      if (this.adminCode !== this.correctAdminCode) {
        alert("잘못된 관리자 코드입니다.");
        return;
      }

      try {
        const token = localStorage.getItem("token"); // 사용자 토큰을 로컬 스토리지에서 가져옴
        const response = await axios.delete("/user/delete", {
          data: {
            userNum: this.deleteInfo.userNum,
            reason: this.deleteInfo.reason,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);

        alert("직원 삭제가 완료되었습니다.");
        this.fetchUsers(); // 삭제 후 직원 목록 새로고침
        this.closeDeleteDialog();
      } catch (error) {
        console.error("삭제 중 오류가 발생했습니다:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    },

    closeDeleteDialog() {
      this.deleteDialog = false; // 삭제 Dialog 닫기
    },
  },
  mounted() {
    this.fetchUsers(); // 컴포넌트가 마운트되면 직원 목록을 불러옴
    this.fetchDepartments(); // 부서 목록을 불러옴
    this.fetchPositions(); // 직급 목록을 불러옴
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
  font-weight: bold;
}

.employee-table tr:hover {
  background-color: #f0f0f0;
}

.edit-btn {
  background: none;
  color: #4caf50;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.delete-btn {
  background: none;
  color: #f44336;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

p {
  text-align: center;
}
</style>
