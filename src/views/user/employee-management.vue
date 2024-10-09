<template>
  <v-container>
    <!-- 직원 목록 제목 및 직원 생성 버튼 -->
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1>직원 목록</h1>
        <v-btn color="success" @click="goToCreate">직원 생성</v-btn>
      </v-col>
    </v-row>

    <!-- 검색 기능 -->
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
          :items-per-page="10"
          class="elevation-1"
          :search="searchQuery"
        >
          <!-- 테이블 행 렌더링 -->
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.userNum">
                <td>{{ item.userNum }}</td>
                <td>{{ item.departmentName }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.positionName }}</td>
                <td>{{ item.joinDate }}</td>
                <td>
                  <v-btn
                    text
                    small
                    color="green"
                    @click.stop="editUser(item.userNum)"
                  >
                    수정
                  </v-btn>
                  <v-btn
                    text
                    small
                    color="red"
                    @click.stop="openDeleteDialog(item.userNum)"
                  >
                    삭제
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 직원 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">직원 삭제</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="deleteInfo.deletedBy"
            label="담당자"
            required
          ></v-text-field>
          <v-textarea
            v-model="deleteInfo.reason"
            label="삭제 사유"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="confirmDelete">삭제</v-btn>
          <v-btn color="grey" @click="closeDeleteDialog">취소</v-btn>
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
    async fetchUsers() {
      try {
        const response = await axios.get("/user/list");
        this.users = response.data;
      } catch (error) {
        console.error("직원 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },

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

    editUser(userNum) {
      this.$router.push(`/employee-management/edit/${userNum}`);
    },

    openDeleteDialog(userNum) {
      this.deleteInfo.userNum = userNum;
      this.deleteDialog = true;
    },

    closeDeleteDialog() {
      this.deleteDialog = false;
      this.deleteInfo = { userNum: "", deletedBy: "", reason: "" };
    },

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

    goToCreate() {
      this.$router.push("/employee-management/create");
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.d-flex {
  display: flex;
}
.justify-space-between {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}

.tbl-header {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.tbl-header th {
  text-align: left;
  padding: 10px;
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 2px solid #ddd;
}

.elevation-1 {
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24);
}

.v-btn text {
  font-weight: bold;
  color: white;
}

.v-btn[color="green"] {
  color: #4caf50 !important;
}

.v-btn[color="red"] {
  color: #f44336 !important;
}
</style>
