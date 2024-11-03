<template>
  <div>
    <h1>방 생성</h1>
    <input v-model="title" placeholder="방 제목을 입력하세요" />
    <button @click="createRoom">방 생성하기</button>
    <button @click="getRooms">방 목록 조회하기</button>

    <ul v-if="rooms.length">
      <li v-for="room in rooms" :key="room.sessionId">
        <span>{{ room.title }}</span>
        <button @click="joinRoom(room.sessionId)">방 참가</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      title: "",
      rooms: [],
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async createRoom() {
      try {

        const response = await axios.post("https://server.exodiapot.xyz/api/rooms/create", {
  title: this.title,
});

        console.log("방 생성 성공: ", response.data);
        this.getRooms(); // 방 목록 갱신
      } catch (error) {
        console.error("방 생성 오류: ", error);
      }
    },
    async getRooms() {
      try {
        const response = await axios.get("https://server.exodiapot.xyz/api/rooms/list");
        this.rooms = response.data;
      } catch (error) {
        console.error("방 목록 조회 오류: ", error);
      }
    },
    joinRoom(sessionId) {
      this.$router.push({ name: "VideoRoom", params: { sessionId } });
    },
  },
};
</script>
