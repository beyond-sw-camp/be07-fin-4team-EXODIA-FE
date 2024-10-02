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
                  <v-btn @click.stop="editUser(item.userNum)" text>수정</v-btn>
                  <v-btn @click.stop="deleteUser(item.userNum)" text color="red">삭제</v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
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
  
      async deleteUser(userNum) {
        const confirmed = confirm("정말로 이 직원을 삭제하시겠습니까?");
        if (confirmed) {
          try {
            await axios.delete(`/user/${userNum}`);
            this.fetchUsers();
          } catch (error) {
            console.error("직원 삭제 중 오류가 발생했습니다:", error);
          }
        }
      }
    },
    mounted() {
      this.fetchUsers();
    }
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
  
  .clickable {
    cursor: pointer;
    color: #3f51b5;
    text-decoration: underline;
  }
  </style>
  