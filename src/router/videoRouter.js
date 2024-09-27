// import VideoCall from '@/views/video/VideoCall.vue';

// export const videoRouter = [
//     {
//       path: '/video-call',
//       name: 'VideoCall',
//       component: VideoCall,
//     },
//     {
//       path: '/video-room',
//       name: 'VideoRoom',
//       component: VideoRoom,
//     }
//   ];


import VideoRoomList from '@/views/video/VideoRoomList.vue'; 
import CreateRoomPage from '@/views/video/CreateRoomPage.vue'; 
import VideoRoom from '@/views/video/VideoRoom.vue';
import VideoCall from '@/views/video/VideoCall.vue';


export const videoRouter = [

  {
    path: '/video/rooms',
    name: 'VideoRoomList',
    component: VideoRoomList,
  },
      {
      path: '/video-call',
      name: 'VideoCall',
      component: VideoCall,
    },
  {
    path: '/video/create',
    name: 'CreateRoomPage',
    component: CreateRoomPage,
  },  
    {
    path: '/video/room/:roomName', 
    name: 'VideoRoom',
    component: VideoRoom,
    props: true
  }
];
