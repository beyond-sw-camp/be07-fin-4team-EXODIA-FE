import calendarList from '@/views/calendar/calendarList.vue'
import mainCalendarList from '@/views/calendar/mainCalendarList.vue'


export const calendarRouter = [
    {
        path: '/calendar/calendarList',
        name: 'calendarList',
        component: calendarList,
    },
    {
        path: '/calendar/mainCalendarList',
        name: 'mainCalendarList',
        component: mainCalendarList,
    },

];
