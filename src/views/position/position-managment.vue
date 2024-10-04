<template>
    <div>
      <h1>직급 및 호봉별 연봉 관리</h1>
  
      <!-- 직급 추가 폼 -->
      <form @submit.prevent="createPosition">
        <input v-model="newPosition.name" placeholder="직급 이름" />
        <button type="submit">직급 추가</button>
      </form>
  
      <!-- 직급별 연봉 목록 및 수정 -->
      <div v-for="position in positions" :key="position.id">
        <h3>{{ position.name }}</h3>
  
        <div v-for="salary in position.salaries" :key="salary.id">
          <p>호봉: {{ salary.yearsOfExperience }} | 기본 연봉: {{ salary.baseSalary }}</p>
          <input v-model="salary.baseSalary" />
          <button @click="updatePositionSalary(salary)">수정</button>
        </div>
  
        <!-- 새로운 호봉 추가 폼 -->
        <form @submit.prevent="addPositionSalary(position.id)">
          <input v-model="newSalary.yearsOfExperience" placeholder="연차" type="number" />
          <input v-model="newSalary.baseSalary" placeholder="기본 연봉" type="number" />
          <button type="submit">호봉 추가</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        positions: [], // 직급 목록
        newPosition: { name: '' }, // 새 직급 추가용 데이터
        newSalary: { yearsOfExperience: 1, baseSalary: 0 }, // 새 연차별 연봉 추가용 데이터
      };
    },
    async mounted() {
      this.fetchPositions();
    },
    methods: {
      // 직급 목록 불러오기
      async fetchPositions() {
        try {
          const response = await this.$axios.get("/positions");
          this.positions = response.data;
        } catch (error) {
          console.error("Error fetching positions:", error);
        }
      },
      // 직급 추가
      async createPosition() {
        try {
          const response = await this.$axios.post("/positions", this.newPosition);
          this.positions.push(response.data);
          this.newPosition.name = ''; // 입력 초기화
        } catch (error) {
          console.error("Error creating position:", error);
        }
      },
      // 연차별 연봉 추가
        async addPositionSalary(positionId) {
          try {
            const response = await this.$axios.post(`/positions/${positionId}/salaries`, this.newSalary);
            const position = this.positions.find(p => p.id === positionId);

            // position 객체에 salaries 배열이 존재하지 않으면 초기화
            if (!position.salaries) {
              position.salaries = [];
            }

            position.salaries.push(response.data); // 새로운 호봉 연봉 데이터를 추가
            this.newSalary.yearsOfExperience = 1;
            this.newSalary.baseSalary = 0;
          } catch (error) {
            console.error("Error adding salary:", error);
          }
        },
      // 연차별 연봉 수정
      async updatePositionSalary(salary) {
        try {
          await this.$axios.put(`/salaries/${salary.id}`, salary);
          alert("연봉이 수정되었습니다.");
        } catch (error) {
          console.error("Error updating salary:", error);
        }
      }
    }
  };
  </script>
  