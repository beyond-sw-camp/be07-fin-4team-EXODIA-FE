<template>
  <div class="room-list">
    <h2>화상회의 목록</h2>
    <button @click="showCreateRoomModal = true" class="create-room-btn">방 생성</button>

    <!-- 방 목록 -->
    <div class="room-grid">
      <div v-for="room in rooms" :key="room.sessionId" class="room-card" @click="enterRoom(room.sessionId)">
        <div class="room-thumbnail">
          <h3>{{ room.title }}</h3>
        </div>
        <p>참가자 수: {{ room.participantCount }}</p>
      </div>
    </div>

    <!-- 방 생성 모달 -->
    <div v-if="showCreateRoomModal" class="modal-overlay">
      <div class="modal-content">
        <h3>방 생성</h3>
        <label>방 제목:</label>
        <input type="text" v-model="newRoomTitle" placeholder="방 제목을 입력하세요" class="modal-input" />
        <div class="modal-buttons">
          <button @click="createRoom" class="modal-btn">생성</button>
          <button @click="closeModal" class="modal-btn cancel">취소</button>
        </div>
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
        if (newRoom && newRoom.sessionId) {
          this.rooms.push(newRoom);
          this.closeModal();
          this.enterRoom(newRoom.sessionId); // 생성 후 입장
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
  flex-direction: column;
  align-items: center;
}

.create-room-btn {
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 600px;
}

.room-card {
  padding: 15px;
  background: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
}

.room-thumbnail {
  width: 100%;
  height: 100px;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 4px;
}

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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.modal-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-btn.cancel {
  background-color: #f44336;
}
</style>
