<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12">
            <v-card-title class="headline">화상회의</v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="room in rooms"
                  :key="room.id"
                  cols="12"
                  sm="12"
                  md="6"
                >
                  <v-card class="room-card" @click="enterRoom(room)">
                    <v-card-title>
                      <v-icon class="room-icon">mdi-video</v-icon>
                      {{ room.roomName }}
                    </v-card-title>
                    <v-card-subtitle>
                      {{ room.participantCount }} 명 참여 중
                    </v-card-subtitle>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn v-create color="primary" @click="createRoom">방 생성</v-btn>
            </v-card-actions>
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
        rooms: []
      };
    },
    mounted() {
      this.fetchRooms();
    },
    methods: {
    async fetchRooms() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/video/list`);
        console.log("API Response:", response);
        if (response.data && response.data.result) {
          this.rooms = response.data.result;
          console.log("Fetched rooms:", this.rooms);
        } else {
          console.warn("No rooms found in response:", response.data);
        }
      } catch (e) {
        console.error('방 목록을 가져오는 중 오류 발생:', e);
      }
    },

    createRoom() {
      this.$router.push('/video/create');
    },
  
   
    async enterRoom(room) {
    const password = prompt('방 비밀번호를 입력하세요 (없으면 빈칸)');
    try {
      const requestData = { 
        janusRoomId: room.janusRoomId, 
        roomName: room.roomName, 
        password 
      };
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/video/join`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }

      });
      console.log(response);

      alert('방에 입장하였습니다!');
      this.$router.push(`/video/room/${room.janusRoomId}`); 
    } catch (e) {
      alert(`방 입장에 실패했습니다. 오류: ${e.response?.data?.message || e.message}`);
    }
  }



    }
  };
  </script>
  
  <style scoped>
  .room-list-card {
    background-color: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 32px;
  }
  
  .headline {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    color: #4CAF50;
  }
  
  .room-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
    background-color: #fff;
    padding: 24px;
  }
  
  .room-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  .room-icon {
    font-size: 28px;
    color: #4CAF50;
    margin-right: 12px;
  }
  
  .v-card-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    color: #333;
    font-weight: 500;
  }
  
  .v-card-subtitle {
    font-size: 16px;
    color: #666;
    margin-top: 8px;
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
  