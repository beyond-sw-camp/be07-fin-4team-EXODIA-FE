<template>
  <v-container class="mt-5 salary-update-container">
    <v-card max-width="800" class="mx-auto">
      <v-card-title>
        <h3>급여 수정</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <!-- 사번 표시 -->
          <v-text-field v-model="salaryDetail.userNum" label="사번" readonly />

          <!-- 이름 표시 -->
          <v-text-field v-model="salaryDetail.userName" label="이름" readonly />

          <!-- 기본급 수정 -->
          <v-text-field
            v-model="salaryDetail.baseSalary"
            label="기본급 수정"
            type="number"
            required
          />

          <!-- 급여 %로 수정 -->
          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="percentage"
                label="급여 % 수정 (예: 1% 증가)"
                type="number"
                append-icon="mdi-percent"
                @input="calculateSalary"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-btn color="primary" v-apply @click="applyPercentage" :disabled="!percentage">적용</v-btn>

            </v-col>
          </v-row>

          <!-- 계산된 기본급 표시 -->
          <v-text-field
            v-model="calculatedSalary"
            label="계산된 기본급"
            type="number"
            readonly
            v-if="calculatedSalary !== null"
          />

          <!-- 저장 버튼 -->
          <v-row>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn color="primary" v-save type="submit">저장</v-btn>
              <v-btn v-close @click="goBack" outlined>취소</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      salaryDetail: {
        userNum: '',
        userName: '',
        baseSalary: 0,
      },
      percentage: 0,
      calculatedSalary: null,
    };
  },
  methods: {
    async fetchSalaryDetail() {
      const userNum = this.$route.params.userNum;
      try {
        const response = await axios.get(`/salary/detail/${userNum}`);
        this.salaryDetail = response.data;
        this.calculatedSalary = this.salaryDetail.baseSalary; // 계산된 기본급을 기본값으로 초기화
      } catch (error) {
        console.error('Error fetching salary detail:', error);
      }
    },
    calculateSalary() {
      if (this.percentage) {
        const percentageValue = this.percentage / 100;
        this.calculatedSalary = this.salaryDetail.baseSalary * (1 + percentageValue);
      }
    },
    applyPercentage() {
      if (this.calculatedSalary !== null) {
        this.salaryDetail.baseSalary = this.calculatedSalary; 
      }
    },
    async submitForm() {
      const userNum = this.salaryDetail.userNum;
      try {
        await axios.put(`/salary/update/${userNum}`, {
          userNum: this.salaryDetail.userNum,
          baseSalary: this.salaryDetail.baseSalary,  
          percentageAdjustment: this.percentage || null,  
          newFinalSalary: this.calculatedSalary || null, 
        });
        alert('급여가 수정되었습니다.');
        this.$router.push('/salary-management');
      } catch (error) {
        console.error('Error updating salary:', error);
      }
    },
    goBack() {
      this.$router.push('/salary-management');
    },
  },
  mounted() {
    this.fetchSalaryDetail(); // 초기 데이터 로드
  },
};
</script>

<style scoped>
.salary-update-container {
  margin-top: 50px;
}

.v-card-title {
  font-weight: bold;
  padding-bottom: 10px;
}

.v-btn {
  margin-right: 10px;
}
</style>
