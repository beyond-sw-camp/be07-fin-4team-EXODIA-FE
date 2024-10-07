import reservationList from "@/views/reservation/reservationList.vue";
import meetReservationList from "@/views/reservation/meetReservationList"
import adminCarResList from "@/views/reservation/adminCarResList.vue"
export const reservationRouter = [
    {
        path: '/reservation/reservationList',
        name: 'reservationList',
        component: reservationList,
    },
    {
        path: '/reservation/meetReservationList',
        name: 'meetReservationList',
        component: meetReservationList,
    },
    {
        path: '/reservation/adminCarResList',
        name: 'adminCarResList',
        component: adminCarResList,
    }
   

];
