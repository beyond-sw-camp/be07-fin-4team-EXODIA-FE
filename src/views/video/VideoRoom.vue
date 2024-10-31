<template>
    <div>
      <div class="main-video">
        <video autoplay ref="mainVideo" />
      </div>
      <div class="participants">
        <div v-for="(participant, index) in participants" :key="index" class="participant-video">
          <video autoplay :ref="'participant' + index" />
        </div>
      </div>
      <v-btn icon @click="toggleMute">
        <v-icon>{{ isMuted ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleVideo">
        <v-icon>{{ isVideoOn ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleScreenShare">
        <v-icon>mdi-monitor-share</v-icon>
      </v-btn>
      <v-btn icon @click="leaveRoom">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { OpenVidu } from 'openvidu-browser';
  
  export default {
    data() {
      return {
        isMuted: false,
        isVideoOn: true,
        isScreenSharing: false,
        participants: [],
        session: null,
        token: null,
        screenPublisher: null,
      };
    },
    methods: {
      async joinSession() {
        try {
          const response = await axios.post('/api/sessions/get-token', { sessionId: this.$route.params.sessionId });
          this.token = response.data;
  
          this.session = new OpenVidu().initSession();
  
          this.session.on('streamCreated', (event) => {
            const subscriber = this.session.subscribe(event.stream, undefined);
            this.participants.push(subscriber);
            this.$nextTick(() => {
              this.$refs[`participant${this.participants.length - 1}`][0].srcObject = subscriber.stream.getMediaStream();
            });
          });
  
          await this.session.connect(this.token, { clientData: '사용자' });
          const publisher = new OpenVidu().initPublisher();
          this.session.publish(publisher);
  
          this.$refs.mainVideo.srcObject = publisher.stream.getMediaStream();
        } catch (error) {
          console.error("세션 연결 중 오류 발생:", error);
        }
      },
      toggleMute() {
        this.isMuted = !this.isMuted;
        this.session.publishers[0].publishAudio(!this.isMuted);
      },
      toggleVideo() {
        this.isVideoOn = !this.isVideoOn;
        this.session.publishers[0].publishVideo(this.isVideoOn);
      },
      async toggleScreenShare() {
        if (!this.isScreenSharing) {
          try {
            this.screenPublisher = new OpenVidu().initPublisher(undefined, {
              videoSource: "screen",
              publishAudio: true,
              mirror: false,
            });
            await this.session.publish(this.screenPublisher);
            this.isScreenSharing = true;
            this.$refs.mainVideo.srcObject = this.screenPublisher.stream.getMediaStream();
          } catch (error) {
            console.error("화면 공유 시작 중 오류 발생:", error);
          }
        } else {
          this.session.unpublish(this.screenPublisher);
          this.screenPublisher = null;
          this.isScreenSharing = false;
          const publisher = this.session.publishers[0];
          this.$refs.mainVideo.srcObject = publisher.stream.getMediaStream();
        }
      },
      leaveRoom() {
        if (this.screenPublisher) {
          this.session.unpublish(this.screenPublisher);
        }
        this.session.disconnect();
        this.$router.push({ name: 'RoomList' });
      },
    },
    async mounted() {
      await this.joinSession();
    },
  };
  </script>
  
  
  <style scoped>
  .main-video {
    max-width: 600px;
    margin: auto;
  }
  .participants {
    display: flex;
    justify-content: center;
  }
  </style>
  