import Login from '@/views/Login.vue';
import EmployeeManagement from '@/views/user/employee-management.vue';
// import employeeRegister from '@/views/user/employeeRegister.vue';
import EmployeeForm from '@/views/user/employee-template.vue'


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
  },

  // {
  //   path: '/employee-management/create',
  //   name: 'employeeRegister',
  //   component: employeeRegister,
  // },

  {
    path: '/employee-management/register',
    name: 'employee-register',
    component: EmployeeForm,
  },
  {
    path: '/employee-management/edit/:userNum',
    name: 'employee-edit',
    component: EmployeeForm,
  },
  {
    path: '/employee-management/detail/:userNum',
    name: 'employee-detail',
    component: EmployeeForm,
  },
  
];


