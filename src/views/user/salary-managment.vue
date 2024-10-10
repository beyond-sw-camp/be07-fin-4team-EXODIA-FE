<template>
  <v-container class="mt-5">
    <v-card class="mx-auto" max-width="1000">
      <v-card-title>
        <h3>급여 관리</h3>
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="selectedPosition"
              :items="positions"
              item-title="name"
              item-value="id"
              label="직급별 조회"
              @change="fetchSalariesByPosition"
            />
          </v-col>

          <v-col cols="12" md="6" class="text-right">
            <v-btn color="primary" @click="fetchSalaries">전체 조회</v-btn>
          </v-col>
        </v-row>

        <v-data-table :headers="headers" :items="salaries" class="elevation-1 mt-5">
          <template v-slot:[`item.yearsOfService`]="{ item }">
            <span>{{ item.yearsOfService }}년차</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      salaries: [], // 급여 데이터
      positions: [], // 직급 목록
      selectedPosition: null, // 선택된 직급
      headers: [
        { text: '사번', value: 'userNum' },
        { text: '이름', value: 'userName' },
        { text: '부서', value: 'departmentName' },
        { text: '직급', value: 'positionName' },
        { text: '기본급', value: 'baseSalary' },
        { text: '입사일', value: 'yearsOfService' }, // 입사일 (년차로 계산)
      ],
    };
  },
  methods: {
    async fetchSalaries() {
      try {
        const response = await this.$axios.get('/salary');
        this.salaries = response.data;
      } catch (error) {
        console.error('급여 목록을 가져오는 중 오류가 발생했습니다:', error);
      }
    },
    async fetchSalariesByPosition() {
      if (this.selectedPosition) {
        try {
          const response = await this.$axios.get(`/salary/byPosition/${this.selectedPosition}`);
          this.salaries = response.data;
        } catch (error) {
          console.error('직급별 급여 목록을 가져오는 중 오류가 발생했습니다:', error);
        }
      } else {
        this.fetchSalaries();
      }
    },
    async fetchPositions() {
      try {
        const response = await this.$axios.get('/positions');
        this.positions = response.data;
      } catch (error) {
        console.error('직급 목록을 가져오는 중 오류가 발생했습니다:', error);
      }
    },
  },
  mounted() {
    this.fetchSalaries(); 
    this.fetchPositions(); 
  },
};
</script>

<style scoped>
.salary-container {
  margin: 20px;
}

.v-card-title {
  padding-bottom: 10px;
}

.v-card-text {
  padding-top: 0;
}

.v-btn {
  margin-right: 10px;
}

.v-data-table {
  margin-top: 20px;
}

.red--text {
  color: #f44336 !important;
}
</style>
