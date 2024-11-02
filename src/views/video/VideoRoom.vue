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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { OpenVidu } from "openvidu-browser";
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const token = route.params.token;

    if (!token) {
      console.error("Token is missing in query.");
      throw new Error("Token is required to join the session.");
    }

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

    const joinRoom = async () => {
      try {
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

    onMounted(joinRoom);
    onBeforeUnmount(() => {
      if (session.value) session.value.disconnect();
      OV.value = null;
      session.value = null;
      publisher.value = null;
      subscribers.value = [];
    });

    return {
      mainVideoContainer,
      paginatedSubscribers,
      prevPage: () => { if (currentPage.value > 0) currentPage.value--; },
      nextPage: () => { if ((currentPage.value + 1) * itemsPerPage < subscribers.value.length) currentPage.value++; },
      leaveRoom: () => {
        if (session.value) session.value.disconnect();
        OV.value = null;
        session.value = null;
        publisher.value = null;
        subscribers.value = [];
      },
      toggleVideo: () => {
        if (publisher.value) {
          isVideoEnabled.value = !isVideoEnabled.value;
          publisher.value.publishVideo(isVideoEnabled.value);
        }
      },
      toggleAudio: () => {
        if (publisher.value) {
          isAudioEnabled.value = !isAudioEnabled.value;
          publisher.value.publishAudio(isAudioEnabled.value);
        }
      },
      shareScreen: async () => {
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
      },
      changeMainStream: (subscriber) => {
        mainVideoContainer.value.innerHTML = "";
        subscriber.addVideoElement(mainVideoContainer.value);
      },
      isVideoEnabled,
      isAudioEnabled,
      isScreenShared,
    };
  },
};
</script>
