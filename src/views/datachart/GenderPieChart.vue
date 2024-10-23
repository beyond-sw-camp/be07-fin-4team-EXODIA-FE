<template>
  <div v-if="chartData && chartData.labels && chartData.datasets">
    <PieChart :chartData="chartData" />
  </div>
  <div v-else>
    <p>데이터를 불러오는 중입니다...</p>
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default {
  props: ['genderData'],
  computed: {
    chartData() {
      if (!this.genderData || !this.genderData.M || !this.genderData.W) {
        return {
          labels: ['남성', '여성'],
          datasets: [
            {
              label: '성별 비율',
              backgroundColor: ['#36A2EB', '#FF6384'],
              data: [0, 0], 
            }
          ]
        };
      }
      return {
        labels: ['남성', '여성'],
        datasets: [
          {
            label: '성별 비율',
            backgroundColor: ['#36A2EB', '#FF6384'],
            data: [this.genderData.M, this.genderData.W], 
          }
        ]
      };
    }
  },
  components: {
    PieChart: Pie
  }
};
</script>
