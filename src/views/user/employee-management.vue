<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>직원 목록</h1>
      </v-col>
      <!-- 직원 생성 버튼 -->
      <v-col class="d-flex justify-end">
        <v-btn color="primary" @click="goToCreate">직원 생성</v-btn>
      </v-col>
    </v-row>

    <!-- 검색 기준 및 검색어 입력 -->
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

    <!-- 직원 목록 테이블 -->
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="users"
          item-value="userNum"
          class="elevation-1"
          @click:row="viewUser"
        >
          <template v-slot:item="{ item }">
            <tr @click="viewUser(item)">
              <td>{{ item.userNum }}</td>
              <td>{{ item.departmentName }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.positionName }}</td>
              <td>{{ item.joinDate }}</td>
              <td>
                <v-btn text class="green--text" @click.stop="editUser(item.userNum)">수정</v-btn>
                <v-btn text class="red--text" @click.stop="openDeleteDialog(item.userNum)">삭제</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 직원 삭제 확인 다이얼로그 -->
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
      users: [], // 직원 목록
      searchQuery: "", // 검색어
      searchType: "all", // 검색 기준
      searchOptions: [
        { text: "전체", value: "all" },
        { text: "이름", value: "name" },
        { text: "부서", value: "department" },
        { text: "직급", value: "position" },
      ],
      headers: [
        { text: "사번", value: "userNum" },
        { text: "부서", value: "departmentName" },
        { text: "이름", value: "name" },
        { text: "직급", value: "positionName" },
        { text: "입사일", value: "joinDate" },
        { text: "관리", value: "actions", sortable: false },
      ],
      deleteDialog: false,
      deleteInfo: {
        userNum: "",
        deletedBy: "",
        reason: "",
      },
    };
  },
  methods: {
    // 직원 목록 가져오기
    async fetchUsers() {
      try {
        const response = await axios.get("/user/list");
        this.users = response.data;
      } catch (error) {
        console.error("직원 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    // 검색 실행
    async performSearch() {
      try {
        const params = {
          search: this.searchQuery,
          searchType: this.searchType,
        };
        const response = await axios.get("/user/search", { params });
        this.users = response.data;
      } catch (error) {
        console.error("검색 중 오류가 발생했습니다:", error);
      }
    },

    // 행 클릭 시 상세 정보 페이지로 이동
    viewUser(item) {
      if (item && item.userNum) {
        this.$router.push(`/employee-management/detail/${item.userNum}`);
      }
    },

    // 직원 생성 페이지로 이동
    goToCreate() {
      this.$router.push("/employee-management/create");
    },

    // 수정 버튼 클릭
    editUser(userNum) {
      this.$router.push(`/employee-management/edit/${userNum}`);
    },

    // 삭제 다이얼로그 열기
    openDeleteDialog(userNum) {
      this.deleteInfo.userNum = userNum;
      this.deleteDialog = true;
    },

    // 삭제 확인 후 삭제 실행
    async confirmDelete() {
      if (!this.deleteInfo.deletedBy || !this.deleteInfo.reason) {
        alert("담당자와 삭제 사유를 입력해주세요.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("토큰이 필요합니다. 다시 로그인해주세요.");
        return;
      }

      try {
        await axios.delete(`/user/delete`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            userNum: this.deleteInfo.userNum,
            deletedBy: this.deleteInfo.deletedBy,
            reason: this.deleteInfo.reason,
          },
        });
        alert("직원이 삭제되었습니다.");
        this.fetchUsers();
        this.closeDeleteDialog();
      } catch (error) {
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
          alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
          this.$router.push("/login");
        } else {
          console.error("직원 삭제 중 오류가 발생했습니다:", error);
        }
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}

.green--text {
  color: #4caf50 !important;
}

.red--text {
  color: #f44336 !important;
}
</style>
