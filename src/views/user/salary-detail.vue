<template>
    <v-container class="mt-5">
      <v-card class="mx-auto" max-width="600">
        <v-card-title>
          <h3>급여 명세서</h3>
        </v-card-title>
  
        <v-card-text v-if="salary">
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>사번: {{ salary.userNum }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>이름: {{ salary.userName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>부서: {{ salary.departmentName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>직급: {{ salary.positionName }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>기본급: {{ salary.baseSalary.toLocaleString() }} 원</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>연차: {{ salary.yearsOfService }}년차</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-divider></v-divider>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>국민연금: {{ salary.nationalPension ? salary.nationalPension.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>건강보험: {{ salary.healthInsurance ? salary.healthInsurance.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>장기요양보험: {{ salary.longTermCare ? salary.longTermCare.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>고용보험: {{ salary.employmentInsurance ? salary.employmentInsurance.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-divider></v-divider>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>총 세금: {{ salary.totalTax ? salary.totalTax.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
  
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>최종 연봉: {{ salary.finalSalary.toLocaleString() }} 원</v-list-item-title>
              </v-list-item-content>
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
  
  