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
            :items="searchTypes"
            label="검색 기준"
          ></v-select>
        </v-col>
  
        <v-col cols="12" md="8">
          <v-text-field
            v-model="search"
            label="검색어를 입력하세요."
            append-icon="mdi-magnify"
            @keyup.enter="fetchUsers"
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
          >
            <template v-slot:[`item.departmentName`]="{ item }">
              {{ item.departmentName }}
            </template>
            <template v-slot:[`item.positionName`]="{ item }">
              {{ item.positionName }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn @click="viewUser(item.userNum)" text>수정</v-btn>
              <v-btn @click="deleteUser(item.userNum)" text color="red">삭제</v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'EmployeeManagement',
    data() {
      return {
        users: [],
        search: '',
        searchType: 'all',
        searchTypes: [
          { text: '전체', value: 'all' },
          { text: '이름', value: 'name' },
          { text: '부서', value: 'department' },
          { text: '직급', value: 'position' }
        ],
        headers: [
          { text: '사번', value: 'userNum' },
          { text: '부서', value: 'departmentName' },
          { text: '이름', value: 'name' },
          { text: '직급', value: 'positionName' },
          { text: '입사일', value: 'joinDate' },
          { text: '액션', value: 'actions', sortable: false }
        ]
      };
    },
    methods: {
      async fetchUsers() {
        try {
          const response = await axios.get('/user/search', {
            params: { search: this.search, searchType: this.searchType }
          });
          this.users = response.data;
        } catch (error) {
          console.error('직원 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
      },
  
      viewUser(userNum) {
        this.$router.push(`/employee-management/detail/${userNum}`);
      },
  
      async deleteUser(userNum) {
        const confirmed = confirm('정말로 이 직원을 삭제하시겠습니까?');
        if (confirmed) {
          try {
            await axios.delete(`/user/${userNum}`);
            this.fetchUsers();
          } catch (error) {
            console.error('직원 삭제 중 오류가 발생했습니다:', error);
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
  .elevation-1 {
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24);
  }
  </style>
  