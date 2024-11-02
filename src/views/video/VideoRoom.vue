<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { OpenVidu } from "openvidu-browser";
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    // `token`에서 실제 token 값만 추출
    let fullToken = route.params.token;
    let token = fullToken && fullToken.includes("token=")
      ? fullToken.split("token=")[1] // "token=" 이후의 부분만 추출
      : fullToken;

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

    const changeMainStream = (subscriber) => {
      mainVideoContainer.value.innerHTML = "";
      subscriber.addVideoElement(mainVideoContainer.value);
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
      changeMainStream,
      isVideoEnabled,
      isAudioEnabled,
      isScreenShared,
    };
  },
};
</script>
