<template>
  <v-container class="mt-5">
    <v-card class="mx-auto salary-slip-card" max-width="600">
      <v-card-title class="salary-title">
        급여 명세서
      </v-card-title>

      <v-card-text v-if="salary">
        <v-list dense>
          <!-- 기본 정보 섹션 -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>사번:</strong> {{ salary.userNum }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>이름:</strong> {{ salary.userName }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>부서:</strong> {{ salary.departmentName }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>직급:</strong> {{ salary.positionName }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>연차:</strong> {{ salary.yearsOfService }}년차</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- 구분선 -->
          <v-divider></v-divider>

          <!-- 급여 정보 섹션 -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>기본급:</strong> {{ salary.baseSalary.toLocaleString() }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- 세금 정보 섹션 -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>국민연금:</strong> {{ salary.nationalPension ?
                salary.nationalPension.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>건강보험:</strong> {{ salary.healthInsurance ?
                salary.healthInsurance.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>장기요양보험:</strong> {{ salary.longTermCare ? salary.longTermCare.toLocaleString()
                : '정보 없음' }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>고용보험:</strong> {{ salary.employmentInsurance ?
                salary.employmentInsurance.toLocaleString() : '정보 없음' }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- 구분선 -->
          <v-divider></v-divider>

          <!-- 총 세금 및 최종 급여 -->
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>총 세금:</strong> {{ salary.totalTax ? salary.totalTax.toLocaleString() : '정보 없음'
                }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><strong>최종 연봉:</strong> {{ salary.finalSalary.toLocaleString() }} 원</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-text v-else>
        <v-alert type="info">
          급여 데이터를 찾을 수 없습니다.
        </v-alert>
      </v-card-text>

      <!-- 목록으로 돌아가기 버튼 -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-list @click="goBackToList">목록으로 돌아가기</v-btn>
      </v-card-actions>
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
    },
    goBackToList() {
      this.$router.push('/salary-management');
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

.v-list-item-title {
  font-size: 16px;
  line-height: 1.5;
}

.v-divider {
  margin: 15px 0;
}

.v-btn {
  margin: 10px;
}
</style>
