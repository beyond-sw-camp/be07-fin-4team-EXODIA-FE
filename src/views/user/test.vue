<template>
    <v-container>
      <v-row>
        <v-col>
          <h1>직원 목록</h1>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn v-create color="primary" @click="goToCreate">직원 생성</v-btn>
        </v-col>
      </v-row>
  
      <!-- 검색 필드 -->
      <v-row justify="center" style="margin:0; text-align:center;">
        <v-col cols="6">
          <v-text-field
            v-model="searchQuery"
            placeholder="검색어를 입력하세요"
            variant="underlined"
            @input="performSearch"
            style="margin-bottom: 20px;"
          ></v-text-field>
        </v-col>
        <v-col cols="4" sm="2">
          <v-btn v-search @click="performSearch(searchQuery)">
            검색
          </v-btn>
          
        </v-col>
      </v-row>
  
      <!-- 유저 리스트 카드 형식으로 표시 -->
      <v-row v-if="users.length > 0">
        <v-col v-for="user in users" :key="user.userNum" cols="12" md="4">
          <v-card class="user-card">
            <v-img :src="user.profileImage" alt="Profile Image" class="profile-img"></v-img>
            <v-card-title>{{ user.name }}</v-card-title>
            <v-card-subtitle>사번: {{ user.userNum }}</v-card-subtitle>
            <v-card-subtitle>부서: {{ getDepartmentName(user.departmentId) }}</v-card-subtitle>
            <v-card-subtitle>직급: {{ getPositionName(user.positionId) }}</v-card-subtitle>
            <v-card-actions>
              <v-btn v-update color="primary" @click="editUser(user.userNum)">수정</v-btn>
              <v-btn v-delete color="red" @click="openDeleteDialog(user.userNum)">삭제</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
  
      <v-row v-else>
        <v-col>
          <p>직원 데이터가 없습니다.</p>
        </v-col>
      </v-row>
  
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
            <v-btn v-delete color="red" @click="confirmDelete">삭제</v-btn>
            <v-btn v-close color="green" @click="closeDeleteDialog">취소</v-btn>
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
        deleteDialog: false,
        deleteInfo: {
          userNum: "",
          reason: "",
        },
        adminCode: "",
        correctAdminCode: "12341234",
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
      getDepartmentName(departmentId) {
        return this.departments?.find((dept) => dept.id === departmentId)?.name || "알 수 없음";
      },
      getPositionName(positionId) {
        return this.positions?.find((pos) => pos.id === positionId)?.name || "알 수 없음";
      },
      async performSearch() {
        try {
          const response = await axios.get("/user/search", {
            params: { search: this.searchQuery },
          });
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
      async confirmDelete() {
        if (this.adminCode !== this.correctAdminCode) {
          alert("잘못된 관리자 코드입니다.");
          return;
        }
        try {
          const token = localStorage.getItem("token");
          await axios.delete("/user/delete", {
            data: {
              userNum: this.deleteInfo.userNum,
              reason: this.deleteInfo.reason,
            },
            headers: { Authorization: `Bearer ${token}` },
          });
          alert("직원 삭제가 완료되었습니다.");
          this.fetchUsers();
          this.closeDeleteDialog();
        } catch (error) {
          console.error("삭제 중 오류가 발생했습니다:", error);
          alert("삭제 중 오류가 발생했습니다.");
        }
      },
      closeDeleteDialog() {
        this.deleteDialog = false;
      },
    },
    mounted() {
      this.fetchUsers();
    },
  };
  </script>
  
  <style scoped>
  .user-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 350px;
    padding: 20px;
    text-align: center;
  }
  
  .profile-img {
    height: 200px;
    object-fit: cover;
  }
  
  .employee-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .v-btn {
    margin: 5px;
  }
  
  </style>
  