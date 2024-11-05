<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <!-- Main Video -->
    <div class="main-video">
      <video ref="mainVideo" :srcObject="mainVideo ? mainVideo.stream.getMediaStream() : null" autoplay playsinline></video>
      <v-btn icon @click="toggleFullscreen" class="fullscreen-icon">
        <v-icon>mdi-fullscreen</v-icon>
      </v-btn>
    </div>

    <!-- Side Videos with Vuetify Arrows for Navigation -->
    <div class="side-videos-container">
      <v-btn icon @click="prevSideVideo" v-if="sideVideos.length > 2">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="side-videos">
        <div
          v-for="(subscriber, index) in visibleSideVideos"
          :key="index"
          class="side-video"
          @click="switchToMain(subscriber, index)"
        >
          <video :srcObject="subscriber.stream.getMediaStream()" autoplay playsinline muted></video>
          <p class="video-name">{{ subscriber.stream.connection ? subscriber.stream.connection.data : 'Unknown' }}</p>
        </div>
      </div>
      <v-btn icon @click="nextSideVideo" v-if="sideVideos.length > 2">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

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
      participants: [],
      mainVideo: null,
      sideVideos: [],
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      screenPublisher: null,
    };
  },
  async created() {
    await this.fetchRoomDetails();
    await this.initializeRoom();
  },

  methods: {

    async fetchRoomDetails() {
      const { sessionId } = this.$route.params;
      try {
        const response = await axios.get(`/api/rooms/${sessionId}`);
        this.roomTitle = response.data.roomTitle;  // 방 제목 설정
        this.participants = response.data.participants;  // 참가자 리스트 설정
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    },


    async initializeRoom() {
      const { sessionId } = this.$route.params;
      try {
        // API로 방 정보 및 토큰 요청
        const response = await axios.post(`/api/rooms/${sessionId}/join`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        this.roomTitle = response.data.roomTitle;  // 방 이름 가져오기
        const token = response.data.token;

        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        this.session.on('streamCreated', (event) => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.sideVideos.push(subscriber);
          this.updateVisibleSideVideos();
        });

        await this.session.connect(token, { clientData: localStorage.getItem("userNum") });

        // 카메라 비디오 설정
        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
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
          // 화면 공유 스트림 추가
          const screenPublisher = this.OV.initPublisher(undefined, {
            videoSource: 'screen',
            publishAudio: this.isAudioEnabled,
          });

          this.sideVideos.push(screenPublisher);  // 화면 공유 비디오 추가
          this.updateVisibleSideVideos();

          await this.session.publish(screenPublisher);
          this.isScreenSharing = true;

          screenPublisher.once('streamDestroyed', () => {
            this.stopScreenShare();
          });
        } catch (error) {
          console.error("Failed to start screen share:", error);
        }
      } else {
        await this.stopScreenShare();
      }
    },

    // async stopScreenShare() {
    //   if (this.isScreenSharing) {
    //     try {
    //       const screenPublisher = this.sideVideos.find((video) => video.videoSource === 'screen');
    //       if (screenPublisher) {
    //         await this.session.unpublish(screenPublisher);
    //         const index = this.sideVideos.indexOf(screenPublisher);
    //         if (index !== -1) this.sideVideos.splice(index, 1);
    //         this.updateVisibleSideVideos();
    //       }

    //       this.isScreenSharing = false;
    //     } catch (error) {
    //       console.error("Failed to stop screen share:", error);
    //     }
    //   }
    // },

    async stopScreenShare() {
  if (this.isScreenSharing) {
    try {
      if (this.screenPublisher) {
        await this.session.unpublish(this.screenPublisher);
        this.sideVideos = this.sideVideos.filter(video => video !== this.screenPublisher);
        this.updateVisibleSideVideos();
      }
      this.isScreenSharing = false;
      this.screenPublisher = null;
    } catch (error) {
      console.error("Failed to stop screen share:", error);
    }
  }
},


    switchToMain(subscriber, index) {
      const previousMainVideo = this.mainVideo;
      this.mainVideo = subscriber;
      this.sideVideos.splice(index, 1, previousMainVideo);
      this.updateVisibleSideVideos();
    },

    toggleFullscreen() {
      if (this.$refs.mainVideo.requestFullscreen) {
        this.$refs.mainVideo.requestFullscreen();
      }
    },

    prevSideVideo() {
      if (this.currentSideIndex > 0) {
        this.currentSideIndex -= 1;
        this.updateVisibleSideVideos();
      }
    },
    nextSideVideo() {
      if (this.currentSideIndex < this.sideVideos.length - 2) {
        this.currentSideIndex += 1;
        this.updateVisibleSideVideos();
      }
    },
    updateVisibleSideVideos() {
      this.visibleSideVideos = this.sideVideos.slice(this.currentSideIndex, this.currentSideIndex + 2);
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
  },
}
</script>


<style>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.main-video {
  position: relative;
  width: 50%;
  max-width: 700px;
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

.fullscreen-icon {
  position: absolute;
  top: 10px;
  right: 10px;
}

.side-videos {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.side-video {
  width: 240px;
  height: 140px;
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

.video-name {
  text-align: center;
  margin-top: 5px;
  font-size: 0.9em;
  color: #2c3e50;
  font-weight: bold;
}

.controls {
  margin-top: 20px;
}

.side-videos-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
