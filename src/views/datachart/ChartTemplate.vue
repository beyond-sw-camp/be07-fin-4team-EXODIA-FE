<template>
    <div>
      <h1>통계 데이터 시각화</h1>
  
      <div v-if="genderData">
        <h2>성별 비율</h2>
        <GenderPieChart :genderData="genderData" />
      </div>
  
      <div v-if="hireTypeData">
        <h2>채용 형태 비율</h2>
        <HireTypePieChart :hireTypeData="hireTypeData" />
      </div>
  
      <div v-if="yearlyData">
        <h2>년도별 입사/퇴사자 수</h2>
        <YearlyHireResignationChart :yearlyData="yearlyData" />
      </div>
  
      <div v-if="departmentRankData">
        <h2>부서별 채용 순위</h2>
        <DepartmentRankChart :departmentRankData="departmentRankData" />
      </div>
  
      <div v-if="positionRankData">
        <h2>직급 순위</h2>
        <PositionRankChart :positionRankData="positionRankData" />
      </div>
  
      <div v-if="salaryData">
        <h2>연봉 분포</h2>
        <SalaryDistributionChart :salaryData="salaryData" />
      </div>
  
      <div v-if="seniorityData">
        <h2>근속 연수</h2>
        <SeniorityChart :seniorityData="seniorityData" />
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import GenderPieChart from '@/views/datachart/GenderPieChart.vue';
  import HireTypePieChart from '@/views/datachart/HireTypePieChart.vue';
  import YearlyHireResignationChart from '@/views/datachart/YearlyHireResignationChart.vue';
  import DepartmentRankChart from '@/views/datachart/DepartmentRankChart.vue';
  import PositionRankChart from '@/views/datachart/PositionRankChart.vue';
  import SalaryDistributionChart from '@/views/datachart/SalaryDistributionChart.vue';
  import SeniorityChart from '@/views/datachart/SeniorityChart.vue';
  
  export default {
    data() {
      return {
        genderData: null,
        hireTypeData: null,
        yearlyData: null,
        departmentRankData: null,
        positionRankData: null,
        salaryData: null,
        seniorityData: null,
      };
    },
    components: {
      GenderPieChart,          
      HireTypePieChart,        
      YearlyHireResignationChart, 
      DepartmentRankChart,     
      PositionRankChart,      
      SalaryDistributionChart, 
      SeniorityChart,          
    },
    mounted() {
      this.fetchStatistics();
    },
    methods: {
      async fetchStatistics() {
        try {
      const genderResponse = await axios.get('/stats/gender');
      this.genderData = genderResponse.data;
      console.log("성별 통계 데이터:", this.genderData);
  
        const hireTypeResponse = await axios.get('/stats/hireType');
        this.hireTypeData = hireTypeResponse.data;
  
        const yearlyResponse = await axios.get('/stats/yearlyHireAndResignation/2023');
        this.yearlyData = yearlyResponse.data;
  
        const departmentRankResponse = await axios.get('/stats/departmentRanking');
        this.departmentRankData = departmentRankResponse.data;
  
        const positionRankResponse = await axios.get('/stats/positionRanking');
        this.positionRankData = positionRankResponse.data;
  
        const salaryResponse = await axios.get('/stats/salaryDistribution');
        this.salaryData = salaryResponse.data;
  
        const seniorityResponse = await axios.get('/stats/seniority');
        this.seniorityData = seniorityResponse.data;
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
    }
      }
    }
  };
  </script>
  