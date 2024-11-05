<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <div class="video-grid" :class="'grid-' + Math.min(videos.length, 6)">
      <div v-for="(video, index) in videos" :key="index" class="video-container">
        <video :ref="'video' + index" :srcObject="video.stream.getMediaStream()" autoplay playsinline
          :muted="index === 0"></video>
        <p class="video-name">
          {{ parseClientData(video.stream.connection.data) }}
        </p>

      </div>
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
      videos: [], 
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      originalPublisher: null,
    };
  },
  created() {
    this.initializeRoom();
  },

  methods: {
    parseClientData(data) {
      try {
      const parts = data.split('%/%');
      
      if (parts[1]) {
        return parts[1];
      }
      const parsedData = JSON.parse(parts[0]);
      return parsedData.clientData || 'Unknown';
    } catch (e) {
      return data || 'Unknown';
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
          this.videos.push(subscriber);

          // 비디오의 srcObject를 설정
          setTimeout(() => {
            const videoRefName = 'video' + (this.videos.length - 1);
            const videoElement = this.$refs[videoRefName][0];

            if (videoElement && subscriber.stream) {
              videoElement.srcObject = subscriber.stream.getMediaStream();
              videoElement.play().catch((error) => {
                console.warn("Video auto-play blocked", error);
              });
            }
          }, 500);
        });

        this.session.on('streamDestroyed', (event) => {
          this.removeVideo(event.stream);
        });

        await this.session.connect(token, { clientData: localStorage.getItem("userName") || "Unknown User" });

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
          mirror: true,
        });

        this.publisher.once('accessAllowed', () => {
          this.videos.unshift(this.publisher);
          this.$refs.video0.srcObject = this.publisher.stream.getMediaStream();
        });

        this.session.publish(this.publisher);
      } catch (error) {
        console.error("Error joining the room:", error);
      }
    },

    removeVideo(stream) {
      this.videos = this.videos.filter((video) => video.stream !== stream);
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
          this.videos.splice(0, 1, screenPublisher); // 첫번째 위치에 화면공유 비디오 설정
          await this.session.publish(screenPublisher);

          this.isScreenSharing = true;
          this.screenPublisher = screenPublisher;
        } catch (error) {
          console.error("Failed to start screen share:", error);
        }
      } else {
        try {
          await this.session.unpublish(this.screenPublisher);
          this.screenPublisher = null;

          this.publisher = this.OV.initPublisher(undefined, {
            videoSource: undefined,  
            audioSource: undefined,
            publishAudio: this.isAudioEnabled,
            publishVideo: this.isVideoEnabled,
            mirror: true,
          });
          await this.session.publish(this.publisher);


          this.videos.splice(0, 1, this.publisher);

          this.isScreenSharing = false;
        } catch (error) {
          console.error("Failed to stop screen share:", error);
        }
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
    }
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

.video-grid {
  display: grid;
  gap: 10px;
  max-width: 80vw;
  max-height: 80vh;
  width: 100%;
  height: 100%;
}

.grid-1 {
  grid-template-columns: 1fr;
}

.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-5,
.grid-6 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid #3498db;
}

.video-container video {
  width: 100%;
  height: 100%;
}

.video-name {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.8em;
}
</style>
