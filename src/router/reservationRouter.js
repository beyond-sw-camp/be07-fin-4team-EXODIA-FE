import reservationList from "@/views/reservation/reservationList.vue";
import meetReservationList from "@/views/reservation/meetReservationList"

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
   

];
