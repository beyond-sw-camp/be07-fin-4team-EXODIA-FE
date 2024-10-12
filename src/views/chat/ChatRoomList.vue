    <!-- 채팅 아이콘을 누르면 뜨는 화면. 누르면 사라지는 화면.
     채팅방 검색 : 채팅방 이름, 참가유저, 내용(보류) // 채팅방생성
채팅방 리스트, 누르면 채팅방id component에 넘겨주면서 채팅방이 뜬다. -->

<template>
    <div class="chat-container">
        <!-- Top section with search and buttons -->
        <v-row class="top-bar">
            <!-- Close icon -->
            <v-col cols="1">
                <v-icon class="icon close-icon" @click="closeChatList">mdi-close</v-icon>
            </v-col>

            <!-- Search bar -->
            <v-col cols="9">
                <v-text-field v-model="searchQuery" placeholder="채팅방명, 사번, 이름으로 검색" class="search-bar" solo hide-details
                    dense></v-text-field>
            </v-col>

            <!-- Create chat room button -->
            <v-col cols="1">
                <v-icon class="icon create-icon" @click="openCreateChatRoom">mdi-chat-plus</v-icon>
            </v-col>
        </v-row>

        <!-- Chat room list -->
        <v-list class="chat-room-list" v-if="chatRoomList.length !== 0">
            <v-list-item-group v-for="chatroom in chatRoomList" :key="chatroom.id">
                <v-list-item @click="enterToChatRoom()">
                    <!-- Profile image -->
                    <!-- <v-list-item-avatar>
            <img :src="chatroom.profileImage" alt="Profile" />
          </v-list-item-avatar> -->

                    <!-- Room info -->
                    <v-list-item-content>
                        <v-list-item-title>{{ chatroom.roomName }}</v-list-item-title>
                        <!-- <v-list-item-subtitle>{{ chatroom.lastMessage }}</v-list-item-subtitle> -->
                    </v-list-item-content>

                    <!-- Unread message count -->
                    <!-- <v-badge :value="chatroom.unreadCount" color="red" v-if="chatroom.unreadCount > 0" class="unread-badge"></v-badge> -->
                </v-list-item>
            </v-list-item-group>
            <!-- <v-card-text v-else>채팅방이 없습니다.</v-card-text> -->
        </v-list>
    </div>


    <ChatRoomCreate v-model="createChatRoom" @update:dialog="createChatRoom = $event">
    </ChatRoomCreate>

</template>

<script>
import axios from 'axios';
import ChatRoomCreate from '@/components/chat/ChatRoomCreate.vue';

export default {
    components: {
        ChatRoomCreate,
    },
    data() {
        return {

            userNum: "",

            searchQuery: "", // 채팅방 검색

            chatRoomList: [],

            createChatRoom: false,
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
            this.createChatRoom = true;
        },
    }
}
</script>

<style scoped>
.chat-container {
    padding: 16px;
    /* background-color: #f0f0f0; */
    background-color: #e9f4e4;
}

.top-bar {
    display: flex;
    align-items: center;
    padding-bottom: 8px;
}

.search-bar {
    background-color: white;
    border-radius: 4px;
}

.icon {
    cursor: pointer;
}

.chat-room-list {
    margin-top: 8px;
}

.unread-badge {
    margin-right: 16px;
}
</style>