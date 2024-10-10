import SubmitCreate from "@/views/submit/SubmitCreate.vue";
import SubmitList from "@/views/submit/SubmitList.vue";
import MySubmitList from "@/views/submit/MySubmitList.vue";
import SubmitDetailComponent from "@/components/submit/SubmitDetailComponent.vue";

export const submitRouter = [

    {
        path: '/submit',
        name: 'SubmitCreate',
        component: SubmitCreate,
    },
    {
        // 나에게 온 요청
        path: '/submit/list',
        name: 'SubmitList',
        component: SubmitList,
    },
    {
        // 내가 한 요청
        path: '/submit/list/my',
        name: 'MySubmitList',
        component: MySubmitList,
    },
    {
        path: '/submit/detail/:submitId',
        name: 'SubmitDetailComponent',
        component: SubmitDetailComponent,
    }
];
