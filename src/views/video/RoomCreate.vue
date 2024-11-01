<template>
  <div>
    <v-text-field v-model="roomName" label="방 이름" />
    <v-text-field v-model="roomPassword" label="비밀번호" type="password" />
    <v-btn @click="createRoom">방 생성</v-btn>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      roomName: '',
      roomPassword: ''
    };
  },
  methods: {
    async createRoom() {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/rooms/create`, {
          roomName: this.roomName,
          password: this.roomPassword
        });
        console.log(response.data);
        this.$router.push({ name: 'VideoRoom', params: { roomId: response.data.id, sessionId: response.data.sessionId } });
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>