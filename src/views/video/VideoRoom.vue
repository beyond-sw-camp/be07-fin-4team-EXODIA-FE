<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>
    <div class="main-video">
      <video ref="mainVideo" autoplay></video>
    </div>
    <div class="side-videos">
      <div v-for="(video, index) in sideVideos" :key="index" class="side-video" @click="switchToMain(video)">
        <video :srcObject="video.stream" autoplay muted></video>
      </div>
    </div>
    <button @click="leaveRoom">방 나가기</button>
  </div>
</template>

<script>
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
        const response = await axios.post(`/api/rooms/${sessionId}/join`, { userNum: localStorage.getItem("userNum") });
        this.roomTitle = response.data.title;
        this.mainVideo = this.$refs.mainVideo;
        // OpenVidu 관련 세팅 및 비디오 스트림 추가 로직 여기에 구현
      } catch (error) {
        console.error("방 참여 중 오류 발생:", error);
      }
    },
    switchToMain(video) {
      const currentMainStream = this.mainVideo.srcObject;
      this.mainVideo.srcObject = video.stream;
      video.stream = currentMainStream;
    },
    async leaveRoom() {
      const { sessionId } = this.$route.params;
      try {
        await axios.post(`/api/rooms/${sessionId}/leave`, { userNum: localStorage.getItem("userNum") });
        this.$router.push({ name: 'RoomList' });
      } catch (error) {
        console.error("방 나가기 중 오류 발생:", error);
      }
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
