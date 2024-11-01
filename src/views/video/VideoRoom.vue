<template>
  <div>
    <h1>화상 회의 방</h1>
    <div ref="videoContainer" class="video-container"></div>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { OpenVidu } from "openvidu-browser";

export default {
  props: ["sessionId"],
  setup(props) {
    const videoContainer = ref(null);
    const OV = ref(null);
    const session = ref(null);
    const publisher = ref(null);
    const subscribers = ref([]);
    const isVideoEnabled = ref(true);
    const isAudioEnabled = ref(true);
    const isScreenShared = ref(false);

    const joinRoom = async () => {
      try {
        const response = await axios.post("https://server.exodiapot.xyz/api/sessions/get-token", {
          sessionId: props.sessionId,
        });
        const token = response.data;

        OV.value = new OpenVidu();
        session.value = OV.value.initSession();

        session.value.on("streamCreated", (event) => {
          const subscriberContainer = document.createElement("div");
          videoContainer.value.appendChild(subscriberContainer);

          try {
            const subscriber = session.value.subscribe(event.stream, subscriberContainer);
            subscribers.value.push({ subscriber, container: subscriberContainer });
            console.log("Subscriber successfully added:", subscriber);
          } catch (error) {
            console.error("Error adding subscriber:", error);
          }
      });

        session.value.on("streamDestroyed", (event) => {
          const subscriberData = subscribers.value.find(s => s.subscriber.stream.streamId === event.stream.streamId);
          if (subscriberData) {
            videoContainer.value.removeChild(subscriberData.container);
            subscribers.value = subscribers.value.filter(s => s !== subscriberData);
          }
        });

        await session.value.connect(token, { clientData: "사용자 이름" });

        publisher.value = OV.value.initPublisher(videoContainer.value, {
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
        const screenPublisher = await OV.value.initPublisherAsync(videoContainer.value, {
          videoSource: "screen",
          publishAudio: isAudioEnabled.value,
          publishVideo: true,
        });
        session.value.unpublish(publisher.value);
        session.value.publish(screenPublisher);
        publisher.value = screenPublisher;
      } else {
        session.value.unpublish(publisher.value);
        publisher.value = OV.value.initPublisher(videoContainer.value, {
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
      videoContainer,
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
.video-container {
  display: flex;
  flex-wrap: wrap;
}
.controls {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>
