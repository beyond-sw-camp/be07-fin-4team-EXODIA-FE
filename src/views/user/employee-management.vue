<template>
    <v-container>
      <v-row>
        <v-col>
          <h1>직원 목록</h1>
        </v-col>
      </v-row>
  
      <v-row>
        <v-col>
          <v-data-table
            :headers="headers"
            :items="users"
            item-value="userNum"
            class="elevation-1"
            hide-default-footer
          >
            <template v-slot:[`item.departmentName`]="{ item }">
              {{ item.departmentName }}
            </template>
            <template v-slot:[`item.positionName`]="{ item }">
              {{ item.positionName }}
            </template>
            <template v-slot:[`item.joinDate`]="{ item }">
              {{ formatJoinDate(item.joinDate) }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn @click="editUser(item.userNum)" text color="black">수정</v-btn>
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
        headers: [
          { text: '번호', value: 'userNum', width: '5%' },
          { text: '부서명', value: 'departmentName', width: '15%' },
          { text: '이름', value: 'name', width: '15%' },
          { text: '직급', value: 'positionName', width: '10%' },
          { text: '입사순', value: 'joinDate', width: '15%' },
          { text: '액션', value: 'actions', sortable: false, width: '15%' }
        ]
      };
    },
    methods: {
      async fetchUsers() {
        try {
          const response = await axios.get('/user/list');
          this.users = response.data;
        } catch (error) {
          console.error('직원 목록을 불러오는 중 오류가 발생했습니다:', error);
        }
      },
      formatJoinDate(date) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(date).toLocaleDateString('ko-KR', options);
      },
      editUser(userNum) {
        this.$router.push(`/employee-management/edit/${userNum}`);
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
  
  .v-data-table {
    font-size: 1rem;
  }
  
  .v-btn {
    font-size: 0.9rem;
  }
  
  th, td {
    text-align: left;
  }
  </style>
  