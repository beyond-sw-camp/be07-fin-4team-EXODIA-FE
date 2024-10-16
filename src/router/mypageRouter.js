import mypageList from '@/views/mypage/userProfile.vue'
import AttendanceRecord from '@/views/mypage/attendance.vue';
import evalutionFrame from '@/views/mypage/evalutionFrame.vue';
import SpinWheel from '@/views/mypage/SpinWheel.vue';
import evalutionList from '@/views/mypage/evalutionList.vue';
import UserAttendance from '@/views/mypage/userAttendance.vue';
import tmp from '@/views/mypage/tmp.vue'

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
        path: '/mypage/evalutionFrame',
        name: 'evalutionFrame',
        component: evalutionFrame,
    },
    {
        path: '/mypage/spinWheel',
        name: 'SpinWheel',
        component: SpinWheel,
    },
    {
        path: '/mypage/evalutionList',
        name: 'evalutionList',
        component: evalutionList,
    },
    {
        path: '/mypage/userAttendance',
        name: 'userAttendance',
        component: UserAttendance,
    },
    {
        path: '/mypage/tmp',
        name: 'tmp',
        component: tmp,
    }



];
