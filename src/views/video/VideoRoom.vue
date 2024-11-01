<template>
  <div>
    <h1>화상 회의 방</h1>
    <button @click="leaveRoom">회의 종료</button>
    <div ref="videoContainer"></div>
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

    const joinRoom = async () => {
      try {
        const response = await axios.post("https://server.exodiapot.xyz/api/sessions/get-token", {
          sessionId: props.sessionId,
        });
        const token = response.data;

        OV.value = new OpenVidu();
        session.value = OV.value.initSession();

        session.value.on("streamCreated", (event) => {
          const subscriber = session.value.subscribe(event.stream, videoContainer.value);
          subscribers.value.push(subscriber);
        });

        session.value.on("streamDestroyed", (event) => {
          subscribers.value = subscribers.value.filter((s) => s !== event.stream.streamId);
        });

        await session.value.connect(token, { clientData: "사용자 이름" });

        publisher.value = OV.value.initPublisher(videoContainer.value);
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

    onMounted(joinRoom);
    onBeforeUnmount(leaveRoom);

    return { videoContainer, leaveRoom };
  },
};
</script>
