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
    props: ['yearlyData'],
    computed: {
      chartData() {
        return {
          labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
          datasets: [
            {
              label: '입사자 수',
              backgroundColor: '#42A5F5',
              data: this.yearlyData.입사,
            },
            {
              label: '퇴사자 수',
              backgroundColor: '#FF7043',
              data: this.yearlyData.퇴사,
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
  