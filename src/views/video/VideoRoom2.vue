<template>
    <div class="video-room">
      <video ref="localVideo" autoplay playsinline></video>
      <video v-for="participant in participants" :key="participant.id" autoplay playsinline></video>
      <button @click="startCall">Start Call</button>
      <button @click="endCall">End Call</button>
    </div>
  </template>
  
  <script>
  import videoService from '@/services/video.js';
  
  export default {
    data() {
      return {
        localStream: null,
        participants: [],
        myRoom: 1234 
      };
    },
    methods: {
      async startCall() {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          this.$refs.localVideo.srcObject = this.localStream;
  
          videoService.initJanus(() => {
            videoService.joinRoom(this.myRoom, '사용자', () => {
              videoService.publishOwnFeed(this.localStream);
            });
          });
        } catch (error) {
          console.error('미디어 장치 접근 오류:', error);
          alert('카메라/마이크 접근에 실패했습니다.');
        }
      },
      endCall() {
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => track.stop());
        }
        if (videoService.sfutest) {
          videoService.sfutest.detach();
        }
        if (videoService.janus) {
          videoService.janus.destroy();
        }
        this.localStream = null;
        this.participants = [];
      }
    },
    beforeUnmount() {
      this.endCall();
    }
  };
  </script>
  
  <style scoped>
  .video-room {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  video {
    width: 320px;
    height: 240px;
    margin: 10px;
  }
  </style>
  