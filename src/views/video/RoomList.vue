<template>
  <div>
    <v-list>
      <v-list-item v-for="room in rooms" :key="room.id" @click="joinRoom(room)">
        {{ room.roomName }} (참여자: {{ room.participantCount }})
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      rooms: []
    };
  },
  async created() {
    try {
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/rooms/list`);
      this.rooms = response.data;
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    joinRoom(room) {
      this.$router.push({ name: 'VideoRoom', params: { roomId: room.id, sessionId: room.sessionId } });
    }
  }
};
</script>