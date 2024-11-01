<template>
  <div>
    <h1>방 목록</h1>
    <!-- 방 제목 입력 -->
    <input v-model="newRoomTitle" placeholder="방 제목을 입력하세요" />
    <button @click="createRoom">방 생성하기</button>

    <ul v-if="rooms.length">
      <li v-for="room in rooms" :key="room.sessionId">
        <span>{{ room.title }}</span>
        <button @click="joinRoom(room.sessionId)">참가하기</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const rooms = ref([]);
    const newRoomTitle = ref("");
    const router = useRouter();

    const getRooms = async () => {
      try {
        const response = await axios.get("https://server.exodiapot.xyz/api/rooms/list");
        rooms.value = response.data;
      } catch (error) {
        console.error("방 목록 조회 오류: ", error);
      }
    };

    const createRoom = async () => {
      if (!newRoomTitle.value) {
        alert("방 제목을 입력해주세요.");
        return;
      }

      try {
        const response = await axios.post("https://server.exodiapot.xyz/api/rooms/create", {
          title: newRoomTitle.value,
        });
        console.log("방 생성 성공: ", response.data);
        newRoomTitle.value = "";  // 입력 필드 초기화
        getRooms();  // 방 목록 갱신
      } catch (error) {
        console.error("방 생성 오류: ", error);
      }
    };

    const joinRoom = (sessionId) => {
      router.push({
        name: "VideoRoom",
        params: { sessionId },
      });
    };

    onMounted(() => {
      getRooms();
    });

    return { rooms, newRoomTitle, getRooms, createRoom, joinRoom };
  },
};
</script>

<style scoped>
/* 필요한 스타일 추가 가능 */
</style>
