<template>
    <div>
      <h2>Create a Room</h2>
      <input v-model="roomName" placeholder="Enter room name" />
      <button @click="createRoom">Create and Join Room</button>
    </div>
</template>

<script>
export default {
  data() {
    return {
      roomName: ''
    };
  },
  methods: {
    // Vue 컴포넌트에서 전송할 때 한글을 제거 후 전송
    async createRoom() {
      let sanitizedRoomName = this.roomName.replace(/[^a-zA-Z0-9_-]/g, '');
      if (sanitizedRoomName === '') {
        alert('방 이름은 영어, 숫자, 밑줄(_) 또는 하이픈(-)만 포함해야 합니다.');
        return;
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/openvidu/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customSessionId: sanitizedRoomName })
        });

        if (response.ok) {
          const sessionId = await response.text();
          console.log("Created Session ID:", sessionId);
          this.$router.push({ name: 'VideoRoom', params: { sessionId, roomName: sanitizedRoomName } });
        } else {
          console.error("Failed to create session:", response.statusText);
        }
      } catch (error) {
        console.error("Error creating session:", error);
      }
    }
  }
};
</script>
