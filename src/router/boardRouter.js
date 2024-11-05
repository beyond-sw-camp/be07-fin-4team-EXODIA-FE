// src/router/boardRouter.js
import BoardList from "@/views/board/BoardList.vue";
import BoardCreate from "@/views/board/BoardCreate.vue";
import BoardUpdate from "@/views/board/BoardUpdate.vue";
import BoardDetail from "@/views/board/BoardDetail.vue";
import CourseList from "@/views/board/CourseList.vue";




export const boardRouter = [

  {
    path: '/board/:category/list',
    name: 'BoardList',
    component: BoardList,
    props: true,

  },
  {
    path: '/board/:category/create',
    name: 'BoardCreate',
    component: BoardCreate,
    props: true,
  },
  {
    path: '/board/update/:id',
    name: 'BoardUpdate',
    component: BoardUpdate,
    props: true,
  },
  {
    path: '/board/detail/:id',
    name: 'BoardDetail',
    component: BoardDetail,
    props: true,
  },

  {
    path: '/board/courseList',
    name: 'CourseList',
    component: CourseList,
  },
];
