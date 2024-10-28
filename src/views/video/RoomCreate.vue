<template>
    <div>
      <v-btn @click="openModal">방 생성하기</v-btn>
      <v-dialog v-model="isModalOpen" max-width="400">
        <v-card>
          <v-card-title>방 생성</v-card-title>
          <v-card-text>
            <v-text-field label="방 이름" v-model="roomName" required></v-text-field>
            <v-checkbox label="비밀번호 설정" v-model="isPasswordEnabled"></v-checkbox>
            <v-text-field label="비밀번호" v-if="isPasswordEnabled" v-model="password"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="createRoom">생성</v-btn>
            <v-btn color="secondary" @click="closeModal">취소</v-btn>
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
        roomName: '',
        password: '',
        isPasswordEnabled: false,
        isModalOpen: false,
      };
    },
    methods: {
      openModal() {
        this.isModalOpen = true;
      },
      closeModal() {
        this.isModalOpen = false;
      },
      
      async createRoom() {
  try {
    const response = await axios.post('http://localhost:8087/api/rooms/create', {
      roomName: this.roomName,
      password: this.isPasswordEnabled ? this.password : null,
    });

    const sessionId = response.data.sessionId;

    if (!sessionId) {
      throw new Error("sessionId가 반환되지 않았습니다.");
    }

    this.closeModal();
    this.$router.push({ name: 'VideoRoom', params: { sessionId } });
  } catch (error) {
    console.error('방 생성 오류:', error.message);
  }
}

    },
  };
  </script>
  