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
    props: ['seniorityData'],
    computed: {
      chartData() {
        return {
          labels: Object.keys(this.seniorityData),
          datasets: [
            {
              label: '근속 연수별 인원',
              backgroundColor: '#FF6384',
              data: Object.values(this.seniorityData),
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
  