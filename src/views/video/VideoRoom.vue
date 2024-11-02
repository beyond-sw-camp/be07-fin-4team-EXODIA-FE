<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>
    
    <!-- 메인 비디오 -->
    <div class="main-video">
      <video ref="mainVideo" autoplay playsinline></video>
    </div>

    <!-- 다른 참가자 비디오들 -->
    <div class="side-videos">
      <div v-for="(subscriber, index) in sideVideos" :key="index" class="side-video">
        <video :ref="'sideVideo' + index" autoplay playsinline muted></video>
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
        console.log("세션 ID로 서버 연결 시도 중:", sessionId);

        const response = await axios.post(`/api/rooms/${sessionId}/join`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        const token = response.data.token;

        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        // 다른 참가자의 스트림 구독 처리
        this.session.on('streamCreated', (event) => {
          console.log('새 스트림 생성됨:', event.stream);
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.sideVideos.push(subscriber);

          // streamPlaying 이벤트가 발생할 때까지 기다렸다가 srcObject 설정
          subscriber.on('streamPlaying', () => {
            this.$nextTick(() => {
              const videoRefName = 'sideVideo' + (this.sideVideos.length - 1);
              const sideVideoElement = this.$refs[videoRefName];

              if (sideVideoElement && sideVideoElement[0]) {
                sideVideoElement[0].srcObject = subscriber.stream.getMediaStream();
                sideVideoElement[0].play().catch(error => {
                  console.warn("비디오 자동 재생이 차단되었습니다:", error);
                });

                console.log(`다른 참가자의 스트림이 ${videoRefName}에 연결됨: ${subscriber.stream.streamId}`);
                console.log("비디오 요소 srcObject 설정 확인:", sideVideoElement[0].srcObject);
              } else {
                console.warn(`비디오 요소를 찾을 수 없음: ${videoRefName}`);
              }
            });
          });
        });

        this.session.on('connectionCreated', (event) => {
          console.log(`새 참가자 연결됨: ${event.connection.connectionId}`);
        });

        this.session.on('connectionDestroyed', (event) => {
          console.log(`참가자 연결 해제됨: ${event.connection.connectionId}`);
        });

        await this.session.connect(token, { clientData: "사용자명" });

        // 자신의 비디오 스트림 생성 및 mainVideo에 연결
        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined, // 기본 웹캠 사용
          audioSource: undefined, // 기본 마이크 사용
          publishAudio: true,
          publishVideo: true,
        });

        this.publisher.once('accessAllowed', () => {
          console.log("내 비디오 스트림 설정됨.");
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
.controls {
  margin-top: 15px;
}
</style>
