<template>
    <v-container>
      <h2>현재 활성화된 방 목록</h2>
      <v-list>
        <v-list-item
          v-for="(participantCount, sessionId) in sessions"
          :key="sessionId"
          @click="joinRoom(sessionId)"
          class="room-list-item"
        >
          <v-list-item-content>
            <v-list-item-title>{{ sessionId }}</v-list-item-title>
            <v-list-item-subtitle>참가자 수: {{ participantCount }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        sessions: {},
      };
    },
    async created() {
      await this.fetchSessions();
    },
    methods: {
        async fetchSessions() {
            try {
            const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/openvidu/sessions`);
            if (response.ok) {
                this.sessions = await response.json();
                console.log("Fetched sessions:", this.sessions);
            } else {
                console.error("방 목록 조회 실패:", response.statusText);
            }
            } catch (error) {
            console.error("방 목록 조회 중 오류:", error);
            }
        },
        joinRoom(sessionId) {
            console.log("Joining room with sessionId:", sessionId); 
            this.$router.push({ name: "VideoRoom", params: { sessionId } });
        }
    }

  };
  </script>
  
  <style scoped>
  h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #3f51b5;
    font-weight: bold;
  }
  
  .room-list-item {
    background-color: #f5f5f5;
    margin: 8px 0;
    border-radius: 8px;
    padding: 10px;
    transition: background-color 0.3s ease;
  }
  
  .room-list-item:hover {
    background-color: #e0e7ff; 
    cursor: pointer;
  }
  
  .v-list-item-title {
    font-size: 18px;
    font-weight: 500;
    color: #1a237e;
  }
  
  .v-list-item-subtitle {
    font-size: 14px;
    color: #5c6bc0;
  }
  </style>
  