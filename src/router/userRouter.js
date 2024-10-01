import Login from '@/views/Login.vue';
import EmployeeManagement from '@/views/user/employee-management.vue';

export const userRouter = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/employee-management',
    name: 'employee-management',
    component: EmployeeManagement,
  }

];


