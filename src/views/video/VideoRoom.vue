<!-- VideoRoom.vue -->
<template>
  <div>
    <h1>화상 회의 방</h1>
    <div ref="mainVideoContainer" class="main-video-container"></div>
    <div class="subscriber-container">
      <button @click="prevPage" v-if="currentPage > 0">‹</button>
      <div class="subscribers">
        <div
          v-for="subscriber in paginatedSubscribers"
          :key="subscriber.stream.streamId"
          class="subscriber-video"
          @click="changeMainStream(subscriber)"
        >
          <video ref="subscriberVideo" autoplay></video>
        </div>
      </div>
      <button @click="nextPage" v-if="hasMorePages">›</button>
    </div>

    <!-- 컨트롤 버튼들 -->
    <div class="controls">
      <v-btn icon @click="toggleVideo">
        <v-icon>{{ isVideoEnabled ? 'mdi-video' : 'mdi-video-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="toggleAudio">
        <v-icon>{{ isAudioEnabled ? 'mdi-microphone' : 'mdi-microphone-off' }}</v-icon>
      </v-btn>
      <v-btn icon @click="shareScreen">
        <v-icon>{{ isScreenShared ? 'mdi-monitor-share' : 'mdi-monitor' }}</v-icon>
      </v-btn>
      <v-btn icon @click="leaveRoom">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { OpenVidu } from "openvidu-browser";
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const token = route.params.token;

    if (!token) {
      console.error("Token이 누락되었습니다. 세션에 참여할 수 없습니다.");
      return; // 토큰이 없으면 방에 입장할 수 없으므로 함수 종료
    }

    const mainVideoContainer = ref(null);
    const OV = ref(null);
    const session = ref(null);
    const publisher = ref(null);

    const joinRoom = async () => {
      try {
        OV.value = new OpenVidu();
        session.value = OV.value.initSession();

        session.value.on("streamCreated", (event) => {
          const subscriber = session.value.subscribe(event.stream, document.createElement("div"));
          mainVideoContainer.value.appendChild(subscriber.videos[0].video);
        });

        await session.value.connect(token, { clientData: "사용자 이름" });

        publisher.value = OV.value.initPublisher(mainVideoContainer.value, {
          videoSource: undefined,
          audioSource: undefined,
          publishAudio: true,
          publishVideo: true,
        });
        session.value.publish(publisher.value);
      } catch (error) {
        console.error("화상 회의 방 참가 오류: ", error);
      }
    };

    onMounted(joinRoom);
    onBeforeUnmount(() => {
      if (session.value) session.value.disconnect();
      OV.value = null;
      session.value = null;
      publisher.value = null;
    });

    return {
      mainVideoContainer,
    };
  },
};
</script>

<style scoped>
.main-video-container {
  width: 100%;
  max-width: 800px;
  height: 600px;
  border: 1px solid #ddd;
}
</style>
