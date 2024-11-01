<template>
    <v-dialog v-model="dialog" max-width="400px">
        <v-card>
            <v-card-title class="headline">채팅방을 나가시겠습니까?</v-card-title>
            <v-card-actions>
                <v-btn v-list class="hover-btn" text @click="exitChatRoom">나가기</v-btn>
                <v-btn v-delete class="hover-btn" text @click="closeModal">취소</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    props: ['chatRoomIdProp', 'exit'],
    methods: {
        closeModal() {
            this.$emit('update:dialog', false);
        },

        async exitChatRoom() {
            // ⭐ 혼자 있는 채팅방을 만들 수 있다... create할때 나 자신 막으면 뭐해 ㅎ..
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/hardExit/${this.chatRoomIdProp}`);
            console.log(response);
            this.$emit("exit",response.data.result);
            window.location.href = '/chatRoom/list';
        }
    }
}
</script>

<style scoped>
.hover-btn {
    background-color: white;
    color: black;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .hover-btn:hover {
    background-color: black;
    color: white;
  }
</style>