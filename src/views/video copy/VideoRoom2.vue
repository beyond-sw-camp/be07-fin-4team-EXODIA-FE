<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">회의실: {{ roomName }}</v-card-title>
          <v-card-text>
            <div id="video-grid" class="video-grid">
              <video id="local-video" autoplay playsinline></video>
              <video v-for="participant in participants" :key="participant.id" :id="'remote-video-' + participant.id"
                autoplay playsinline></video>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn v-delete @click="leaveRoom">방 나가기</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Janus from 'janus-gateway';

export default {
  name: 'VideoRoom',
  props: ['roomName', 'roomId'], // roomId를 명확하게 받음
  data() {
    return {
      localStream: null,
      participants: [],
      janus: null,
      videoRoomPlugin: null,
      opaqueId: "videoroomtest-" + Janus.randomString(12),
    };
  },
  mounted() {
    console.log("roomId:", this.roomId);  // URL에서 받은 roomId 출력
    console.log("roomName:", this.roomName);  // 쿼리에서 받은 roomName 출력
    this.initWebRTC();
    this.connectToJanus();
  },
  methods: {
    async initWebRTC() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        this.localStream = stream;
        document.getElementById('local-video').srcObject = stream;
      } catch (err) {
        console.error('WebRTC 초기화 중 오류 발생:', err);
        alert('카메라와 마이크 권한이 필요합니다.');
      }
    },

    connectToJanus() {
      Janus.init({
        debug: "all",
        callback: () => {
          this.janus = new Janus({
            server: "http://43.201.35.213:8088/janus",
            apisecret: "mySuperSuperSecretKey",
            success: this.attachToVideoRoomPlugin,
            error: (error) => {
              console.error("Janus 연결 실패:", error);
              alert("Janus 서버에 연결할 수 없습니다.");
            },
            destroyed: () => {
              console.log("Janus 세션 종료");
            }
          });
        }
      });
    },

    attachToVideoRoomPlugin() {
      this.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: this.opaqueId,
        success: (pluginHandle) => {
          this.videoRoomPlugin = pluginHandle;
          console.log("플러그인에 연결됨: ", pluginHandle);
          this.joinRoom();
        },
        error: (error) => {
          console.error("플러그인 연결 실패:", error);
        },
        onmessage: this.onMessage,
        onlocalstream: (stream) => {
          document.getElementById('local-video').srcObject = stream;
        },
        onremotestream: this.onRemoteStream,
      });
    },

    joinRoom() {
      let roomId = this.roomId;
      console.log("Joining room with ID:", roomId);

      if (!roomId || isNaN(roomId)) {
        console.error("Invalid room ID");
        return;
      }
      roomId = Number(roomId);
      const register = {
        request: "join",
        room: roomId,
        ptype: "publisher",
        display: this.roomName,
        apisecret: "mySuperSuperSecretKey"
      };
      this.videoRoomPlugin.send({ message: register });
    },

    onMessage(msg, jsep) {
      const event = msg["videoroom"];
      if (event) {
        if (event === "joined") {
          console.log("방 참가 완료:", msg);
          this.publishOwnFeed(true);
        }
      }

      if (jsep) {
        this.videoRoomPlugin.handleRemoteJsep({ jsep: jsep });
      }
    },

    publishOwnFeed(useVideo) {
      this.videoRoomPlugin.createOffer({
        media: { video: useVideo, audio: true },
        success: (jsep) => {
          const publish = { request: "publish", audio: true, video: true, apisecret: "mySuperSuperSecretKey" };
          this.videoRoomPlugin.send({ message: publish, jsep: jsep });
        },
        error: (error) => {
          console.error("Offer 생성 실패:", error);
        }
      });
    },

    onRemoteStream(stream) {
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      document.getElementById("video-grid").appendChild(videoElement);
    },

    leaveRoom() {
      if (this.videoRoomPlugin) {
        this.videoRoomPlugin.send({ message: { request: "leave", apisecret: "mySuperSuperSecretKey" } });
        this.videoRoomPlugin.detach();
      }
      this.$router.push('/video/rooms');
    }
  }
};
</script>

<style scoped>
.video-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

video {
  width: 300px;
  height: 200px;
  background-color: #000;
  border: 1px solid #ccc;
}
</style>
