<template>
  <div class="room-list">
    <h2>화상회의 목록</h2>
    <button @click="showCreateRoomModal = true">방 생성</button>

    <!-- 방 목록 -->
    <div v-for="room in rooms" :key="room.sessionId" class="room-card" @click="enterRoom(room.sessionId)">
      <div class="room-thumbnail">
        <h3>{{ room.title }}</h3>
      </div>
      <p>참가자 수: {{ room.participantCount }}</p>
    </div>

    <!-- 방 생성 모달 -->
    <div v-if="showCreateRoomModal" class="modal-overlay">
      <div class="modal-content">
        <h3>방 생성</h3>
        <label>방 제목:</label>
        <input type="text" v-model="newRoomTitle" placeholder="방 제목을 입력하세요" />
        <button @click="createRoom">생성</button>
        <button @click="closeModal">취소</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      rooms: [],
      showCreateRoomModal: false,
      newRoomTitle: '',
    };
  },
  created() {
    this.fetchRooms();
  },
  methods: {
    async fetchRooms() {
      try {
        const response = await axios.get('/api/rooms/list');
        this.rooms = response.data;
      } catch (error) {
        console.error("방 목록 조회 오류:", error);
      }
    },
    async createRoom() {
  try {
    const response = await axios.post('/api/rooms/create', {
      title: this.newRoomTitle,
      userNum: localStorage.getItem("userNum"),
    });
    const newRoom = response.data;
    console.log("방 생성 성공:", newRoom); // 응답 데이터 확인

    if (newRoom && newRoom.sessionId) {
      this.rooms.push(newRoom);
      this.closeModal();
      this.enterRoom(newRoom.sessionId); // sessionId가 있을 경우에만 입장
    } else {
      console.error("유효하지 않은 방 응답 데이터:", newRoom);
    }
  } catch (error) {
    console.error("방 생성 오류:", error);
  }
},
    enterRoom(sessionId) {
      this.$router.push({ name: 'RoomView', params: { sessionId } });
    },
    closeModal() {
      this.showCreateRoomModal = false;
      this.newRoomTitle = '';
    },
  },
};
</script>

<style>
.room-list {
  display: flex;
  flex-wrap: wrap;
}
.room-card {
  width: 200px;
  margin: 10px;
  padding: 10px;
  cursor: pointer;
}
.room-thumbnail {
  width: 100%;
  height: 120px;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}
.room-info {
  text-align: center;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}
</style>
