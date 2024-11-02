<template>
  <div>
    <h1>화상 회의 방</h1>

    <!-- 본인 화면 (메인) -->
    <div ref="mainVideoContainer" class="main-video-container"></div>

    <!-- 다른 참가자 화면들 (하단에 가로 배치, 최대 4명씩) -->
    <div class="subscriber-container">
      <button @click="prevPage" v-if="currentPage > 0">‹</button>
      <div class="subscribers">
        <div
          v-for="subscriber in paginatedSubscribers"
          :key="subscriber.stream.streamId"
          class="subscriber-video"
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
import axios from "axios";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { OpenVidu } from "openvidu-browser";

export default {
  props: ['sessionId', 'token'],
  setup(props) {
    
    console.log("Session ID:", this.sessionId);
    console.log("Token:", this.token);

    const mainVideoContainer = ref(null);
    const subscribers = ref([]);
    const OV = ref(null);
    const session = ref(null);
    const publisher = ref(null);
    const currentPage = ref(0);
    const itemsPerPage = 4;

    const isVideoEnabled = ref(true);
    const isAudioEnabled = ref(true);
    const isScreenShared = ref(false);

    const paginatedSubscribers = computed(() => {
      const start = currentPage.value * itemsPerPage;
      return subscribers.value.slice(start, start + itemsPerPage);
    });

    const hasMorePages = computed(() => {
      return (currentPage.value + 1) * itemsPerPage < subscribers.value.length;
    });

    const prevPage = () => {
      if (currentPage.value > 0) currentPage.value--;
    };

    const nextPage = () => {
      if (hasMorePages.value) currentPage.value++;
    };

    const joinRoom = async () => {
      try {
        const response = await axios.post("https://server.exodiapot.xyz/api/sessions/get-token", {
          sessionId: props.sessionId,
        });
        const token = response.data;

        OV.value = new OpenVidu();
        session.value = OV.value.initSession();

        session.value.on("streamCreated", (event) => {
          const subscriber = session.value.subscribe(event.stream, document.createElement("div"));
          subscribers.value.push(subscriber);

          const subscriberContainer = document.querySelector(".subscribers");
          const subscriberVideoElement = document.createElement("video");
          subscriberVideoElement.dataset.streamId = event.stream.streamId;
          subscriberVideoElement.autoplay = true;
          subscriberContainer.appendChild(subscriberVideoElement);
          subscriber.addVideoElement(subscriberVideoElement);
        });

        session.value.on("streamDestroyed", (event) => {
          subscribers.value = subscribers.value.filter((s) => s.stream.streamId !== event.stream.streamId);

          const subscriberContainer = document.querySelector(".subscribers");
          const subscriberVideoElement = subscriberContainer.querySelector(`[data-stream-id="${event.stream.streamId}"]`);
          if (subscriberVideoElement) {
            subscriberContainer.removeChild(subscriberVideoElement);
          }
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

    const leaveRoom = () => {
      if (session.value) session.value.disconnect();
      OV.value = null;
      session.value = null;
      publisher.value = null;
      subscribers.value = [];
    };

    const toggleVideo = () => {
      if (publisher.value) {
        isVideoEnabled.value = !isVideoEnabled.value;
        publisher.value.publishVideo(isVideoEnabled.value);
      }
    };

    const toggleAudio = () => {
      if (publisher.value) {
        isAudioEnabled.value = !isAudioEnabled.value;
        publisher.value.publishAudio(isAudioEnabled.value);
      }
    };

    const shareScreen = async () => {
      if (!isScreenShared.value) {
        const screenPublisher = await OV.value.initPublisherAsync(mainVideoContainer.value, {
          videoSource: "screen",
          publishAudio: isAudioEnabled.value,
          publishVideo: true,
        });
        session.value.unpublish(publisher.value);
        session.value.publish(screenPublisher);
        publisher.value = screenPublisher;
      } else {
        session.value.unpublish(publisher.value);
        publisher.value = OV.value.initPublisher(mainVideoContainer.value, {
          publishAudio: isAudioEnabled.value,
          publishVideo: isVideoEnabled.value,
        });
        session.value.publish(publisher.value);
      }
      isScreenShared.value = !isScreenShared.value;
    };

    onMounted(joinRoom);
    onBeforeUnmount(leaveRoom);

    return {
      mainVideoContainer,
      paginatedSubscribers,
      prevPage,
      nextPage,
      hasMorePages,
      leaveRoom,
      toggleVideo,
      toggleAudio,
      shareScreen,
      isVideoEnabled,
      isAudioEnabled,
      isScreenShared,
    };
  },
};
</script>


<style scoped>
.main-video-container {
  width: 100%;
  max-width: 800px;
  height: 600px;
  margin-bottom: 20px;
  border: 2px solid #333;
}

.subscriber-container {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: hidden;
}

.subscribers {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
}

.subscriber-video {
  width: 150px;
  height: 100px;
  border: 1px solid #ddd;
}

.controls {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
