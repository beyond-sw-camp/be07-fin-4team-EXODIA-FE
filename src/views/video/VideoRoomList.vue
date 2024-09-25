<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title class="headline">화상회의 방 목록</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="room in rooms"
                  :key="room.id"
                  @click="enterRoom(room.roomName)"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ room.roomName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ room.participantCount }} 명 참여 중</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon>mdi-arrow-right</v-icon>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="createRoom">방 생성</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'VideoRoomList',
    data() {
      return {
        rooms: [],
      };
    },
    mounted() {
      this.fetchRooms();
    },
    methods: {
      async fetchRooms() {
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/video/list`);
          this.rooms = response.data.data;
        } catch (e) {
          console.error('방 목록을 가져오는 중 오류 발생:', e);
        }
      },
      async enterRoom(roomName) {
        const password = prompt('방 비밀번호를 입력하세요 (없으면 빈칸)');
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/video/join`, { roomName, password });
          alert('방에 입장하였습니다!');
          this.$router.push(`/video/room/${roomName}`);
        } catch (e) {
          console.error('방 입장 중 오류 발생:', e);
          alert('방 입장에 실패했습니다.');
        }
      },
      createRoom() {
        this.$router.push('/video/create');
      },
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
  