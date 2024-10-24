<!-- src/views/VideoCall.vue -->
<template>
  <v-app>
    <v-container>
      <v-card>
        <v-card-title>화상회의 테스트</v-card-title>
        <v-card-text>
          <video ref="localVideo" autoplay playsinline muted></video>
          <video v-for="participant in participants" :key="participant.id" autoplay playsinline></video>
          <v-btn v-create @click="startCall">Start Call</v-btn>
          <v-btn v-delete @click="endCall">End Call</v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
import videoService from '@/services/video.js';

export default {
  name: 'VideoCall',
  data() {
    return {
      localStream: null,
      participants: [],
      myRoom: 1234,
    };
  },
  methods: {
    startCall() {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          this.localStream = stream;
          this.$refs.localVideo.srcObject = stream;

          videoService.initJanus(() => {
            videoService.joinRoom(this.myRoom, '사용자', () => {
              videoService.publishOwnFeed(this.localStream);
            });
          });
        })
        .catch((error) => {
          console.error('미디어 장치 접근 오류:', error);
          alert('카메라/마이크 접근에 실패했습니다.');
        });
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
video {
  width: 400px;
  height: 300px;
  margin: 10px;
}
</style>