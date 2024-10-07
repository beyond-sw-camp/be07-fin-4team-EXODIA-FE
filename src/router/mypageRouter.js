import mypageList from '@/views/mypage/userProfile.vue'
import AttendanceRecord from '@/views/mypage/attendance.vue';
import SpinWheel from '@/views/mypage/SpinWheel.vue';
import evalutionList from '@/views/mypage/evalution.vue';

export const mypageRouter = [
    {
        path: '/mypage/userProfile',
        name: 'mypageList',
        component: mypageList,
    },
    {
        path: '/mypage/attendance',
        name: 'AttendanceRecord',
        component: AttendanceRecord,
    },
    {
        path: '/mypage/spinWheel',
        name: 'SpinWheel',
        component: SpinWheel,
    },
    {
        path: '/mypage/evalution',
        name: 'evalutionList',
        component: evalutionList,
    }



];
