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
      <v-btn @click="toggleMute">음소거</v-btn>
      <v-btn @click="toggleVideo">비디오</v-btn>
      <v-btn @click="shareScreen">화면 공유</v-btn>
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
  
          subscriber.once('streamPlaying', () => {
            const videoRef = this.$refs[`subscriberVideo${this.users.indexOf(subscriber)}`][0];
            videoRef.srcObject = subscriber.stream.getMediaStream();
          });
        });
  
        this.session.on('streamDestroyed', (event) => {
          this.users = this.users.filter((user) => user !== event.stream.streamManager);
        });
  
        try {
          const token = await this.getToken(this.roomName);
          if (!token) throw new Error("Token retrieval failed");
  
          await this.session.connect(token, { clientData: '사용자 사번' });
          this.publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: this.isAudioEnabled,
            publishVideo: true,
            resolution: "640x480",
            frameRate: 30,
          });
  
          this.publisher.once('streamPlaying', () => {
            this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
          });
  
          this.session.publish(this.publisher);
        } catch (error) {
          console.error('세션 연결 실패:', error);
        }
      },
  
      async getToken(sessionId) {
        try {
          const response = await axios.post(`http://localhost:8087/api/sessions/get-token`, { sessionId });
          return response.data.token; // getToken 수정: token에 바로 접근
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
          this.publisher = this.OV.initPublisher(undefined, {
            videoSource: 'screen',
            publishAudio: this.isAudioEnabled,
            publishVideo: true,
          });
  
          this.session.unpublish(this.publisher);
          this.session.publish(this.publisher);
          this.isScreenSharing = true;
  
          this.publisher.once('streamDestroyed', () => {
            this.stopScreenShare();
          });
        }
      },
  
      stopScreenShare() {
        this.publisher = this.OV.initPublisher(undefined, {
          audioSource: true,
          videoSource: true,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
        });
  
        this.session.unpublish(this.publisher);
        this.session.publish(this.publisher);
        this.isScreenSharing = false;
  
        this.publisher.once('streamPlaying', () => {
          this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
        });
      },
  
      setMainScreen(user) {
        const mainVideo = this.$refs.mainVideo;
        mainVideo.srcObject = user.stream.getMediaStream();
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
  </style>
  