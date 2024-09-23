import {createRouter, createWebHistory} from 'vue-router';
import HomePage from '@/views/HomePage.vue';
// import { memberRouter } from './memberRouter';
// import { boardRouter } from './boardRouter';
// import { subjectRouter } from './subjectRouter';
// import { qnaRouter } from './qnaRouter';
// import { reportRouter } from './reportRouter';
// import { chatRouter } from './chatRouter'; 

const routes = [
    {
        path: '/',
        name: 'HOME',
        component: HomePage
    },
    // ...memberRouter,
    // ...boardRouter,
    // ...subjectRouter,
    // ...qnaRouter,
    // ...reportRouter,
    // ...chatRouter,
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;