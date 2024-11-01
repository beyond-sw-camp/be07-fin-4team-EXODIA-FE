<template>
  <div>
    <h1>방 목록</h1>
    <ul v-if="rooms.length">
      <li v-for="room in rooms" :key="room.sessionId">
        <span>{{ room.title }}</span>
        <button @click="joinRoom(room)">참가하기</button>
      </li>
    </ul>
    
    <button @click="createRoom">방 생성하기</button>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const rooms = ref([]);
    const router = useRouter();

    const getRooms = async () => {
      try {
        const response = await axios.get("https://server.exodiapot.xyz/api/rooms/list");
        rooms.value = response.data;
      } catch (error) {
        console.error("방 목록 조회 오류: ", error);
      }
    };

    const joinRoom = (sessionId) => {
  router.push({
    name: "VideoRoom",
    params: { sessionId }
  });
};



    onMounted(() => {
      getRooms();
    });

    return { rooms, joinRoom };
  },
};
</script>
