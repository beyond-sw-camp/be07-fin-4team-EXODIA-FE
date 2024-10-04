<template>
    <div>
      <h1>직급 및 호봉별 연봉 관리</h1>
  
      <div v-for="positionSalary in positionSalaries" :key="positionSalary.id">
        <p>직급: {{ positionSalary.position.name }} | 연차: {{ positionSalary.yearsOfExperience }}</p>
        <p>기본 연봉: 
          <input type="number" v-model="positionSalary.baseSalary" />
          <button @click="updatePositionSalary(positionSalary)">수정</button>
        </p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        positionSalaries: [], 
      };
    },
    async mounted() {
      this.fetchPositionSalaries();
    },
    methods: {
      async fetchPositionSalaries() {
        try {
          const response = await this.$axios.get("/position-salary");
          this.positionSalaries = response.data;
        } catch (error) {
          console.error("Error fetching position salaries:", error);
        }
      },
      async updatePositionSalary(positionSalary) {
        try {
          await this.$axios.post("/position-salary/update", positionSalary);
          alert("연봉 정보가 수정되었습니다.");
        } catch (error) {
          console.error("Error updating position salary:", error);
        }
      },
    },
  };
  </script>
  