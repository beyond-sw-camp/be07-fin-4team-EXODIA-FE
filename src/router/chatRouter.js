import ChatRoomView from '@/components/chat/ChatRoomView.vue';
import ChatRoomCreate from '@/components/chat/ChatRoomCreate.vue';
import ChatRoomList from '@/views/chat/ChatRoomList.vue';

export const chatRouter = [
    {
        path: '/chat/create',
        name: 'chatRoomCreatePage',
        component: ChatRoomCreate,
    },

    {
        path: '/chat/list',
        name: 'chatRoomList',
        component: ChatRoomList,
    },

    {
        path: '/chatRoom/:id',
        name: 'ChatRoom',
        component: ChatRoomView,
        // props: route => ({
        //   roomId: Number(route.params.roomId), 
        //   roomName: route.params.roomName
        // })
    }
]