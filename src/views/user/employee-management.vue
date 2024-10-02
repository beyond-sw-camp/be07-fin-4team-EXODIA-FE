<template>
    <v-container>
      <v-row>
        <v-col>
          <h1>직원 목록</h1>
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
          <table class="tbl-header">
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
          </table>
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
          >
            <template #item="{ item }">
              <tr @click="viewUser(item)">
                <td>{{ item.userNum }}</td>
                <td>{{ item.departmentName }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.positionName }}</td>
                <td>{{ item.joinDate }}</td>
                <td>
                  <v-btn v-if="isHrDepartment" class="red-text" @click.stop="editUser(item.userNum)">수정</v-btn>
                  <v-btn v-if="isHrDepartment" class="green-text" @click.stop="openDeleteDialog(item.userNum)">삭제</v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
  
      <v-dialog v-model="deleteDialog" persistent max-width="400">
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
            <v-btn class="red-text" @click="confirmDelete">삭제</v-btn>
            <v-btn class="green-text" @click="closeDeleteDialog">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  import hrMixin from "@/assets/js/hrMixin";
  
  export default {
    name: "EmployeeManagement",
    mixins: [hrMixin],  // mixin 적용
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
          console.log("직원 목록:", this.users); // 직원 목록 로드 확인
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
          console.log("검색 결과:", this.users); // 검색 결과 확인
        } catch (error) {
          console.error("검색 중 오류가 발생했습니다:", error);
        }
      },
  
      viewUser(item) {
        if (item && item.userNum) {
          this.$router.push(`/employee-management/detail/${item.userNum}`);
        } else {
          console.error("유효한 직원 정보가 없습니다.");
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
  
        const token = localStorage.getItem("token");  // 토큰을 가져옴
        if (!token) {
          alert("토큰이 필요합니다. 다시 로그인해주세요.");
          return;
        }
  
        try {
          await axios.delete(`/user/delete`, {
            headers: {
              Authorization: `Bearer ${token}`
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
      }
    },
    mounted() {
      this.fetchUsers();
    },
  };
  </script>
  
  <style scoped>
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
  
  .green-text {
    color: #4caf50 !important;
  }
  
  .red-text {
    color: #af2626 !important;
  }
  </style>
  