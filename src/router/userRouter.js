import Login from '@/views/Login.vue';
import EmployeeManagement from '@/views/user/employee-management.vue';
import EmployeeDetail from '@/views/user/employee-detail.vue';
import EmployeeEdit from '@/views/user/employee-edit.vue';
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
  {
    path: '/employee-management/detail/:userNum',
    name: 'employee-detail',
    component: EmployeeDetail,
    props: true, 
  },
  {
    path: '/employee-management/edit/:userNum',
    name: 'employee-edit',
    component: EmployeeEdit,
    props: true, 
  },
];


