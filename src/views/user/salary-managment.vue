<template>
  <v-container class="mt-5 salary-container">
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
            outlined
          />
        </v-col>

        <v-col cols="12" md="6" class="text-right">
          <v-btn color="primary" @click="fetchSalaries">전체 조회</v-btn>
        </v-col>
      </v-row>

      <!-- Custom Table -->
      <v-row justify="center" class="mt-4">
        <v-col cols="12">
          <v-row
            class="mb-2"
            style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:10px; color:#444444; font-weight:600;"
          >
            <v-col cols="1">번호</v-col>
            <v-col cols="2">사번</v-col>
            <v-col cols="2">이름</v-col>
            <v-col cols="3">부서</v-col>
            <v-col cols="2">직급</v-col>
            <v-col cols="2">기본급</v-col>
          </v-row>

          <v-row
            v-for="(salary, index) in salaries"
            :key="salary.userNum"
            class="table-row"
            @click="viewSalaryDetails(salary.userNum)"
            style="border-bottom: 1px solid #ddd; padding: 5px; font-weight:500;"
          >
            <v-col cols="1">{{ index + 1 }}</v-col>
            <v-col cols="2">{{ salary.userNum }}</v-col>
            <v-col cols="2">{{ salary.userName }}</v-col>
            <v-col cols="3">{{ salary.departmentName }}</v-col>
            <v-col cols="2">{{ salary.positionName }}</v-col>
            <v-col cols="2">{{ salary.baseSalary.toLocaleString() }} 원</v-col>
          </v-row>
        </v-col>
      </v-row>

      <div v-if="salaries.length === 0">
        <v-alert type="info" class="mt-3">
          급여 데이터를 찾을 수 없습니다.
        </v-alert>
      </div>
    </v-card-text>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "SalaryManagement",
  data() {
    return {
      salaries: [], // 급여 데이터
      positions: [], // 직급 목록
      selectedPosition: null, // 선택된 직급
    };
  },
  watch: {
    selectedPosition(newPosition) {
      this.fetchSalariesByPosition(newPosition);
    },
  },
  methods: {
    async fetchSalaries() {
      try {
        const response = await axios.get("/salary");
        this.salaries = response.data;
      } catch (error) {
        console.error("급여 목록을 가져오는 중 오류가 발생했습니다.", error);
      }
    },
    async fetchSalariesByPosition(positionId) {
      if (positionId) {
        try {
          const response = await axios.get(`/salary/byPosition/${positionId}`);
          this.salaries = response.data;
          console.log("직급별 급여 조회 성공:", this.salaries);
        } catch (error) {
          console.error("직급별 급여 목록을 가져오는 중 오류가 발생했습니다.", error);
        }
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get("/positions");
        this.positions = response.data;
      } catch (error) {
        console.error("직급 목록을 가져오는 중 오류가 발생했습니다.", error);
      }
    },
    viewSalaryDetails(userNum) {
      this.$router.push(`/salary/detail/${userNum}`);
    },
  },
  mounted() {
    this.fetchSalaries();
    this.fetchPositions();
  },
};
</script>
