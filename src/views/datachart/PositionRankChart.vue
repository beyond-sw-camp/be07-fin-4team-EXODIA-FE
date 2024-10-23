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
    props: ['positionRankData'],
    computed: {
      chartData() {
        return {
          labels: this.positionRankData.map(pos => pos.position),
          datasets: [
            {
              label: '직급별 인원',
              backgroundColor: '#66BB6A',
              data: this.positionRankData.map(pos => pos.count),
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
  