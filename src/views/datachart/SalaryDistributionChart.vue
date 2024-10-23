<template>
    <div>
      <BarChart :chartData="chartData" />
    </div>
  </template>
  
  <script>
  import { Bar } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
  ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
  
  export default {
    props: ['salaryData'],
    computed: {
      chartData() {
        return {
          labels: this.salaryData.map(salary => salary.range),
          datasets: [
            {
              label: '연봉 범위별 인원',
              backgroundColor: '#FFA726',
              data: this.salaryData.map(salary => salary.count),
            }
          ]
        };
      }
    },
    components: {
      BarChart: Bar
    }
  };
  </script>
  