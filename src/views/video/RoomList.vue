<template>
    <div>
      <h1>화상 회의 방 목록</h1>
      <ul>
        <li v-for="room in rooms" :key="room.id">
          {{ room.roomName }} - 참여자: {{ room.participantCount }}
          <v-btn @click="enterRoom(room.id)">입장</v-btn>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        rooms: [],
      };
    },
    async created() {
      try {
        const response = await axios.get('/api/rooms/list');
        this.rooms = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    methods: {
        enterRoom(roomId) {
    this.$router.push({ name: 'VideoRoom', params: { sessionId: roomId } });
  },
    },
  };
  </script>
  