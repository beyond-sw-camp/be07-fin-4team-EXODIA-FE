<template>
  <div>
    <button @click="joinSession">Join Session</button>
    <button @click="leaveSession">Leave Session</button>
    <div id="video-container"></div>
  </div>
</template>

<script>
import { OpenVidu } from 'openvidu-browser';

export default {
  data() {
    return {
      openVidu: null,
      session: null,
      sessionId: '',
      token: ''
    };
  },
  methods: {
    async joinSession() {
      this.openVidu = new OpenVidu();
      const sessionIdResponse = await fetch('http://localhost:8087/api/openvidu/session', { method: 'POST' });
      this.sessionId = await sessionIdResponse.text();

      const tokenResponse = await fetch(`http://localhost:8087/api/openvidu/token?sessionId=${this.sessionId}`, { method: 'POST' });
      this.token = await tokenResponse.text();

      this.session = this.openVidu.initSession();
      this.session.on('streamCreated', (event) => {
        const subscriber = this.session.subscribe(event.stream, undefined);
        document.getElementById('video-container').appendChild(subscriber.videoElement);
      });

      await this.session.connect(this.token, { clientData: 'User' });
      const publisher = this.openVidu.initPublisher(undefined, { videoSource: undefined });
      await this.session.publish(publisher);
      document.getElementById('video-container').appendChild(publisher.videoElement);
    },
    leaveSession() {
      if (this.session) {
        this.session.disconnect();
      }
      this.session = null;
      this.sessionId = '';
      this.token = '';
    }
  }
};
</script>
