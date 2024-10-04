import positionManagment from "@/views/position/position-managment.vue";
import SalaryView from '@/views/user/salaryView.vue';
import salaryManagment from '@/views/user/salary-managment.vue';

export const positionRouter = [
    {
        path: '/position-management',
        name: 'positionManagment',
        component: positionManagment,
    },
    {
        path: '/salary-view/:userNum',
        name: 'salaryView',
        component: SalaryView,
      },
      {
        path: '/salary-management',
        name: 'salaryManagment',
        component: salaryManagment,
      },
];
