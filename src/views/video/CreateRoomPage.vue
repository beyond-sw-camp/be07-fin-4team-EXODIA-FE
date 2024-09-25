<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="room-create-card">
            <v-card-title class="headline">회의실 생성</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="createRoom">
                <v-text-field
                  v-model="roomName"
                  label="회의실 이름"
                  required
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  label="비밀번호"
                  type="password"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  v-model="confirmPassword"
                  label="비밀번호 확인"
                  type="password"
                  outlined
                  dense
                  :error-messages="passwordError"
                ></v-text-field>
                <v-card-actions>
                  <v-btn color="success" @click="close">닫기</v-btn>
                  <v-btn color="error" @click="createRoom">생성</v-btn>
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'CreateVideoRoom',
    data() {
      return {
        roomName: '',
        password: '',
        confirmPassword: '',
        passwordError: ''
      };
    },
    methods: {
      async createRoom() {
        if (this.password !== this.confirmPassword) {
          this.passwordError = '비밀번호가 일치하지 않습니다.';
          return;
        }
        try {
          const roomData = {
            roomName: this.roomName,
            password: this.password
          };
          const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/video/create`, roomData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          console.log('방 생성 완료:', response.data);
          alert('회의실이 생성되었습니다!');
          this.$router.push('/video/rooms'); 
        } catch (e) {
          console.error('방 생성 중 오류 발생:', e);
          alert('방 생성에 실패했습니다.');
        }
      },
      close() {
        this.$router.push('/video/rooms'); 
      }
    }
  };
  </script>
  
  <style scoped>
  .room-create-card {
    background-color: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 24px; 
  }
  
  .headline {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    color: #4CAF50; 
  }
  
  .v-btn {
    margin-top: 16px;
    font-weight: bold;
    background-color: #4CAF50; 
  }
  
  .v-btn:hover {
    background-color: #45a049;
  }
  </style>
  