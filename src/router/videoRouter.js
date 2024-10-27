// import VideoRoomList from '@/views/video/VideoRoomList.vue'; 
// import CreateRoomPage from '@/views/video/CreateRoomPage.vue'; 
import VideoRoom from '@/views/video/VideoRoom.vue';
import VideoCreate from '@/views/video/RoomCreate.vue';
import VideoList from '@/views/video/RoomList.vue';

// import VideoCall from '@/views/video/VideoCall.vue';


export const videoRouter = [
  // {
  //   path: '/video/rooms',
  //   name: 'VideoRoomList',
  //   component: VideoRoomList,
  // },
  // {
  //   path: '/video-call',
  //   name: 'VideoCall',
  //   component: VideoCall,
  // },
  // {
  //   path: '/video/create',
  //   name: 'CreateRoomPage',
  //   component: CreateRoomPage,
  // },
  // {
  //   path: '/video/room/:roomId',
  //   name: 'VideoRoom',
  //   component: VideoRoom,
  //   props: route => ({
  //     roomId: Number(route.params.roomId), 
  //     roomName: route.params.roomName
  //   })
  // }
  {
    path: '/video/list',
    name: 'VideoRoom',
    component: VideoList,
  },
  {
    path: '/video/create',
    name: 'VideoCreate',
    component: VideoCreate,
  },
  {
    path: '/video/room/:sessionId',
    name: 'VideoRoom',
    component: VideoRoom,
    props: true
  },
]