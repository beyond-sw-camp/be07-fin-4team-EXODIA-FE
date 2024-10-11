    <!-- 채팅 아이콘을 누르면 뜨는 화면. 누르면 사라지는 화면.
     채팅방 검색 : 채팅방 이름, 참가유저, 내용(보류) // 채팅방생성
채팅방 리스트, 누르면 채팅방id component에 넘겨주면서 채팅방이 뜬다. -->

<template>
    <div class="chat-list-overlay">
        <!-- 상단 -->
        <v-row>
            <div>
                <v-icon>mdi-close</v-icon>
            </div>

            <!-- 채팅방 검색 -->
            <v-col>
                <v-form @submit.prevent="searchChatRoom">
                    <v-col>
                        <v-text-field v-model="searchQuery" label="search"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-btn type="submit">searchIcon</v-btn>
                    </v-col>
                </v-form>
            </v-col>
            <!-- 채팅방 생성 버튼 -->
            <v-col>
                <v-form @submit.prevent="openCreateChatRoom">
                    <v-col>
                        <v-btn type="submit">createIcon</v-btn>
                    </v-col>
                </v-form>
            </v-col>
        </v-row>

        <!-- 채팅방 생성창 -->
        <!-- <ChatRoomCreate></ChatRoomCreate> -->

        <!-- 채팅방 리스트 -->
        <v-row>
            <v-card>
                <v-card-text v-if="this.chatRoomList.length === 0">채팅방이 없습니다.</v-card-text>
                <v-row v-for="chatroom in chatRoomList" :key="chatroom.id" @click="enterToChatRoom()">
                    <v-col>
                        <div>{{ chatroom.roomName }}</div>
                        <div>{{ chatroom.userNumbers }}</div>
                    </v-col>
                </v-row>
            </v-card>
        </v-row>
    </div>
</template>

<script>
import axios from 'axios';
// import ChatRoomCreate from '@/components/chat/ChatRoomCreate.vue';

export default {
    // components: {
    //     ChatRoomCreate,
    // },
    data() {
        return {

            userNum: "",

            searchQuery: "", // 채팅방 검색

            chatRoomList: [],
        }
    },
    created() {
        // this.userNum = this.$route.params.userNum;
        this.userNum = localStorage.getItem('userNum');
        this.loadChatRoom();
    },
    methods: {
        async loadChatRoom() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/list/${this.userNum}`);
                this.chatRoomList = response.data.result || [];
            } catch (e) {
                console.error('채팅방 목록 조회 실패', e);
            }
        },

        searchChatRoom() {
            this.loadChatRoom();
        },

        enterToChatRoom() {
            console.log("test");
        },

        openCreateChatRoom() {
            console.log("test");
        },
    }
}
</script>

<style scoped>
.chat-list-overlay {
    position: fixed;
    right: 0;
    top: 0;
    width: 300px;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow-y: auto;
}
</style>