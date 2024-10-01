import Login from '@/views/Login.vue';
import employeeManagement from '@/views/user/employee-management.vue';
// import {jwtdecode} from "jwt-decode";

export const userRouter = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/employee-management',
    name: 'employeeManagement',
    component: employeeManagement,
  }
  
  
];
