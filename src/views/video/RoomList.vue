<!-- RoomList.vue -->
<template>
  <div>
    <h1>방 목록</h1>
    <input v-model="newRoomTitle" placeholder="방 제목을 입력하세요" />
    <button @click="createRoom">방 생성하기</button>

    <div class="rooms-container" v-if="rooms.length">
      <div
        v-for="room in rooms"
        :key="room.sessionId"
        class="room-box"
        @click="joinRoom(room.sessionId)"
      >
        <div class="room-title">{{ room.title }}</div>
        <div class="participant-count">참여 인원: {{ room.participantCount }}</div>
      </div>
    </div>
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
      const userNum = localStorage.getItem("userNum");
      if (!newRoomTitle.value || !userNum) {
        alert("방 제목과 사용자 번호를 입력해주세요.");
        return;
      }

      try {
        const response = await axios.post("https://server.exodiapot.xyz/api/rooms/create", {
          title: newRoomTitle.value,
          userNum: userNum,
        });
        console.log("방 생성 성공: ", response.data);
        newRoomTitle.value = "";

        const sessionId = response.data.sessionId;
        const token = response.data.token.match(/token=([^&]*)/)[1];

        if (sessionId && token) {
          router.push({
            name: "VideoRoom",
            params: { sessionId, token },
          });
        }

        getRooms(); // 방 목록 갱신
      } catch (error) {
        console.error("방 생성 오류: ", error);
      }
    };

    const joinRoom = async (sessionId) => {
      const userNum = localStorage.getItem("userNum");
      if (!userNum) {
        console.error("User number is missing.");
        return;
      }

      try {
        const response = await axios.post(`https://server.exodiapot.xyz/api/rooms/${sessionId}/join`, null, {
          params: { userNum: userNum },
        });
        const token = response.data.token.match(/token=([^&]*)/)[1];
        router.push({
          name: "VideoRoom",
          params: { sessionId, token },
        });
      } catch (error) {
        console.error("참가 중 오류 발생: ", error);
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
.rooms-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.room-box {
  padding: 20px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.room-box:hover {
  transform: scale(1.05);
}

.room-title {
  font-size: 18px;
  font-weight: bold;
}

.participant-count {
  margin-top: 10px;
  font-size: 14px;
  color: #ccc;
}
</style>
