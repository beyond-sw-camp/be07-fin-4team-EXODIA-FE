<template>
  <div class="room-list">
    <h1>방 목록</h1>

    <!-- 방 생성 -->
    <input v-model="newRoomTitle" placeholder="방 제목을 입력하세요" />
    <button @click="createRoom">방 생성하기</button>

    <!-- 방 목록 -->
    <ul v-if="rooms.length" class="room-list-container">
      <li
        v-for="room in rooms"
        :key="room.sessionId"
        class="room-item"
        @click="joinRoom(room.sessionId)"
      >
        <div class="room-box">
          <div class="room-title">{{ room.title }}</div>
          <div class="room-participants">참여 인원: {{ room.participantCount }}</div>
        </div>
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
        newRoomTitle.value = ""; // 입력 필드 초기화
        getRooms(); // 방 목록 갱신
      } catch (error) {
        console.error("방 생성 오류: ", error);
      }
    };

    const joinRoom = async (sessionId) => {
      const userNum = localStorage.getItem("userNum");
      if (!userNum) {
        console.error("User number is missing.");
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await axios.post(`https://server.exodiapot.xyz/api/rooms/${sessionId}/join`, null, {
          params: { userId: userNum },
        });
        const token = response.data.token;
        router.push({
          name: "VideoRoom",
          params: { sessionId, token },
        });
      } catch (error) {
        console.error("참가 중 오류 발생: ", error);
        alert("방 참가에 실패했습니다. 다시 시도해주세요.");
      }
    };

    onMounted(() => {
      getRooms();
    });

    return { rooms, newRoomTitle, getRooms, createRoom, joinRoom };
  },
};
</script>

<style scoped>
.room-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.room-list-container {
  list-style-type: none;
  padding: 0;
  width: 100%;
  max-width: 600px;
}

.room-item {
  cursor: pointer;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.room-box {
  background-color: #333;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.room-title {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.room-participants {
  font-size: 1em;
  color: #aaa;
}
</style>
