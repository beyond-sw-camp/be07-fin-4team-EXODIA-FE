<template>
    <div>
      <PieChart :chartData="chartData" />
    </div>
  </template>
  
  <script>
  import { Pie } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
  ChartJS.register(Title, Tooltip, Legend, ArcElement);
  
  export default {
    props: ['hireTypeData'],
    computed: {
      chartData() {
        return {
          labels: ['정규직', '계약직', '인턴', '파트타임'],
          datasets: [
            {
              label: '채용 형태 비율',
              backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#FF7043'],
              data: Object.values(this.hireTypeData),
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
  