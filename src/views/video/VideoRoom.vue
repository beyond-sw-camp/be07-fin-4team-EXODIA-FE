<template>
  <div class="room-view">
    <h2>화상회의 방: {{ roomTitle }}</h2>

    <!-- 화면 공유 중일 때 레이아웃 -->
    <div v-if="isScreenSharing" class="screen-share-layout">
      <div class="screen-share-video">
        <!-- Adjust to use `screenPublisher` in the layout -->
        <video :srcObject="screenPublisher ? screenPublisher.stream.getMediaStream() : null" autoplay playsinline></video>
      </div>
    
      <div class="vertical-videos">
        <div v-for="(video, index) in paginatedVideos" :key="index" class="video-container" @mouseover="showFullscreenIcon(index)" @mouseleave="hideFullscreenIcon(index)">
          <video :ref="'video' + index" :srcObject="video.stream.getMediaStream()" autoplay playsinline></video>
          <p class="video-name">{{ parseClientData(video.stream.connection.data) }}</p>
          <v-icon v-if="video.showFullscreenIcon" class="fullscreen-icon" @click="toggleFullscreen(index)">
            mdi-fullscreen
          </v-icon>
        </div>
    
        <div class="pagination-controls">
          <button @click="previousPage" :disabled="page === 0">Previous</button>
          <button @click="nextPage" :disabled="!hasNextPage">Next</button>
        </div>
      </div>
    </div>
    


    <!-- 일반 6분할 레이아웃 (화면 공유 중이 아닐 때) -->
    <div v-else class="video-grid" :class="'grid-' + Math.min(videos.length, 6)">
      <div v-for="(video, index) in videos" :key="index" class="video-container" @mouseover="showFullscreenIcon(index)" @mouseleave="hideFullscreenIcon(index)">
        <video :ref="'video' + index" :srcObject="video.stream.getMediaStream()" autoplay playsinline :muted="index === 0"></video>
        <p class="video-name">{{ parseClientData(video.stream.connection.data) }}</p>
        <v-icon
          v-if="video.showFullscreenIcon"
          class="fullscreen-icon"
          @click="toggleFullscreen(index)"
        >
          mdi-fullscreen
        </v-icon>
      </div>
    </div>


    <!-- 화면 공유 권한 요청 모달 -->
    <v-dialog v-model="showApprovalDialog" max-width="400">
      <v-card>
        <v-card-title>화면 공유 승인 요청</v-card-title>
        <v-card-text>다른 사용자가 화면 공유 권한을 요청했습니다. 승인하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="approveScreenShare">승인</v-btn>
          <v-btn color="secondary" @click="declineScreenShare">거부</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



    <!-- 컨트롤 버튼들 -->
    <v-row class="controls" justify="center">
      <v-btn icon @click="toggleAudio">
        <v-icon>{{ isAudioEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleVideo">
        <v-icon>{{ isVideoEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="startScreenShare">
        <v-icon>{{ isScreenSharing ? 'mdi-monitor-off' : 'mdi-monitor-share' }}</v-icon>
      </v-btn>
      <v-btn icon @click="leaveRoom">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';

export default {
  data() {
    return {
 roomTitle: '',
      videos: [], 
      OV: null,
      session: null,
      publisher: null,
      screenPublisher: null,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      page: 0,
      showApprovalDialog: false,
      pendingScreenShareRequest: null,
      currentScreenSharer: null,
    };
  },
  computed: {
    paginatedVideos() {
      const start = this.page * 3;
      return this.videos.slice(start, start + 3);
    },
    hasNextPage() {
      return (this.page + 1) * 3 < this.videos.length;
    }
  },
  created() {
    this.initializeRoom();
  },

  methods: {
    parseClientData(data) {
      try {
      const parts = data.split('%/%');
      
      if (parts[1]) {
        return parts[1];
      }
      const parsedData = JSON.parse(parts[0]);
      return parsedData.clientData || 'Unknown';
    } catch (e) {
      return data || 'Unknown';
    }
  },


    async initializeRoom() {
      const { sessionId } = this.$route.params;
      try {
        const response = await axios.post(`/api/rooms/${sessionId}/join`, null, {
          params: { userNum: localStorage.getItem("userNum") },
        });
        const token = response.data.token;

        this.OV = new OpenVidu();
        this.session = this.OV.initSession();

        this.session.on('streamCreated', (event) => {
          const subscriber = this.session.subscribe(event.stream, undefined);
          subscriber.showFullscreenIcon = false; 
          this.videos.push(subscriber);

          // 비디오의 srcObject를 설정
          setTimeout(() => {
            const videoRefName = 'video' + (this.videos.length - 1);
            const videoElement = this.$refs[videoRefName][0];

            if (videoElement && subscriber.stream) {
              videoElement.srcObject = subscriber.stream.getMediaStream();
              videoElement.play().catch((error) => {
                console.warn("Video auto-play blocked", error);
              });
            }
          }, 500);
        });

        this.session.on('streamDestroyed', (event) => {
          this.removeVideo(event.stream);
        });


        this.session.on('signal:screenShare', (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'start') {
          this.isScreenSharing = true;
          
          const screenStream = this.videos.find(video => video.stream && video.stream.hasVideo('screen'));
          if (screenStream) {
            this.screenPublisher = screenStream;
          }

        } else if (data.action === 'stop') {
          this.isScreenSharing = false;
          this.screenPublisher = null;
        }
      });



        await this.session.connect(token, { clientData: localStorage.getItem("userName") || "Unknown User" });

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
          mirror: true,
        });

        this.publisher.once('accessAllowed', () => {
          this.videos.unshift(this.publisher);
          this.$refs.video0.srcObject = this.publisher.stream.getMediaStream();
        });

        this.session.publish(this.publisher);
      } catch (error) {
        console.error("Error joining the room:", error);
      }
    },

    removeVideo(stream) {
      this.videos = this.videos.filter((video) => video.stream !== stream);
    },

    toggleAudio() {
      this.isAudioEnabled = !this.isAudioEnabled;
      this.publisher.publishAudio(this.isAudioEnabled);
    },
    toggleVideo() {
      this.isVideoEnabled = !this.isVideoEnabled;
      this.publisher.publishVideo(this.isVideoEnabled);
    },

    toggleFullscreen(index) {
    const videoElement = this.$refs[`video${index}`][0];
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.mozRequestFullScreen) {
      videoElement.mozRequestFullScreen();
    } else if (videoElement.webkitRequestFullscreen) { 
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) { 
      videoElement.msRequestFullscreen();
    }
  },



  showFullscreenIcon(index) {
      this.videos[index].showFullscreenIcon = true;
    },
  hideFullscreenIcon(index) {
      this.videos[index].showFullscreenIcon = false;
    },


  nextPage() {
      if (this.hasNextPage) {
        this.page++;
      }
    },

    previousPage() {
      if (this.page > 0) {
        this.page--;
      }
    },

    async startScreenShare() {
  if (this.isScreenSharing) {
    this.stopScreenShare();
  } else if (this.currentScreenSharer) {
    this.showApprovalDialog = true;
    this.pendingScreenShareRequest = this.publisher;
  } else {
    this.beginScreenShare();
  }
},

    async beginScreenShare() {
      try {
        const screenPublisher = this.OV.initPublisher(undefined, {
          videoSource: 'screen',
          publishAudio: this.isAudioEnabled,
        });

        await this.session.unpublish(this.publisher);
        this.videos.splice(0, 1, screenPublisher);
        await this.session.publish(screenPublisher);

        this.isScreenSharing = true;
        this.screenPublisher = screenPublisher;
        this.currentScreenSharer = this.publisher;

        // Broadcast screen sharing status
        this.session.signal({
          type: 'screenShare',
          data: JSON.stringify({ action: 'start' }),
        });
      } catch (error) {
        console.error("Failed to start screen share:", error);
      }
    },

    async stopScreenShare() {
      try {
        await this.session.unpublish(this.screenPublisher);
        this.screenPublisher = null;

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: undefined,  
          audioSource: undefined,
          publishAudio: this.isAudioEnabled,
          publishVideo: this.isVideoEnabled,
          mirror: true,
        });

        await this.session.publish(this.publisher);
        this.videos.splice(0, 1, this.publisher);

        this.isScreenSharing = false;
        this.currentScreenSharer = null;

        // Broadcast screen sharing status
      this.session.signal({
        type: 'screenShare',
        data: JSON.stringify({ action: 'stop' }), 
      });
      } catch (error) {
        console.error("Failed to stop screen share:", error);
      }
    },


    approveScreenShare() {
      this.stopScreenShare();
      this.beginScreenShare();
      this.showApprovalDialog = false;
      this.pendingScreenShareRequest = null;
    },

    declineScreenShare() {
      this.showApprovalDialog = false;
      this.pendingScreenShareRequest = null;
    },



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
        console.error("Error leaving the room:", error);
      }
    }
  },
}
</script>


<style>
.room-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.video-grid {
  display: grid;
  gap: 10px;
  max-width: 80vw;
  max-height: 80vh;
  width: 100%;
  height: 100%;
}

.grid-1 {
  grid-template-columns: 1fr;
}

.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.grid-5,
.grid-6 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid #3498db;
}

.video-container video {
  width: 100%;
  height: 100%;
}

.video-name {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.8em;
}

.fullscreen-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #fff;
  cursor: pointer;
}

.screen-share-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.screen-share-video {
  width: 66.66%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-share-video video {
  width: 100%;
  height: 100%;
}

.vertical-videos {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  overflow-y: auto;
  padding: 10px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
}
</style>