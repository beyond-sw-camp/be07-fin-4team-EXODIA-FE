// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/Login.vue';
import { videoRouter } from './videoRouter';
import { userRouter } from './userRouter';
import { documentRouter } from './documentRouter';
import { mypageRouter } from './mypageRouter';
import { reservationRouter } from './reservationRouter';
import { chatRouter } from './chatRouter';
import { boardRouter } from './boardRouter';
import { calendarRouter } from './calendarRouter';
import { positionRouter } from './positionRouter';
import { qnaRouter } from './qnaRouter';
import { notificationRouter } from './notificationRouter';
import { submitRouter } from './submitRouter';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
<<<<<<< HEAD
  ...userRouter,
  ...videoRouter,
  ...documentRouter,
  ...mypageRouter,
  ...reservationRouter,
  ...boardRouter,
  ...calendarRouter,
  ...positionRouter,
  ...qnaRouter,
  ...notificationRouter,
  ...submitRouter,
  ...chatRouter,
=======
  {
    path: '/login',
    name: 'Login',
    component: LoginPage, 
  },
      ...userRouter,
      ...videoRouter,
      ...documentRouter,
      ...mypageRouter,
      ...reservationRouter,
      ...boardRouter,
      ...calendarRouter,
      ...positionRouter,
      ...notificationRouter,
      ...submitRouter,
      ...chatRouter,

>>>>>>> 047dd701b26383b2365906cda60914526b093de2
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
