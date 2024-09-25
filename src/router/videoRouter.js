// import VideoCall from '@/views/video/VideoCall.vue';
// import VideoRoom from '@/views/video/VideoRoom.vue';

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

export const videoRouter = [

  {
    path: '/video/rooms',
    name: 'VideoRoomList',
    component: VideoRoomList,
  },
];
