<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <!-- 메인 비디오 -->
    <div class="main-video">
      <video ref="mainVideo" autoplay playsinline></video>
    </div>

    <!-- 다른 참가자 비디오들 (4개씩 표시, 좌우 화살표) -->
    <div class="side-videos-container">
      <v-btn icon @click="prevPage" v-if="currentPage > 0">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <div class="side-videos">
        <div
          v-for="(subscriber, index) in paginatedSideVideos"
          :key="index"
          class="side-video"
          @click="switchToMain(subscriber, index)"
        >
          <video :ref="'sideVideo' + (currentPage * maxVideosPerPage + index)" autoplay playsinline muted></video>
          <p class="video-name">{{ subscriber.stream.connection.data }}</p>
        </div>
      </div>

      <v-btn icon @click="nextPage" v-if="(currentPage + 1) * maxVideosPerPage < sideVideos.length">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>


    <v-row class="controls" justify="center">
      <v-btn icon @click="toggleAudio">
        <v-icon>{{ isAudioEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleVideo">
        <v-icon>{{ isVideoEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleScreenShare">
        <v-icon>{{ isScreenSharing ? 'mdi-monitor-off' : 'mdi-monitor-share' }}</v-icon>
      </v-btn>
      <v-btn icon @click="leaveRoom">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-row>


    <v-dialog v-model="showPasswordModal" persistent max-width="400">
      <v-card>
        <v-card-title class="headline">비밀번호 입력</v-card-title>
        <v-card-text>
          <v-text-field v-model="enteredPassword" label="비밀번호" type="password"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-create text @click="checkPassword">입장</v-btn>
          <v-btn v-delete text @click="closePasswordModal">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

</template>

<script>
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';

export default {
  data() {
    return {
      roomTitle: '',
      sideVideos: [],
      OV: null,
      session: null,
      publisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      currentPage: 0,
      maxVideosPerPage: 4,
      showPasswordModal: false,
      enteredPassword: '',
      roomPassword: '', 
    };
  },
  computed: {
    paginatedSideVideos() {
      const start = this.currentPage * this.maxVideosPerPage;
      return this.sideVideos.slice(start, start + this.maxVideosPerPage);
    },
  },
  
  created() {
    this.checkRoomPassword();
  },
  methods: {

    async checkRoomPassword() {
    const { sessionId } = this.$route.params;
    try {
      const response = await axios.get(`/api/rooms/${sessionId}`);
      this.roomPassword = response.data.password;

      if (this.roomPassword) {
        this.showPasswordModal = true;
      } else {
        this.initializeRoom();
      }
    } catch (error) {
      console.error("방 정보를 확인하는 중 오류 발생:", error);
    }
  },

    checkPassword() {
      if (this.enteredPassword === this.roomPassword) {
        this.showPasswordModal = false;
        this.initializeRoom();
      } else {
        alert("비밀번호가 일치하지 않습니다.");
      }
    },

    closePasswordModal() {
      this.showPasswordModal = false;
      this.$router.push({ name: 'RoomList' });
    },


    async initializeRoom() {
      const { sessionId } = this.$route.params;
      try {
        console.log("세션 ID로 서버 연결 시도 중:", sessionId);

        const response = await axios.post(`/api/rooms/${sessionId}/join`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        const token = response.data.token;

        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        // 다른 참가자의 스트림 구독 처리
        this.session.on('streamCreated', (event) => {
          console.log('새 스트림 생성됨:', event.stream);
          const subscriber = this.session.subscribe(event.stream, undefined);
          this.sideVideos.push(subscriber);

          // 지연을 줘서 `sideVideos` 배열 업데이트 후 srcObject 설정
          setTimeout(() => {
            const videoRefName = 'sideVideo' + (this.sideVideos.length - 1);
            const sideVideoElement = this.$refs[videoRefName][0];

            if (sideVideoElement) {
              sideVideoElement.srcObject = subscriber.stream.getMediaStream();
              sideVideoElement.play().catch(error => {
                console.warn("비디오 자동 재생이 차단되었습니다:", error);
              });
              console.log(`다른 참가자의 스트림이 ${videoRefName}에 연결됨: ${subscriber.stream.streamId}`);
              console.log(`${subscriber.stream.streamId} 비디오 요소 srcObject 설정 확인:`, sideVideoElement.srcObject);
            } else {
              console.warn(`비디오 요소를 찾을 수 없음: ${videoRefName}`);
            }
          }, 500); // 500ms 지연
        });

        this.session.on('connectionCreated', (event) => {
          console.log(`새 참가자 연결됨: ${event.connection.connectionId}`);
        });

        this.session.on('connectionDestroyed', (event) => {
          console.log(`참가자 연결 해제됨: ${event.connection.connectionId}`);
        });

        await this.session.connect(token, { clientData: "사용자명" });

        // 자신의 비디오 스트림 생성 및 mainVideo에 연결
        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined, 
          audioSource: undefined, 
          publishAudio: true,
          publishVideo: true,
          mirror: true, 
        });

        this.publisher.once('accessAllowed', () => {
          console.log("내 비디오 스트림 설정됨.");
          this.$refs.mainVideo.srcObject = this.publisher.stream.getMediaStream();
        });

        this.session.publish(this.publisher);
      } catch (error) {
        console.error("방 참여 중 오류 발생:", error);
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

    toggleScreenShare() {
    if (!this.isScreenSharing) {
        const screenPublisher = this.OV.initPublisher(undefined, {
            videoSource: 'screen',
            publishAudio: this.isAudioEnabled,
        });

        // 기존의 카메라 스트림을 사이드로 이동시키지 않고 유지
        this.session.unpublish(this.publisher); 
        this.publisher = screenPublisher;
        this.session.publish(this.publisher);
        this.isScreenSharing = true;
    } else {
        const cameraPublisher = this.OV.initPublisher(undefined, {
            videoSource: undefined,
            audioSource: undefined,
            publishAudio: this.isAudioEnabled,
            publishVideo: this.isVideoEnabled,
            mirror: true,
        });

        this.session.unpublish(this.publisher);
        this.publisher = cameraPublisher;
        this.session.publish(this.publisher);
        this.isScreenSharing = false;
    }
}
,

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
        console.error("방 나가기 중 오류 발생:", error);
      }
    },


    switchToMain(subscriber, index) {
    const mainVideoElement = this.$refs.mainVideo;
    const sideVideoElement = this.$refs['sideVideo' + (this.currentPage * this.maxVideosPerPage + index)][0];

    if (mainVideoElement && sideVideoElement) {
        const mainStream = mainVideoElement.srcObject;
        const sideStream = subscriber.stream.getMediaStream();

        mainVideoElement.srcObject = sideStream;
        sideVideoElement.srcObject = mainStream;

        // 메인과 사이드 비디오 위치를 자유롭게 전환할 수 있도록 업데이트
        const mainSubscriber = this.mainSubscriber;
        this.mainSubscriber = subscriber;
        this.sideVideos[index] = mainSubscriber;

        // 비디오 교체 후 다시 로드
        mainVideoElement.load();
        sideVideoElement.load();
    }
}
,
    prevPage() {
      if (this.currentPage > 0) this.currentPage--;
    },
    nextPage() {
      if ((this.currentPage + 1) * this.maxVideosPerPage < this.sideVideos.length) this.currentPage++;
    },
  },
};
</script>


<style>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.main-video {
  width: 70%;
  max-width: 900px;
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


.side-videos-container {
  display: flex;
  align-items: center;
}

.side-videos {
  display: flex;
  gap: 15px;
  max-width: 85%;
}

.side-video {
  width: 200px;
  height: 130px;
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