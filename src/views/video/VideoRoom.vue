<template>
    <div class="video-room">
      <h2>회의실: {{ roomName }}</h2>
      <div class="controls">
        <button @click="toggleCamera">{{ isCameraOn ? '카메라 끄기' : '카메라 켜기' }}</button>
        <button @click="toggleMicrophone">{{ isMicrophoneOn ? '마이크 끄기' : '마이크 켜기' }}</button>
        <button @click="toggleScreenShare">{{ isScreenSharing ? '화면 공유 중지' : '화면 공유 시작' }}</button>
        <button @click="leaveRoom">방 나가기</button>
      </div>
      <div id="video-grid" class="video-grid">
        <video v-if="isScreenSharing" id="screen-video" autoplay playsinline></video>
        <video v-else id="local-video" autoplay playsinline></video>
        <div v-for="participant in participants" :key="participant.id" class="participant-video">
          <video v-if="participant.videoOn" :id="'remote-video-' + participant.id" autoplay playsinline></video>
          <div v-else class="no-video">{{ participant.userId }}</div>
        </div>
      </div>
    </div>
</template>

<script>
import { OpenVidu } from 'openvidu-browser';

export default {
  name: 'VideoRoom',
  props: ['roomName', 'sessionId'],
  data() {
    return {
      openVidu: null,
      session: null,
      token: '',
      localSessionId: this.sessionId,
      isCameraOn: true,
      isMicrophoneOn: true,
      isScreenSharing: false,
      localStream: null,
      participants: [],
    };
  },
  async created() {
    console.log("Room Name:", this.roomName);
    console.log("Session ID:", this.localSessionId);

    if (!this.localSessionId) {
      this.localSessionId = await this.createSession();
    }
    if (this.localSessionId) {
      await this.connectToOpenVidu();
    } else {
      console.error("Session ID가 생성되지 않았습니다.");
    }
  },
  methods: {
    async createSession() {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/openvidu/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customSessionId: this.roomName })
        });
        if (!response.ok) throw new Error("Session 생성 실패");
        const sessionId = await response.text();
        return sessionId;
      } catch (error) {
        console.error("Session 생성 중 오류:", error);
        return null;
      }
    },

    async connectToOpenVidu() {
      this.openVidu = new OpenVidu();

      try {
        const tokenResponse = await fetch(`${process.env.VUE_APP_API_BASE_URL}/openvidu/sessions/${this.localSessionId}/connections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!tokenResponse.ok) throw new Error("토큰 생성 중 오류");
        this.token = await tokenResponse.text();

        this.session = this.openVidu.initSession();
        this.session.on('streamCreated', event => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          console.log("Subscribed to stream:", subscriber);
          this.participants.push({ id: event.stream.connection.connectionId, videoOn: true, userId: event.stream.connection.data });
        });
        await this.session.connect(this.token, { clientData: 'User' });
        this.publishLocalStream();
      } catch (error) {
        console.error("Error connecting to OpenVidu:", error);
      }
    },

    async publishLocalStream() {
      this.localStream = this.openVidu.initPublisher('local-video', {
        videoSource: undefined,
        audioSource: undefined,
      });
      await this.session.publish(this.localStream);
    },

    toggleCamera() {
      this.isCameraOn = !this.isCameraOn;
      this.localStream.publishVideo(this.isCameraOn);
    },

    toggleMicrophone() {
      this.isMicrophoneOn = !this.isMicrophoneOn;
      this.localStream.publishAudio(this.isMicrophoneOn);
    },

    async toggleScreenShare() {
      if (this.isScreenSharing) {
        this.isScreenSharing = false;
        await this.publishLocalStream();
      } else {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screenStream.getTracks()[0];
          this.localStream.replaceTrack(screenTrack);
          this.isScreenSharing = true;

          screenTrack.onended = () => {
            this.isScreenSharing = false;
            this.publishLocalStream();
          };
        } catch (err) {
          console.error('Screen sharing error:', err);
          this.isScreenSharing = false;
        }
      }
    },

    async leaveRoom() {
      if (this.session) {
        await this.session.disconnect();
        this.$router.push('/video/list');
      }
    }
  }
};
</script>

<style scoped>
.video-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.video-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

video {
  width: 100%;
  max-width: 600px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: black;
}

.participant-video {
  display: inline-block;
  width: 150px;
  height: 100px;
  position: relative;
  background-color: #333;
  color: white;
  border: 2px solid #666;
  border-radius: 8px;
}

.no-video {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
}
</style>
