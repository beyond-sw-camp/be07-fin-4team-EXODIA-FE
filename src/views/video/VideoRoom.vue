<!-- VideoRoom.vue -->
<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>
    
    <!-- 메인 비디오 -->
    <div class="main-video">
      <user-video :stream-manager="publisher" v-if="publisher"></user-video>
    </div>

    <!-- 다른 참가자 비디오들 -->
    <div class="side-videos">
      <user-video
        v-for="(subscriber, index) in subscribers"
        :key="index"
        :stream-manager="subscriber"
        @click="switchToMain(subscriber)"
      ></user-video>
    </div>
    
    <!-- 제어 아이콘 버튼들 -->
    <v-row class="controls" justify="center">
      <v-btn icon @click="toggleAudio">
        <v-icon>{{ isAudioEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleVideo">
        <v-icon>{{ isVideoEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="startScreenShare">
        <v-icon>mdi-monitor-share</v-icon>
      </v-btn>
      <v-btn icon @click="leaveRoom">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import UserVideo from '@/components/UserVideo.vue';

export default {
  components: { UserVideo },
  data() {
    return {
      roomTitle: '',
      subscribers: [],
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
    };
  },
  created() {
    this.initializeRoom();
  },
  methods: {
    async initializeRoom() {
      const { sessionId } = this.$route.params;
      try {
        console.log("세션 ID로 서버 연결 시도 중:", sessionId);

        const response = await axios.post(`/api/rooms/${sessionId}/join`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        const token = response.data.token;

        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        this.session.on('streamCreated', (event) => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.subscribers.push(subscriber);
        });

        await this.session.connect(token, { clientData: "사용자명" });

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
        });

        this.session.publish(this.publisher);
      } catch (error) {
        console.error("방 참여 중 오류 발생:", error);
      }
    },
    toggleAudio() {
      this.isAudioEnabled = !this.isAudioEnabled;
      this.publisher.publishAudio(this.isAudioEnabled);
    },
    toggleVideo() {
      this.isVideoEnabled = !this.isVideoEnabled;
      this.publisher.publishVideo(this.isVideoEnabled);
    },
    startScreenShare() {
      const screenPublisher = this.OV.initPublisher(undefined, {
        videoSource: 'screen',
        publishAudio: this.isAudioEnabled,
      });
      this.session.unpublish(this.publisher);
      this.publisher = screenPublisher;
      this.session.publish(this.publisher);
    },
    async leaveRoom() {
      const { sessionId } = this.$route.params;
      try {
        if (this.session) {
          this.session.disconnect();
        }
        await axios.post(`/api/rooms/${sessionId}/leave`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        this.$router.push({ name: 'RoomList' });
      } catch (error) {
        console.error("방 나가기 중 오류 발생:", error);
      }
    },
    switchToMain(subscriber) {
      this.publisher = subscriber;
    },
  },
};
</script>

<style scoped>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-video {
  width: 80%;
  margin-bottom: 10px;
}
.side-videos {
  display: flex;
  gap: 10px;
}
</style>
