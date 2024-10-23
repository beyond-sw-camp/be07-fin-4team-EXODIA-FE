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
    props: ['departmentRankData'],
    computed: {
      chartData() {
        return {
          labels: this.departmentRankData.map(dept => dept.department),
          datasets: [
            {
              label: '채용 순위',
              backgroundColor: '#42A5F5',
              data: this.departmentRankData.map(dept => dept.count),
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
  