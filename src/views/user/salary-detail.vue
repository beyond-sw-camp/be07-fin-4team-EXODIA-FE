<template>
    <v-container class="mt-5">
      <v-card class="mx-auto salary-slip-card">
        <v-card-title>
          <h3 class="salary-title">급여 명세서</h3>
        </v-card-title>
  
        <v-card-text v-if="salary">
          <div class="salary-section">
            <v-row>
              <v-col cols="6">
                <strong>사번:</strong> {{ salary.userNum }}
              </v-col>
              <v-col cols="6">
                <strong>이름:</strong> {{ salary.userName }}
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <strong>부서:</strong> {{ salary.departmentName }}
              </v-col>
              <v-col cols="6">
                <strong>직급:</strong> {{ salary.positionName }}
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <strong>기본급:</strong> {{ salary.baseSalary ? salary.baseSalary.toLocaleString() : '정보 없음' }} 원
              </v-col>
              <v-col cols="6">
                <strong>연차:</strong> {{ salary.yearsOfService ? salary.yearsOfService + '년차' : '정보 없음' }}
              </v-col>
            </v-row>
          </div>
  
          <v-divider></v-divider>
  
          <div class="tax-section">
            <h4>세금 항목</h4>
            <v-row>
              <v-col cols="6">
                <strong>국민연금:</strong> 
                {{ salary.taxAmount && salary.taxAmount.nationalPension ? salary.taxAmount.nationalPension.toLocaleString() : '정보 없음' }} 원
              </v-col>
              <v-col cols="6">
                <strong>건강보험:</strong> 
                {{ salary.taxAmount && salary.taxAmount.healthInsurance ? salary.taxAmount.healthInsurance.toLocaleString() : '정보 없음' }} 원
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <strong>장기요양보험:</strong> 
                {{ salary.taxAmount && salary.taxAmount.longTermCare ? salary.taxAmount.longTermCare.toLocaleString() : '정보 없음' }} 원
              </v-col>
              <v-col cols="6">
                <strong>고용보험:</strong> 
                {{ salary.taxAmount && salary.taxAmount.employmentInsurance ? salary.taxAmount.employmentInsurance.toLocaleString() : '정보 없음' }} 원
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <strong>총 세금:</strong> 
                {{ salary.taxAmount && salary.taxAmount.totalTax ? salary.taxAmount.totalTax.toLocaleString() : '정보 없음' }} 원
              </v-col>
              <v-col cols="6">
                <strong>최종 연봉:</strong> 
                {{ salary.finalSalary ? salary.finalSalary.toLocaleString() : '정보 없음' }} 원
              </v-col>
            </v-row>
          </div>
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
          const response = await this.$axios.get(`/salary/detail/${this.userNum}`);
          this.salary = response.data;
        } catch (error) {
          console.error('급여 명세서를 가져오는 중 오류가 발생했습니다:', error);
        }
      }
    },
    mounted() {
      this.fetchSalaryDetails();
    },
  };
  </script>
  
  <style scoped>
  .salary-slip-card {
    padding: 20px;
  }
  
  .salary-title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }
  
  .salary-section {
    margin-bottom: 20px;
  }
  
  .tax-section {
    margin-top: 20px;
  }
  
  .salary-section strong,
  .tax-section strong {
    font-weight: bold;
  }
  
  .v-divider {
    margin: 20px 0;
  }
  </style>
  