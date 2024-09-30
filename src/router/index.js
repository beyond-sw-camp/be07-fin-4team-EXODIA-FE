// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import { videoRouter } from './videoRouter'; 
import { userRouter } from './userRouter'; 


const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  ...userRouter,
  ...videoRouter
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
