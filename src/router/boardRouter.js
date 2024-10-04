// src/router/boardRouter.js
import BoardList from "@/views/board/BoardList.vue";
import BoardCreate from "@/views/board/BoardCreate.vue";
import BoardUpdate from "@/views/board/BoardUpdate.vue";
import BoardDetail from "@/views/board/BoardDetail.vue";

export const boardRouter = [

  {
    path: '/board/:category/list',
    name: 'BoardList',
    component: BoardList,

  },
  {
    path: '/board/create',
    name: 'BoardCreate',
    component: BoardCreate,
  },
  {
    path: '/board/update/:id',
    name: 'BoardUpdate',
    component: BoardUpdate
  },
  {
    path: '/board/detail/:id',
    name: 'BoardDetail',
    component: BoardDetail,
  },
];
