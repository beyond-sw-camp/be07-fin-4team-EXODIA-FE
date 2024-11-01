// import VideoRoomList from '@/views/video/VideoRoomList.vue'; 
// import CreateRoomPage from '@/views/video/CreateRoomPage.vue'; 
import VideoRoom from '@/views/video/VideoRoom.vue';
import VideoCreate from '@/views/video/RoomCreate.vue';
import VideoList from '@/views/video/RoomList.vue';

// import VideoCall from '@/views/video/VideoCall.vue';


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
    path: '/video/room/:sessionId', 
    name: 'VideoRoom',
    component: VideoRoom,
    props: route => ({
      sessionId: route.params.sessionId
    })
  }
  
  
]