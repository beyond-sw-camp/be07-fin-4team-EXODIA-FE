<template>
  <v-container class="mt-5 salary-container">
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
              outlined
            />
          </v-col>

          <v-col cols="12" md="6" class="text-right">
            <v-btn color="primary" @click="fetchSalaries">전체 조회</v-btn>
          </v-col>
        </v-row>

        <!-- Custom Table -->
        <table class="employee-table">
          <thead>
            <tr style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:600;">
              <th>번호</th>
              <th>사번</th>
              <th>이름</th>
              <th>부서</th>
              <th>직급</th>
              <th>기본급</th>
              <th>연차</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(salary, index) in salaries"
              :key="salary.userNum"
              @click="viewSalaryDetails(salary.userNum)"
              class="table-row"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ salary.userNum }}</td>
              <td>{{ salary.userName }}</td>
              <td>{{ salary.departmentName }}</td>
              <td>{{ salary.positionName }}</td>
              <td>{{ salary.baseSalary.toLocaleString() }} 원</td>
              <td>{{ salary.yearsOfService }}년차</td>
            </tr>
          </tbody>
        </table>

        <div v-if="salaries.length === 0">
          <v-alert type="info" class="mt-3">
            급여 데이터를 찾을 수 없습니다.
          </v-alert>
        </div>
      </v-card-text>
    </v-card>
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
  methods: {
    async fetchSalaries() {
      try {
        const response = await axios.get("/salary");
        this.salaries = response.data;
      } catch (error) {
        console.error("급여 목록을 가져오는 중 오류가 발생했습니다.", error);
      }
    },
    async fetchSalariesByPosition() {
      if (this.selectedPosition) {
        try {
          const response = await axios.get(`/salary/byPosition/${this.selectedPosition}`);
          this.salaries = response.data;
        } catch (error) {
          console.error("직급별 급여 목록을 가져오는 중 오류가 발생했습니다.", error);
        }
      } else {
        this.fetchSalaries();
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

.v-btn {
  margin-right: 10px;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.employee-table th,
.employee-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.employee-table th {
  font-weight: bold;
  color: #444444;
}

.employee-table tr:hover {
  background-color: #fafafa;
  cursor: pointer;
}

.table-row {
  transition: background-color 0.3s;
}
</style>
