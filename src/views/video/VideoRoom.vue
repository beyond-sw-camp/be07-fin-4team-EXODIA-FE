<template>
  <div class="room-view">
    <h2 class="room-title">{{ roomTitle }}</h2>

    <!-- Main Video -->
    <div class="main-video-container">
      <video ref="mainVideo" :srcObject="mainVideoStream" autoplay playsinline></video>
      <div class="video-name-overlay">{{ mainVideoName }}</div>
      <v-btn icon @click="toggleFullscreen" class="fullscreen-icon">
        <v-icon>mdi-fullscreen</v-icon>
      </v-btn>
      <v-btn icon @click="togglePIP" class="pip-icon">
        <v-icon>mdi-picture-in-picture-bottom-right</v-icon>
      </v-btn>
    </div>

    <!-- Side Videos with Vuetify Arrows for Navigation -->
    <div class="side-videos-container">
      <v-btn icon @click="prevSideVideo" v-if="sideVideos.length > 3">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="side-videos">
        <div
          v-for="(subscriber, index) in visibleSideVideos"
          :key="index"
          class="side-video"
          @click="switchToMain(index)"
        >
          <video :ref="'sideVideo' + index" :srcObject="subscriber.stream.getMediaStream()" autoplay playsinline muted></video>
          <div class="video-name-overlay">{{ subscriber.stream.connection.data }}</div>
        </div>
      </div>
      <v-btn icon @click="nextSideVideo" v-if="sideVideos.length > 3">
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
      mainVideoStream: null,
      mainVideoName: 'Your Video',
      sideVideos: [],
      visibleSideVideos: [],
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      screenPublisher: null,
      currentSideIndex: 0,
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
        this.roomTitle = response.data.roomTitle;
      } catch (error) {
        console.error("Error fetching room details:", error);
      }
    },

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
          this.updateVisibleSideVideos();
        });

        this.session.on('streamDestroyed', (event) => {
          const index = this.sideVideos.findIndex(sub => sub === event.stream.streamManager);
          if (index !== -1) {
            this.sideVideos.splice(index, 1);
            this.updateVisibleSideVideos();
          }
        });

        await this.session.connect(token, { clientData: "Your Name" });

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
          mirror: true,
        });

        this.publisher.once('accessAllowed', () => {
          this.mainVideoStream = this.publisher.stream.getMediaStream();
          this.mainVideoName = "Your Video";
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

          this.screenPublisher = screenPublisher;
          this.sideVideos.push(screenPublisher);
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

    async stopScreenShare() {
      if (this.isScreenSharing && this.screenPublisher) {
        try {
          await this.session.unpublish(this.screenPublisher);
          const index = this.sideVideos.indexOf(this.screenPublisher);
          if (index !== -1) this.sideVideos.splice(index, 1);
          this.screenPublisher = null;
          this.isScreenSharing = false;
          this.updateVisibleSideVideos();
        } catch (error) {
          console.error("Failed to stop screen share:", error);
        }
      }
    },

    switchToMain(index) {
      const temp = this.mainVideoStream;
      this.mainVideoStream = this.sideVideos[index].stream.getMediaStream();
      this.mainVideoName = this.sideVideos[index].stream.connection.data || "Participant";
      this.sideVideos[index].stream.getMediaStream = () => temp;
    },

    toggleFullscreen() {
      const video = this.$refs.mainVideo;
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    },

    togglePIP() {
      const video = this.$refs.mainVideo;
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        video.requestPictureInPicture();
      }
    },

    prevSideVideo() {
      if (this.currentSideIndex > 0) {
        this.currentSideIndex -= 3;
        this.updateVisibleSideVideos();
      }
    },

    nextSideVideo() {
      if (this.currentSideIndex < this.sideVideos.length - 3) {
        this.currentSideIndex += 3;
        this.updateVisibleSideVideos();
      }
    },

    updateVisibleSideVideos() {
      this.visibleSideVideos = this.sideVideos.slice(this.currentSideIndex, this.currentSideIndex + 3);
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
};
</script>

<style>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.room-title {
  font-size: 1.5em;
  margin-bottom: 20px;
}

.main-video-container {
  position: relative;
  width: 50%;
  max-width: 700px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  border: 4px solid #3498db;
}

.main-video-container video {
  width: 100%;
  height: auto;
}

.video-name-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  background: rgba(50, 50, 50, 0.8);
  color: #fff;
  border-radius: 5px;
}

.fullscreen-icon, .pip-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  margin-left: 10px;
}

.side-videos {
  display: flex;
  justify-content: center;
  gap: 10px;
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
</style>
