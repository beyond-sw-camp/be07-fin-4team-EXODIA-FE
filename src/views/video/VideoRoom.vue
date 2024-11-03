<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <!-- 메인 비디오 -->
    <div class="main-video">
      <video ref="mainVideo" autoplay playsinline></video>
    </div>

    <!-- 다른 참가자 비디오들 (4개씩 표시, 좌우 화살표) -->
    <div class="side-videos-container">
      <v-btn icon @click="prevPage" v-if="currentPage > 0">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <div class="side-videos">
        <div
          v-for="(subscriber, index) in paginatedSideVideos"
          :key="index"
          class="side-video"
          @click="switchToMain(subscriber, index)"
        >
          <video :ref="'sideVideo' + (currentPage * maxVideosPerPage + index)" autoplay playsinline muted></video>
          <p class="video-name">{{ subscriber.stream.connection.data }}</p>
        </div>
      </div>

      <v-btn icon @click="nextPage" v-if="(currentPage + 1) * maxVideosPerPage < sideVideos.length">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <!-- 제어 아이콘 버튼들 -->
    <v-row class="controls" justify="center">
      <v-btn icon @click="toggleAudio">
        <v-icon>{{ isAudioEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleVideo">
        <v-icon>{{ isVideoEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleScreenShare">
        <v-icon>{{ isScreenSharing ? 'mdi-monitor-off' : 'mdi-monitor-share' }}</v-icon>
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
      isScreenSharing: false,
      currentPage: 0,
      maxVideosPerPage: 4,
    };
  },
  computed: {
    paginatedSideVideos() {
      const start = this.currentPage * this.maxVideosPerPage;
      return this.sideVideos.slice(start, start + this.maxVideosPerPage);
    },
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

        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        this.session.on('streamCreated', (event) => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.sideVideos.push(subscriber);

          this.$nextTick(() => {
            const videoRefName = 'sideVideo' + (this.sideVideos.length - 1);
            const sideVideoElement = this.$refs[videoRefName][0];
            if (sideVideoElement) {
              sideVideoElement.srcObject = subscriber.stream.getMediaStream();
              sideVideoElement.play().catch(error => console.warn("Video autoplay blocked:", error));
            }
          });
        });

        await this.session.connect(token, { clientData: "사용자명" });

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: true,
          publishVideo: true,
          mirror: true,
        });
        this.publisher.once('accessAllowed', () => {
          this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
        });
        this.session.publish(this.publisher);
      } catch (error) {
        console.error("Error joining the room:", error);
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
    toggleScreenShare() {
      if (!this.isScreenSharing) {
        const screenPublisher = this.OV.initPublisher(undefined, {
          videoSource: 'screen',
          publishAudio: this.isAudioEnabled,
        });
        this.session.unpublish(this.publisher);
        this.publisher = screenPublisher;
        this.session.publish(this.publisher);
        this.isScreenSharing = true;
      } else {
        const cameraPublisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
          mirror: true,
        });
        this.session.unpublish(this.publisher);
        this.publisher = cameraPublisher;
        this.session.publish(this.publisher);
        this.isScreenSharing = false;
      }
    },
    async leaveRoom() {
      const { sessionId } = this.$route.params;
      try {
        if (this.session) this.session.disconnect();
        await axios.post(`/api/rooms/${sessionId}/leave`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        this.$router.push({ name: 'RoomList' });
      } catch (error) {
        console.error("Error leaving the room:", error);
      }
    },
    switchToMain(subscriber, index) {
      const mainVideoElement = this.$refs.mainVideo;
      const sideVideoElement = this.$refs['sideVideo' + (this.currentPage * this.maxVideosPerPage + index)][0];

      if (mainVideoElement && sideVideoElement) {
        const mainStream = mainVideoElement.srcObject;
        mainVideoElement.srcObject = subscriber.stream.getMediaStream();
        sideVideoElement.srcObject = mainStream;
      }
    },
    prevPage() {
      if (this.currentPage > 0) this.currentPage--;
    },
    nextPage() {
      if ((this.currentPage + 1) * this.maxVideosPerPage < this.sideVideos.length) this.currentPage++;
    },
  },
};
</script>

<style>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.main-video {
  width: 60%;
  max-width: 800px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  border: 4px solid #3498db;
}

.main-video video {
  width: 100%;
  height: auto;
}

.side-videos-container {
  display: flex;
  align-items: center;
}

.side-videos {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.side-video {
  width: 200px;
  height: 120px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  border: 2px solid #bdc3c7;
  transition: transform 0.2s;
}

.side-video:hover {
  transform: scale(1.05);
  border-color: #3498db;
}

.side-video video {
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
}

.video-name {
  text-align: center;
  margin-top: 5px;
  font-size: 1em;
  color: #2c3e50;
  font-weight: bold;
}

.controls {
  margin-top: 20px;
}
</style>
