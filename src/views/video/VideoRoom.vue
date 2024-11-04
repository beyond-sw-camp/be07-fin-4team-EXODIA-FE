<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <!-- Main Video -->
    <div class="main-video">
      <video ref="mainVideo" :srcObject="mainVideo ? mainVideo.stream.getMediaStream() : null" autoplay playsinline></video>
    </div>

    <!-- Side Videos -->
    <div class="side-videos">
      <div
        v-for="(subscriber, index) in sideVideos"
        :key="index"
        class="side-video"
        @click="switchToMain(subscriber, index)"
      >
        <video :ref="'sideVideo' + index" :srcObject="subscriber.stream.getMediaStream()" autoplay playsinline muted></video>
        <p class="video-name">{{ subscriber.stream.connection ? subscriber.stream.connection.data : 'Unknown' }}</p>
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
      mainVideo: null, // 메인 비디오
      sideVideos: [], // 사이드 비디오 배열
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false, // 화면 공유 상태 확인
      originalPublisher: null, // 기존 퍼블리셔를 저장
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

.side-videos {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  max-width: 80%;
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

.side-video video {
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
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
</style>
