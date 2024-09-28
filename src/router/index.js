// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import { videoRouter } from './videoRouter';
import { userRouter } from './userRouter';
import { documentRouter } from './documentRouter';



const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  ...videoRouter,
  ...userRouter,
  ...documentRouter
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
