<template>
  <div class="room-list">
    <h2>화상회의 목록</h2>
    <button @click="showCreateRoomModal = true" class="create-room-btn">방 생성</button>

    <!-- 방 목록 -->
    <div class="room-grid">
    <!-- 방 목록 부분에서 클릭 이벤트 수정 -->
    <div v-for="room in rooms" :key="room.sessionId" class="room-card" @click="enterRoom(room)">
      <div class="room-thumbnail">
        <h3>{{ room.title }}</h3>
        <v-icon v-if="room.password">mdi-lock</v-icon>
      </div>
      <p>참가자 수: {{ room.participantCount }}</p>
</div>

    </div>

    <!-- 방 생성 모달 -->
    <v-dialog v-model="showCreateRoomModal" max-width="400">
      <v-card>
        <v-card-title>방 생성</v-card-title>
        <v-card-text>
          <v-text-field v-model="newRoomTitle" label="방 제목" required></v-text-field>
          <v-checkbox v-model="enablePassword" label="비밀번호 설정"></v-checkbox>
          <v-text-field v-if="enablePassword" v-model="newRoomPassword" label="비밀번호" type="password"></v-text-field>
          <v-text-field v-if="enablePassword" v-model="newRoomPasswordConfirm" label="비밀번호 확인" type="password"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn v-create  @click="createRoom">생성</v-btn>
          <v-btn v-delete @click="closeModal">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-dialog v-model="showPasswordModal" max-width="400">
      <v-card>
        <v-card-title>비밀번호 입력</v-card-title>
        <v-card-text>
          <v-text-field v-model="inputPassword" label="비밀번호" type="password" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn v-create  @click="verifyPassword">확인</v-btn>
          <v-btn v-delete @click="closePasswordModal">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      enablePassword: false,
      newRoomPassword: '',
      newRoomPasswordConfirm: '',
      showPasswordModal: false,
      inputPassword: '',
      selectedRoom: null,
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
      if (this.enablePassword && this.newRoomPassword !== this.newRoomPasswordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      try {
        const response = await axios.post('/api/rooms/create', {
          title: this.newRoomTitle,
          userNum: localStorage.getItem("userNum"),
          password: this.enablePassword ? this.newRoomPassword : null
        });
        const newRoom = response.data;
        if (newRoom && newRoom.sessionId) {
          this.rooms.push(newRoom);
          this.closeModal();
          this.enterRoom(newRoom); // 방 생성 후 입장
        } else {
          console.error("유효하지 않은 방 응답 데이터:", newRoom);
        }
      } catch (error) {
        console.error("방 생성 오류:", error);
      }
    },

  async enterRoom(room) {
    if (room.password) {
      this.selectedRoom = room;
      this.showPasswordModal = true;
    } else {
      this.$router.push({ name: 'RoomView', params: { sessionId: room.sessionId } });
    }
  },

  async verifyPassword() {
    try {
      const response = await axios.post(`/api/rooms/verify-password`, {
        sessionId: this.selectedRoom.sessionId,
        password: this.inputPassword,
      });
      if (response.data.success) {
        this.$router.push({ name: 'RoomView', params: { sessionId: this.selectedRoom.sessionId } });
        this.closePasswordModal();
      } else {
        alert("비밀번호가 틀렸습니다.");
      }
    } catch (error) {
      console.error("비밀번호 확인 오류:", error);
    }
  },


    closeModal() {
      this.showCreateRoomModal = false;
      this.newRoomTitle = '';
      this.newRoomPassword = '';
      this.newRoomPasswordConfirm = '';
      this.enablePassword = false;
    },

    closePasswordModal() {
      this.showPasswordModal = false;
      this.inputPassword = '';
      this.selectedRoom = null;
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
