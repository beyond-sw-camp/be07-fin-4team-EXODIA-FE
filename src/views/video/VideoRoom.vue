<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">회의실: {{ roomName }}</v-card-title>
          <v-card-text>
            <div id="video-grid" class="video-grid">
              <video id="local-video" autoplay playsinline></video>
              <!-- 참가자 비디오 목록 -->
              <video v-for="participant in participants" :key="participant.id" :id="'remote-video-' + participant.id" autoplay playsinline></video>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="leaveRoom">방 나가기</v-btn>
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
  props: ['roomName', 'roomId'],
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
    this.initWebRTC();
    this.connectToJanus();
  },
  methods: {
    async initWebRTC() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
          this.joinRoom();
        },
        error: (error) => {
          console.error("플러그인 연결 실패:", error);
        },
        onmessage: this.onMessage, 
        onlocalstream: (stream) => {
          document.getElementById('local-video').srcObject = stream;
        },
        onremotestream: this.onRemoteStream, // 원격 스트림 처리
      });
    },

    joinRoom() {
      const register = {
        request: "join",
        room: this.roomId,
        ptype: "publisher",
        display: this.roomName,
        apisecret: "mySuperSuperSecretKey"
      };
      this.videoRoomPlugin.send({ message: register });
    },

    onMessage(msg, jsep) {
      const event = msg["videoroom"];
      if (event === "joined") {
        console.log("방 참가 완료:", msg);
        
        // 이미 존재하는 참가자들의 목록을 받아옴
        if (msg["publishers"]) {
          const publishers = msg["publishers"];
          for (let i in publishers) {
            const publisher = publishers[i];
            console.log("참가자 ID:", publisher.id);

            // 참가자에 대한 구독 요청 (subscribe)
            const subscribe = {
              request: "join",
              room: this.roomId,
              ptype: "subscriber",
              feed: publisher.id,
            };
            this.videoRoomPlugin.send({ message: subscribe });
          }
        }

        this.publishOwnFeed(true);
      }

      if (event === "event" && msg["publishers"]) {
        const publishers = msg["publishers"];
        for (let i in publishers) {
          const publisher = publishers[i];
          console.log("새 참가자 ID:", publisher.id);

          // 새로 들어온 참가자에 대한 구독
          const subscribe = {
            request: "join",
            room: this.roomId,
            ptype: "subscriber",
            feed: publisher.id,
          };
          this.videoRoomPlugin.send({ message: subscribe });
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
      console.log("원격 스트림 수신됨:", stream);
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      document.getElementById("video-grid").appendChild(videoElement); // 비디오를 그리드에 추가
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
