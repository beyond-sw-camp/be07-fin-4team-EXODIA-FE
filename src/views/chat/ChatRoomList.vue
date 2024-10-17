    <!-- 채팅 아이콘을 누르면 뜨는 화면. 누르면 사라지는 화면.
     채팅방 검색 : 채팅방 이름, 참가유저, 내용(보류) // 채팅방생성
채팅방 리스트, 누르면 채팅방id component에 넘겨주면서 채팅방이 뜬다. -->

<template>
    <v-container v-if="chatRoomListCheck" class="chat-container">
        <!-- Top section with search and buttons -->
        <v-row class="top-bar">
            <!-- Close icon -->
            <!-- <v-col cols="1">
                <v-icon class="icon close-icon" @click="closeChatList">mdi-close</v-icon>
            </v-col> -->


            <!-- Search bar -->
            <v-col cols="9" v-if="searchBar">
                <v-text-field v-model="searchQuery" placeholder="채팅방명, 사번, 이름으로 검색" class="search-bar" solo hide-details
                    dense></v-text-field>
            </v-col>
            <v-col cols="1" v-if="searchIcon" location="right">
                <v-icon @click="showSearchChatRoom">mdi-magnify</v-icon>
            </v-col>

            <!-- Create chat room button -->
            <v-col cols="1" location="right">
                <v-icon class="icon create-icon" @click="openCreateChatRoom">mdi-chat-plus</v-icon>
            </v-col>
        </v-row>

        <!-- Chat room list -->
        <v-list class="chat-room-list" v-if="chatRoomList.length !== 0">
            <v-list-item-group v-for="(chatroom, index) in chatRoomList" :key="chatroom.roomId">
                <v-list-item >
                    <!-- Profile image -->
                    <!-- <v-list-item-avatar>
            <img :src="chatroom.profileImage" alt="Profile" />
          </v-list-item-avatar> -->

                    <!-- Room info -->
                    <v-list-item-content @click="enterToChatRoom(index)">
                        <v-list-item-title>{{ chatroom.roomName }}</v-list-item-title>
                        <v-list-item-subtitle>{{ chatroom.recentChat }}</v-list-item-subtitle>
                        <span>{{ chatroom.unreadChatNum }}</span>
                        <!-- <v-list-item-subtitle>{{ chatroom.lastMessage }}</v-list-item-subtitle> -->
                    </v-list-item-content>

                    <!-- Unread message count -->
                    <!-- <v-badge :value="chatroom.unreadCount" color="red" v-if="chatroom.unreadCount > 0" class="unread-badge"></v-badge> -->
                </v-list-item>
            </v-list-item-group>
            <!-- <v-card-text v-else>채팅방이 없습니다.</v-card-text> -->
        </v-list>
    </v-container>


    <ChatRoomView
     v-if = "chatRoomCheck"
     @update:dialog="chatRoomCheck=$event"
     @update:check="chatRoomListCheck=$event"
     :chatRoomIdProp="chatRoomId"
     :chatRoomNameProp="chatRoomName"
     :chatRoomUserNumsProp="chatRoomUserNums">
    </ChatRoomView>

    <ChatRoomCreate v-if="createChatRoom"
    @update:dialog="createChatRoom = $event"
    @update:check="chatRoomListCheck=$event">
    </ChatRoomCreate>

</template>

<script>
import axios from 'axios';
import ChatRoomCreate from '@/components/chat/ChatRoomCreate.vue';
import ChatRoomView from '@/components/chat/ChatRoomView.vue';

export default {
    components: {
        ChatRoomCreate,
        ChatRoomView,
    },
    data() {
        return {

            userNum: "",
            chatRoomList: [], // 채팅방 리스트

            createChatRoom: false, // 채팅방 생성 제어

            searchQuery: "", // 채팅방 검색어
            searchBar: false, // 검색바 제어
            searchIcon: true, // 검색아이콘 제어

            chatRoomListCheck: true, // 채팅방 리스트 제어
            chatRoomCheck: false, // 채팅방 제어

            // 채팅리스트에서 채팅방으로 넘겨주는 값.
            chatRoomId: null,
            chatRoomName: "",
            chatRoomUserNums: []
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
                console.log(this.chatRoomList);
            } catch (e) {
                console.error('채팅방 목록 조회 실패', e);
            }
        },

        showSearchChatRoom() { // 검색바 숨김
            this.searchBar = true;
            this.searchIcon = false;
        },

        searchChatRoom() { // 검색시 재정렬
            this.loadChatRoom();
        },

        enterToChatRoom(id) { // 채팅방 입장
            this.chatRoomCheck = true;
            this.chatRoomListCheck = false;
            this.chatRoomId = this.chatRoomList[id].roomId;
            this.chatRoomName = this.chatRoomList[id].roomName;
            this.chatRoomUserNums = this.chatRoomList[id].userNums;
        },

        openCreateChatRoom() { // 채팅방 생성창 열기
            this.createChatRoom = true;
            this.chatRoomListCheck= false;
        },

        // closeChatList() { // 채팅방 리스트 닫기
        //     this.$emit('update:dialog', false);
        // }
    }
}
</script>

<style scoped>
.chat-container {
    padding: 16px;
    /* background-color: #f0f0f0; */
    background-color: #e9f4e4;
    height: 800px;
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