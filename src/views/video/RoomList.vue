<template>
    <v-container>
      <!-- 방 만들기 버튼과 모달 창 -->
      <v-btn @click="showCreateModal" color="primary" dark>방 만들기</v-btn>
      <v-dialog v-model="isCreateModalVisible" max-width="400px">
        <v-card>
          <v-card-title>방 만들기</v-card-title>
          <v-card-text>
            <v-text-field v-model="roomName" label="방 이름" outlined></v-text-field>
            <v-text-field v-model="password" label="비밀번호 (선택)" outlined type="password"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="createRoom" color="success">생성</v-btn>
            <v-btn @click="isCreateModalVisible = false" color="grey">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- 방 목록 -->
      <v-list>
        <v-list-item v-for="room in rooms" :key="room.id">
          <v-list-item-content>
            <v-list-item-title>{{ room.roomName }}</v-list-item-title>
            <v-list-item-subtitle v-if="room.password">🔒 비밀번호 설정됨</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="joinRoom(room.id, room.password)" color="primary" outlined>참가</v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        rooms: [],
        isCreateModalVisible: false,
        roomName: '',
        password: '',
      };
    },
    methods: {
      showCreateModal() {
        this.isCreateModalVisible = true;
      },
      async createRoom() {
   try {
      const response = await axios.post('/api/rooms/create', {
         roomName: this.roomName,
         password: this.password
      });
      const newRoom = response.data;

      await this.joinRoom(newRoom.id, newRoom.sessionId)
   } catch (error) {
      console.error("방 생성 중 오류 발생:", error);
   } finally {
      this.isCreateModalVisible = false;
   }
},
async joinRoom(roomId, sessionId) {
    try {
        if (!roomId || !sessionId) {
            throw new Error("방 참가를 위한 필수 정보가 없습니다.");
        }
        this.$router.push({ name: 'VideoRoom', params: { roomId, sessionId } });
    } catch (error) {
        console.error("방 참가 중 오류 발생:", error);
    }
      },
    },
    async created() {
      const response = await axios.get('/api/rooms/list');
      this.rooms = response.data;
    },
  };
  </script>
  
  <style scoped>
  .v-container {
    max-width: 600px;
    margin: auto;
  }
  </style>
  