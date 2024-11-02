<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>
    
    <!-- 메인 비디오 -->
    <div class="main-video">
      <video ref="mainVideo" autoplay playsinline></video>
    </div>

    <!-- 다른 참가자 비디오들 -->
    <div class="side-videos">
      <div v-for="(video, index) in sideVideos" :key="index" class="side-video" @click="switchToMain(video)">
        <video ref="sideVideo" autoplay playsinline muted></video>
      </div>
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

export default {
  data() {
    return {
      roomTitle: '',
      sideVideos: [],
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
        const response = await axios.post(`/api/rooms/${sessionId}/join`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        const token = response.data.token;

        // OpenVidu 연결 설정
        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        this.session.on('streamCreated', (event) => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.sideVideos.push(subscriber);

          this.$nextTick(() => {
            const sideVideoElements = this.$refs.sideVideo;
            if (Array.isArray(sideVideoElements)) {
              sideVideoElements[this.sideVideos.length - 1].srcObject = subscriber.stream.getMediaStream();
            } else {
              sideVideoElements.srcObject = subscriber.stream.getMediaStream();
            }
          });
        });

        await this.session.connect(token, { clientData: "사용자명" });

        // 자신의 비디오 스트림을 위한 publisher 설정
        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined, // 디폴트 카메라 사용
          audioSource: undefined, // 디폴트 마이크 사용
          publishAudio: true,     // 오디오 켜기
          publishVideo: true,     // 비디오 켜기
          resolution: '640x480',  // 해상도 설정
          frameRate: 30,          // 프레임 설정
          insertMode: 'APPEND',   // 비디오 추가 모드
          mirror: false           // 미러링 비활성화 (필요에 따라 설정)
        });

        this.publisher.once('accessAllowed', () => {
          this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
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
    switchToMain(video) {
      const currentMainStream = this.$refs.mainVideo.srcObject;
      this.$refs.mainVideo.srcObject = video.stream.getMediaStream();
      video.stream.srcObject = currentMainStream;
    },
  },
};
</script>

<style>
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
.side-video {
  width: 100px;
  height: 100px;
  cursor: pointer;
}
</style>
