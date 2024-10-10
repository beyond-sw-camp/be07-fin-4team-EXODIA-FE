// import Login from '@/views/Login.vue';
import EmployeeManagement from '@/views/user/employee-management.vue';
import EmployeeForm from '@/views/user/employee-template.vue'
import DepartmentList from '@/views/user/departmentList.vue'


export const userRouter = [
  // {
  //   path: '/login',
  //   name: 'login',
  //   component: Login,
  // },
  {
    path: '/employee-management',
    name: 'employee-management',
    component: EmployeeManagement,
  },
  {
    path: '/employee-management/create',
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
  {
    path: '/department-management',
    name: 'department-management',
    component: DepartmentList,
  },

];


