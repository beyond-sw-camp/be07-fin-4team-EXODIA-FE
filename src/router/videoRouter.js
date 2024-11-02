import VideoRoom from '@/views/video/VideoRoom.vue';
import VideoCreate from '@/views/video/RoomCreate.vue';
import VideoList from '@/views/video/RoomList.vue';

export const videoRouter = [
  {
    path: '/video/list',
    name: 'RoomList',
    component: VideoList,
  },
  {
    path: '/video/create',
    name: 'VideoCreate',
    component: VideoCreate,
  },
  {
    path: '/video/room/:sessionId/:token',
    name: 'VideoRoom',
    component: VideoRoom,
    props: true,
  }
];
