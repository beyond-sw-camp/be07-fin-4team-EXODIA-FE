<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>
    <div class="main-video">
      <video ref="mainVideo" autoplay playsinline></video>
    </div>
    <div class="side-videos">
      <div v-for="(video, index) in sideVideos" :key="index" class="side-video" @click="switchToMain(video)">
        <video :srcObject="video.stream.getMediaStream()" autoplay playsinline muted></video>
      </div>
    </div>
    <button @click="leaveRoom">방 나가기</button>
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
      mainVideo: null,
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
    });

    await this.session.connect(token, { clientData: "사용자명" });

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
      this.mainVideo.srcObject = this.publisher.stream.getMediaStream();
    });

    this.session.publish(this.publisher);
  } catch (error) {
    console.error("방 참여 중 오류 발생:", error);
  }
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
      const currentMainStream = this.mainVideo.srcObject;
      this.mainVideo.srcObject = video.stream;
      video.stream = currentMainStream;
    },
   
  },
};
</script>

<style>
/* 기본 스타일 설정 */
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
