<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">회의실: {{ roomName }}</v-card-title>
          <v-card-text>
            <div id="video-grid" class="video-grid">
              <video id="local-video" autoplay playsinline></video>
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
import adapter from 'webrtc-adapter'; // Import webrtc-adapter

export default {
  name: 'VideoRoom',
  props: ['roomName'],
  data() {
    return {
      localStream: null,
      participants: [],
      janus: null,
      videoRoomPlugin: null,
      opaqueId: "videoroomtest-" + Janus.randomString(12),
      privateId: null, // Private ID to be used in subscribe
    };
  },
  async mounted() {
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
      Janus.useDefaultDependencies({ adapter: adapter }); // Add adapter here

      Janus.init({ 
        debug: "all", 
        callback: () => {
          this.janus = new Janus({
            server: "http://43.201.35.213:8088/janus",
            apisecret: 'mySuperSuperSecretKey', // API 비밀 키 추가
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
      const register = {
        request: "join",
        room: parseInt(this.roomName),
        ptype: "publisher",
        display: this.roomName,
      };
      this.videoRoomPlugin.send({ message: register });
    },
    
    onMessage(msg, jsep) {
      const event = msg["videoroom"];
      if (event) {
        if (event === "joined") {
          console.log("방 참가 완료:", msg);
          this.privateId = msg["private_id"];
          this.publishOwnFeed(true);

          if (msg["publishers"]) {
            this.subscribeToRemoteFeeds(msg["publishers"]);
          }
        } else if (event === "event") {
          if (msg["publishers"]) {
            this.subscribeToRemoteFeeds(msg["publishers"]);
          }
        } else if (event === "leaving" || event === "unpublished") {
          this.removeParticipant(msg["leaving"] || msg["unpublished"]);
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
          const publish = { request: "publish", audio: true, video: true };
          this.videoRoomPlugin.send({ message: publish, jsep: jsep });
        },
        error: (error) => {
          console.error("Offer 생성 실패:", error);
        }
      });
    },

    subscribeToRemoteFeeds(publishers) {
      for (let i = 0; i < publishers.length; i++) {
        let publisher = publishers[i];
        let id = publisher["id"];
        let display = publisher["display"];
        console.log(`구독 요청: publisher ${display} (${id})`);

        this.janus.attach({
          plugin: "janus.plugin.videoroom",
          opaqueId: this.opaqueId,
          success: (pluginHandle) => {
            const remoteFeed = pluginHandle; // eslint-disable-line no-undef
            console.log(`Remote feed ${id} 연결됨: ${pluginHandle}`);

            let subscribe = {
              request: "join",
              room: parseInt(this.roomName),
              ptype: "subscriber",
              feed: id,
              private_id: this.privateId
            };

            remoteFeed.send({ message: subscribe });
          },
          error: (error) => {
            console.error("Remote feed 연결 실패:", error);
          },
          onmessage: (msg, jsep) => {
            if (jsep) {
              this.videoRoomPlugin.createAnswer({
                jsep: jsep,
                media: { audioSend: false, videoSend: false }, 
                success: (jsep) => {
                  const body = { request: "start", room: parseInt(this.roomName) };
                  remoteFeed.send({ message: body, jsep: jsep }); // eslint-disable-line no-undef
                },
                error: (error) => {
                  console.error("응답 생성 실패:", error);
                }
              });
            }
          },
          onremotestream: (stream) => {
            console.log("Remote stream을 받았습니다:", stream);

            const videoElement = document.createElement("video");
            videoElement.srcObject = stream;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            document.getElementById("video-grid").appendChild(videoElement);
          },
          oncleanup: () => {
            console.log(`Remote feed ${id} 정리 완료`);
          }
        });
      }
    },

    onRemoteStream(stream) {
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      document.getElementById("video-grid").appendChild(videoElement);
    },
    
    removeParticipant(id) {
      const videoElement = document.getElementById(`remote-video-${id}`);
      if (videoElement) {
        videoElement.remove();
      }
    },
    
    leaveRoom() {
      if (this.videoRoomPlugin) {
        this.videoRoomPlugin.send({ message: { request: "leave" } });
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
