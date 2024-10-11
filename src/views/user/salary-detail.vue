<template>
    <v-container class="mt-5">
      <v-card class="mx-auto" max-width="600">
        <v-card-title>
          <h3>급여 명세서</h3>
        </v-card-title>
  
        <v-card-text v-if="salary">
          <v-list>
            <v-list-item>
              <v-list-item-title>사번: {{ salary.userNum || '정보 없음' }}</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>이름: {{ salary.userName || '정보 없음' }}</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>부서: {{ salary.departmentName || '정보 없음' }}</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>직급: {{ salary.positionName || '정보 없음' }}</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>기본급: {{ salary.baseSalary ? salary.baseSalary.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>연차: {{ salary.yearsOfService || '정보 없음' }}년차</v-list-item-title>
            </v-list-item>
  
            <v-divider></v-divider>
  
            <v-list-item>
              <v-list-item-title>국민연금: {{ salary.taxAmount?.nationalPension ? salary.taxAmount.nationalPension.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>건강보험: {{ salary.taxAmount?.healthInsurance ? salary.taxAmount.healthInsurance.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>장기요양보험: {{ salary.taxAmount?.longTermCare ? salary.taxAmount.longTermCare.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>고용보험: {{ salary.taxAmount?.employmentInsurance ? salary.taxAmount.employmentInsurance.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
  
            <v-divider></v-divider>
  
            <v-list-item>
              <v-list-item-title>총 세금: {{ salary.taxAmount?.totalTax ? salary.taxAmount.totalTax.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-title>최종 연봉: {{ salary.finalSalary ? salary.finalSalary.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
  
        <v-card-text v-else>
          <v-alert type="info">
            급여 데이터를 찾을 수 없습니다.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'SalaryDetails',
    props: {
      userNum: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        salary: null,
      };
    },
    methods: {
      async fetchSalaryDetails() {
        try {
          const response = await axios.get(`/salary/detail/${this.userNum}`);
          this.salary = response.data;
        } catch (error) {
          console.error('급여 명세서를 가져오는 중 오류가 발생했습니다:', error);
        }
      },
    },
    mounted() {
      this.fetchSalaryDetails();
    },
  };
  </script>
  
  <style scoped>
  .salary-container {
    margin: 20px;
  }
  
  .v-card-title {
    padding-bottom: 10px;
    font-weight: bold;
  }
  
  .v-card-text {
    padding-top: 0;
  }
  
  .v-list-item-title {
    font-weight: 500;
  }
  
  .v-divider {
    margin: 10px 0;
  }
  </style>
  