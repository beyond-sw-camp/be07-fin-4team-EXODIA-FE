import ChartTemplate from '@/views/datachart/ChartTemplate.vue'; 
import GenderPieChart from '@/views/datachart/GenderPieChart.vue'; 
import HireTypePieChart from '@/views/datachart/HireTypePieChart.vue';
import YearlyHireResignationChart from '@/views/datachart/YearlyHireResignationChart.vue';
import DepartmentRankChart from '@/views/datachart/DepartmentRankChart.vue';
import PositionRankChart from '@/views/datachart/PositionRankChart.vue';
import SalaryDistributionChart from '@/views/datachart/SalaryDistributionChart.vue';
import SeniorityChart from '@/views/datachart/SeniorityChart.vue';

export const dataRouter = [
  {
    path: '/statistics', 
    name: 'StatsPage',
    component: ChartTemplate,
  },
  {
    path: '/statistics/gender-pie-chart',  
    name: 'GenderPieChart',
    component: GenderPieChart,
  },
  {
    path: '/statistics/hire-type-pie-chart',
    name: 'HireTypePieChart',
    component: HireTypePieChart,
  },
  {
    path: '/statistics/yearly-hire-resignation-chart',
    name: 'YearlyHireResignationChart',
    component: YearlyHireResignationChart,
  },
  {
    path: '/statistics/department-rank-chart',
    name: 'DepartmentRankChart',
    component: DepartmentRankChart,
  },
  {
    path: '/statistics/position-rank-chart',
    name: 'PositionRankChart',
    component: PositionRankChart,
  },
  {
    path: '/statistics/salary-distribution-chart',
    name: 'SalaryDistributionChart',
    component: SalaryDistributionChart,
  },
  {
    path: '/statistics/seniority-chart',
    name: 'SeniorityChart',
    component: SeniorityChart,
  },
];
