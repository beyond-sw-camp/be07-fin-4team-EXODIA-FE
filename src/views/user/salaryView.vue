<template>
    <div>
      <h1>내 연봉 명세서</h1>
      <div v-if="salary">
        <p>기본 연봉: {{ salary.baseSalary }}</p>
        <p>세금: {{ salary.taxAmount }}</p>
        <p>최종 연봉: {{ salary.finalSalary }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        salary: null,
      };
    },
    async mounted() {
      try {
        const response = await this.$axios.get("/salary/my");
        this.salary = response.data;
      } catch (error) {
        console.error("Error fetching salary:", error);
      }
    },
  };
  </script>
  