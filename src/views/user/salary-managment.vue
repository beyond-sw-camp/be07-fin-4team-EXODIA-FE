<template>
  <div class="salary-container">
    <h1>급여 관리</h1>

    <v-select
      v-model="selectedPosition"
      :items="positions"
      item-title="name"
      item-value="id"
      label="직급별 조회"
      @change="fetchSalariesByPosition"
    />
    <v-btn color="primary" @click="fetchSalaries">전체 조회</v-btn>

    <v-data-table :headers="headers" :items="salaries" class="elevation-1">
      <template v-slot:[`item.yearsOfService`]="{ item }">
        <span>{{ item.yearsOfService }}년차</span>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      salaries: [], 
      positions: [], 
      selectedPosition: null,
      headers: [
        { text: '사번', value: 'userNum' },
        { text: '이름', value: 'userName' },
        { text: '부서', value: 'departmentName' },
        { text: '직급', value: 'positionName' },
        { text: '기본급', value: 'baseSalary' },
        { text: '입사일', value: 'yearsOfService' }, 
      ],
    };
  },
  methods: {
    async fetchSalaries() {
      try {
        const response = await this.$axios.get('/salary');
        this.salaries = response.data;
      } catch (error) {
        console.error('Error fetching salaries:', error);
      }
    },
    async fetchSalariesByPosition() {
      if (this.selectedPosition) {
        try {
          const response = await this.$axios.get(`/salary/byPosition/${this.selectedPosition}`);
          this.salaries = response.data;
        } catch (error) {
          console.error('Error fetching salaries by position:', error);
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
        console.error('Error fetching positions:', error);
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
</style>
