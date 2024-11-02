<template>
  <div>
    <h1>화상 회의 방</h1>
    <div ref="mainVideoContainer" class="main-video-container"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { OpenVidu } from "openvidu-browser";

export default {
  props: ["sessionId", "token"],
  setup(props) {
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

        await session.value.connect(props.token, { clientData: "사용자 이름" });

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
