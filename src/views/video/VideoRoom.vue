<template>
  <div>
    <div id="video-container"></div>
    <v-btn @click="leaveRoom">나가기</v-btn>
  </div>
</template>

<script>
import OpenVidu from 'openvidu-browser';
import axios from 'axios';

export default {
  data() {
    return {
      session: null
    };
  },
  async mounted() {
    const OV = new OpenVidu();
    this.session = OV.initSession();
    this.session.on('streamCreated', (event) => {
      this.session.subscribe(event.stream, 'video-container');
    });
    try {
      const token = await this.getToken();
      await this.session.connect(token, { clientData: '사용자 이름' });
      const publisher = OV.initPublisher('video-container');
      this.session.publish(publisher);
    } catch (error) {
      console.error('방 접속 실패:', error);
    }
  },
  methods: {
    async getToken() {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/sessions/get-token`, {
          sessionId: this.$route.params.sessionId
        });
        return response.data.token;
      } catch (error) {
        console.error('토큰 생성 실패:', error);
        throw error;
      }
    },
    leaveRoom() {
      if (this.session) this.session.disconnect();
      this.$router.push({ name: 'RoomList' });
    }
  }
};
</script>
