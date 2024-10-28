<template>
    <div>
      <h1>{{ roomName }} 화상 회의</h1>
      <div id="main-screen">
        <video ref="mainVideo" autoplay playsinline></video>
      </div>
      <div id="participants">
        <video
          v-for="(user, index) in users"
          :key="index"
          :ref="`subscriberVideo${index}`"
          autoplay
          playsinline
          @click="setMainScreen(user)"
        ></video>
      </div>
      <div class="controls">
        <v-btn icon @click="toggleMute">
          <v-icon>{{ isAudioEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
        </v-btn>
        <v-btn icon @click="toggleVideo">
          <v-icon>{{ isVideoEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
        </v-btn>
        <v-btn icon @click="shareScreen">
          <v-icon>{{ isScreenSharing ? 'mdi-monitor' : 'mdi-monitor-share' }}</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="leaveRoom">
          <v-icon>mdi-exit-to-app</v-icon>
        </v-btn>
      </div>
    </div>
  </template>
  
  <script>
  import { OpenVidu } from 'openvidu-browser';
  import axios from 'axios';
  
  export default {
    data() {
      return {
        roomName: '',
        users: [],
        session: null,
        publisher: null,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
      };
    },
    async created() {
      this.roomName = this.$route.params.roomName;
      await this.initializeSession();
    },
    methods: {
      async initializeSession() {
        const OV = new OpenVidu();
        this.OV = OV;
        this.session = OV.initSession();
  
        // 새로운 스트림이 생성될 때마다 구독자 추가
        this.session.on('streamCreated', (event) => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.users.push(subscriber);
        });
  
        this.session.on('streamDestroyed', (event) => {
          this.users = this.users.filter((user) => user !== event.stream.streamManager);
          if (this.users.length === 0) {
            this.deleteRoom(this.roomName);
          }
        });
  
        try {
          const token = await this.getToken(this.roomName);
          await this.session.connect(token, { clientData: '방 생성자' });
          this.publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: this.isAudioEnabled,
            publishVideo: true,
          });
  
          this.publisher.once('streamPlaying', () => {
            this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
            this.users.push(this.publisher);
          });
  
          this.session.publish(this.publisher);
        } catch (error) {
          console.error('세션 연결 실패:', error);
        }
      },
  
      async deleteRoom(roomName) {
        try {
          await axios.delete(`http://localhost:8087/api/rooms/${roomName}`);
          console.log(`${roomName} 방이 삭제되었습니다.`);
        } catch (error) {
          console.error('방 삭제 오류:', error);
        }
      },
  
      async getToken(sessionId) {
        try {
          const response = await axios.post(`http://localhost:8087/api/sessions/get-token`, { sessionId });
          return response.data;
        } catch (error) {
          console.error('Error while getting token:', error);
          throw error;
        }
      },
  
      toggleMute() {
        if (this.publisher) {
          this.isAudioEnabled = !this.isAudioEnabled;
          this.publisher.publishAudio(this.isAudioEnabled);
        } else {
          console.warn("Publisher is not initialized.");
        }
      },
  
      toggleVideo() {
        if (this.publisher) {
          this.isVideoEnabled = !this.isVideoEnabled;
          this.publisher.publishVideo(this.isVideoEnabled);
        } else {
          console.warn("Publisher is not initialized.");
        }
      },
  
      shareScreen() {
        if (this.isScreenSharing) {
          this.stopScreenShare();
        } else {
          if (this.publisher) {
            this.session.unpublish(this.publisher);
          }
          
          this.publisher = this.OV.initPublisher(undefined, {
            videoSource: 'screen',
            publishAudio: this.isAudioEnabled,
            publishVideo: true,
          });
  
          this.publisher.once('accessAllowed', () => {
            this.session.publish(this.publisher);
            this.isScreenSharing = true;
          });
  
          this.publisher.once('streamDestroyed', () => {
            this.stopScreenShare();
          });
        }
      },
  
      stopScreenShare() {
        if (this.publisher) {
          this.session.unpublish(this.publisher);
        }
  
        this.publisher = this.OV.initPublisher(undefined, {
          audioSource: true,
          videoSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
        });
  
        this.publisher.once('streamPlaying', () => {
          this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
          this.session.publish(this.publisher);
        });
  
        this.isScreenSharing = false;
      },
  
      leaveRoom() {
        if (this.session) {
          this.session.disconnect();
          this.$router.push({ name: 'RoomList' });
        }
      },
  
      setMainScreen(user) {
        this.$refs.mainVideo.srcObject = user.stream.getMediaStream();
      },
    },
  };
  </script>
  
  <style scoped>
  video {
    width: 100%;
    height: auto;
    background: black;
  }
  .controls {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }
  </style>
  