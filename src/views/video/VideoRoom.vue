<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <!-- Video Grid -->
    <div v-if="!isScreenSharing" class="video-grid">
      <div
        v-for="(subscriber, index) in paginatedVideos"
        :key="index"
        class="video-container"
      >
        <div class="user-label">{{ subscriber.stream.connection?.data || 'Unknown' }}</div>
        <video :srcObject="subscriber.stream.getMediaStream()" autoplay playsinline></video>
      </div>
    </div>

    <!-- Screen Sharing Layout -->
    <div v-else class="screen-sharing-layout">
      <!-- Main Screen Sharing Video -->
      <div class="main-screen">
        <div class="user-label">{{ mainVideo?.stream.connection?.data || 'Unknown' }}</div>
        <video ref="mainVideo" :srcObject="mainVideo?.stream.getMediaStream()" autoplay playsinline></video>
      </div>

      <!-- Other Videos in Side Column -->
      <div class="side-videos-column">
        <div
          v-for="(subscriber, index) in paginatedVideos"
          :key="index"
          class="side-video"
        >
          <div class="user-label">{{ subscriber.stream.connection?.data || 'Unknown' }}</div>
          <video :srcObject="subscriber.stream.getMediaStream()" autoplay playsinline></video>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <v-row class="pagination-controls" justify="center" v-if="pages > 1">
      <v-btn icon @click="prevPage" :disabled="currentPage === 1">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <span>Page {{ currentPage }} / {{ pages }}</span>
      <v-btn icon @click="nextPage" :disabled="currentPage === pages">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-row>

    <!-- Control Buttons -->
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
      mainVideo: null, 
      sideVideos: [],
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      originalPublisher: null,
      currentPage: 1, // 현재 페이지 번호
      videosPerPage: 6,
    };
  },
  created() {
    this.initializeRoom(); 
  },

  computed: {
    paginatedVideos() {
      const start = (this.currentPage - 1) * this.videosPerPage;
      const end = start + this.videosPerPage;
      return this.sideVideos.slice(start, end);
    },
    pages() {
      return Math.ceil(this.sideVideos.length / this.videosPerPage);
    }
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

        setTimeout(() => {
          const videoRefName = 'sideVideo' + (this.sideVideos.length - 1);
          const sideVideoElement = this.$refs[videoRefName][0];

          if (sideVideoElement) {
            sideVideoElement.srcObject = subscriber.stream.getMediaStream();
            sideVideoElement.play().catch((error) => {
              console.warn("Video auto-play blocked", error);
            });
          }
        }, 500);
      });

      await this.session.connect(token, { clientData: "사용자명" });

      // 메인 비디오를 설정하고 퍼블리시
      this.publisher = this.OV.initPublisher(undefined, {
        videoSource: undefined, // 카메라 비디오로 설정
        audioSource: undefined,
        publishAudio: this.isAudioEnabled,
        publishVideo: this.isVideoEnabled,
        mirror: true,
      });

      this.publisher.once('accessAllowed', () => {
        this.mainVideo = this.publisher;
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

  async startScreenShare() {
    if (!this.isScreenSharing) {
      try {
        const screenPublisher = this.OV.initPublisher(undefined, {
          videoSource: 'screen',
          publishAudio: this.isAudioEnabled,
        });

        await this.session.unpublish(this.publisher);
        this.mainVideo = screenPublisher;
        await this.session.publish(screenPublisher);
        this.isScreenSharing = true;

        this.screenPublisher = screenPublisher;
      } catch (error) {
        console.error("Failed to start screen share:", error);
      }
    } else {
      try {
        await this.session.unpublish(this.screenPublisher);
        this.mainVideo = this.publisher;
        await this.session.publish(this.publisher); 
        this.isScreenSharing = false;
      } catch (error) {
        console.error("Failed to stop screen share:", error);
      }
    }
  },

  switchToMain(subscriber, index) {
    const previousMainVideo = this.mainVideo;
    this.mainVideo = subscriber;
    this.sideVideos.splice(index, 1, previousMainVideo); 
  },

    nextPage() {
      if (this.currentPage < this.pages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
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
      console.error("Error leaving the room:", error);
    }
  },
  }
};
</script>

<style>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 80%;
  max-width: 1000px;
}

.video-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  background-color: #000;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-label {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(128, 128, 128, 0.7);
  color: #fff;
  padding: 2px 5px;
  font-size: 0.8em;
  border-radius: 3px;
}

.screen-sharing-layout {
  display: flex;
  width: 100%;
  max-width: 1200px;
}

.main-screen {
  width: 66.66%; /* 페이지 2/3 차지 */
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
}

.main-screen video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.side-videos-column {
  width: 33.33%; /* 페이지 1/3 차지 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  overflow-y: auto;
}

.side-video {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  background-color: #000;
}

.side-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pagination-controls {
  margin-top: 10px;
}

.controls {
  margin-top: 20px;
}
</style>
