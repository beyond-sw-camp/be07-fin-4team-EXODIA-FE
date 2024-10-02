import ChatRoomView from '@/components/chat/ChatRoomView.vue';
import ChatRoomCreate from '@/components/chat/ChatRoomCreate.vue';

export const chatRouter = [
    {
        path: '/chat/create',
        name: 'chatRoomCreatePage',
        component: ChatRoomCreate,
    },
    {
        path: '/chatRoom/1',
        name: 'ChatRoom',
        component: ChatRoomView,
        // props: route => ({
        //   roomId: Number(route.params.roomId), 
        //   roomName: route.params.roomName
        // })
    }
]