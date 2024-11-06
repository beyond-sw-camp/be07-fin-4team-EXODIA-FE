<template>
    <v-container v-if="chatRoomListCheck" class="chat-container">
        <!-- Top section with search and buttons -->
        <v-row class="top-bar">

            <!-- Search bar-->
            <v-col cols="9">
                <v-text-field v-model="searchQuery" v-on:keypress.enter="searchChatRoom" @input="searchChatRoom"
                    placeholder="채팅방명, 사원이름으로 검색" class="search-bar" solo hide-details dense
                    variant="underlined"></v-text-field>
            </v-col>
            <v-col cols="1" location="right">
                <v-icon class="icon search-icon" @click="searchChatRoom">mdi-magnify</v-icon>
            </v-col>

            <!-- Create chat room button -->
            <v-col cols="2" location="right">
                <v-icon class="icon create-icon" @click="openCreateChatRoom">mdi-chat-plus</v-icon>
            </v-col>
        </v-row>

        <!-- Chat room list -->
        <v-list class="chat-room-list" v-if="chatRoomList.length !== 0">
            <v-list-item-group class="chat-list" v-for="(chatroom, index) in chatRoomList" :key="chatroom.roomId">
                <v-list-item class="chat-list-item" @click="enterToChatRoom(index)">
                    <!-- Room info -->
                    <v-list-item-content class="chat-room-list-content">
                        <div class="chat-room-info">
                            <v-list-item-title class="chat-room-list-title" v-if="chatroom.users.length > 2">{{
                                chatroom.roomName }}</v-list-item-title>
                            <v-list-item-title class="chat-room-list-title" v-else-if="chatroom.users.length < 2">{{
                                chatroom.users[0].chatUserName }}</v-list-item-title>
                            <v-list-item-title class="chat-room-list-title" v-else-if="chatroom.users.length = 2">{{
                                getChatuserName(chatroom.users) }}</v-list-item-title>
                            <v-icon class="user-mini-icon">mdi-account</v-icon>
                            <span class="chat-user-num">{{ chatroom.users.length }}</span>
                        </div>
                        <v-list-item-subtitle class="chat-room-list-chat">{{ chatroom.recentChat
                            }}</v-list-item-subtitle>
                    </v-list-item-content>

                    <!-- Unread message count -->
                    <v-badge :content="chatroom.unreadChatNum" color="red" v-if="chatroom.unreadChatNum > 0"
                        class="unread-badge"></v-badge>
                    <span class="message-time">{{ getRecentChatTime(chatroom.recentChatTime) }}</span>
                    <v-divider></v-divider>
                </v-list-item>

            </v-list-item-group>
        </v-list>
        <v-card-text v-else>채팅방이 없습니다.</v-card-text>
    </v-container>


    <ChatRoomView v-if="chatRoomCheck" @update:dialog="chatRoomCheck = $event"
        @update:check="chatRoomListCheck = $event" :chatRoomIdProp="chatRoomId" :chatRoomNameProp="chatRoomName"
        @update="loadChatRoom" :chatRoomUsersProp="chatRoomUsers">
    </ChatRoomView>

    <ChatRoomCreate v-if="createChatRoom" @update:dialog="createChatRoom = $event"
        @update:check="chatRoomListCheck = $event" @update="loadChatRoom">
    </ChatRoomCreate>

</template>

<script>
import axios from 'axios';
import ChatRoomCreate from '@/components/chat/ChatRoomCreate.vue';
import ChatRoomView from '@/components/chat/ChatRoomView.vue';
import { formatDistanceToNow, addHours } from 'date-fns';
import { ko } from 'date-fns/locale';
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

            chatRoomListCheck: true, // 채팅방 리스트 제어
            chatRoomCheck: false, // 채팅방 제어

            // 채팅리스트에서 채팅방으로 넘겨주는 값.
            chatRoomId: null,
            chatRoomName: "",
            chatRoomUsers: []
        }
    },
    created() {
        this.userNum = localStorage.getItem('userNum');
        this.loadChatRoom();
        this.initSSE();
    },
    methods: {
        initSSE() {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("JWT 토큰이 없습니다.");
                return;
            }

            this.eventSource = new EventSource(`${process.env.VUE_APP_API_BASE_URL}/notifications/subscribe?token=${token}`);

            // 새로운 알림 수신 시 처리
            this.eventSource.onmessage = (event) => {
                const newNotification = JSON.parse(event.data);
                if (newNotification.type == '채팅알림') {
                    if (window.opener && window.opener.parentVueInstance) {
                        window.opener.parentVueInstance.unreadChatNum = newNotification.alarmNum;
                    }
                    console.log(newNotification);
                    return;
                } else if (newNotification.type == '채팅입장') {
                    if (window.opener && window.opener.parentVueInstance) {
                        window.opener.parentVueInstance.unreadChatNum = newNotification.alarmNum;
                    }
                    console.log(newNotification);
                    return;
                } else if (newNotification.type == '채팅목록') {
                    this.loadChatRoom();
                    console.log(newNotification);
                    return;
                }
            };

            // SSE 연결 오류 처리
            this.eventSource.onerror = (error) => {
                this.eventSource.close();
                console.error('SSE 연결 오류:', error);
                if (this.retryCount < this.maxRetryCount) {
                    setTimeout(() => {
                        this.retryCount++;
                        this.initSSE(); // SSE 재연결 시도
                    }, 3000); // 3초 후에 재연결 시도
                }
            };
        },

        async loadChatRoom() {
            try {
                const params = {
                    userNum: this.userNum,
                    searchValue: this.searchQuery
                };
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/search`, { params });
                this.chatRoomList = response.data.result || [];
                console.log("목록조회")
                console.log(response);
                console.log(this.chatRoomList);

                // const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/list/${this.userNum}`);
                // this.chatRoomList = response.data.result || [];
                // console.log("목록조회")
                // console.log(response);
            } catch (e) {
                console.error('채팅방 목록 조회 실패', e);
            }

        },

        searchChatRoom() {
            this.loadChatRoom();
        },

        // async searchChatRoom() {
        //     const params = {
        //         userNum: this.userNum,
        //         searchValue: this.searchQuery
        //     };
        //     const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/search`, { params });
        //     this.chatRoomList = response.data.result || [];
        //     console.log("목록조회")
        //     console.log(response);
        // },


        // 시간 추출
        getTime(createdAt) {
            const createdTime = new Date(createdAt);
            let hour = createdTime.getHours();
            let minute = createdTime.getMinutes();
            let ampm = hour < 12 ? '오전' : '오후';

            hour = hour % 12 || 12; // 12시간 형식으로 변환
            minute = minute < 10 ? '0' + minute : minute;

            return `${ampm} ${hour}:${minute}`;
        },

        // 날짜 감별
        isDifferentDay(d) {
            const day = new Date(d);
            const today = new Date();

            return day.getFullYear() !== today.getFullYear() ||
                day.getMonth() !== today.getMonth() ||
                day.getDate() !== today.getDate();
        },
        formatDate(notificationTime) {
            const dateInKST = addHours(new Date(notificationTime), 9);
            return formatDistanceToNow(dateInKST, { addSuffix: true, locale: ko });
        },
        // 날짜 감별 후 표시
        getRecentChatTime(createdAt) {
            if (createdAt == "") {
                return;
            }
            if (this.isDifferentDay(createdAt)) {
                const createdTime = new Date(createdAt);
                return `${createdTime.getFullYear()}년 ${createdTime.getMonth() + 1}월 ${createdTime.getDate()}일`;
            }
            return this.formatDate(createdAt);
        },

        enterToChatRoom(id) { // 채팅방 입장
            this.chatRoomCheck = true;
            this.chatRoomListCheck = false;
            this.chatRoomId = this.chatRoomList[id].roomId;
            this.chatRoomName = this.chatRoomList[id].roomName;
            this.chatRoomUsers = this.chatRoomList[id].users;
        },

        openCreateChatRoom() { // 채팅방 생성창 열기
            this.createChatRoom = true;
            this.chatRoomListCheck = false;
        },

        getChatuserName(users) {
            const chatUser = users.filter(u => u.chatUserNum != this.userNum)
            return chatUser[0].chatUserName;
        }

    }
}
</script>

<style scoped>
.chat-container {
    padding: 16px;
    /* background-color: #f0f0f0; */
    /* background-color: #e9f4e4; */
    /* height: auto; */
    width: auto;
}

.top-bar {
    display: flex;
    align-items: center;
    padding-bottom: 8px;
    width: auto;
}

.search-bar {
    margin-left: 20px;
    background-color: white;
    border-radius: 4px;
}

.icon {
    cursor: pointer;
}

.create-icon {
    margin-left: 10px;
}

.chat-room-list {
    margin-top: 0px;
}

.chat-list-item {
    height: 60px;
    margin-bottom: 10px;
}

.chat-room-list-content {
    position: relative;
    cursor: pointer;
    height: 70px;
}

.chat-room-info {
    display: flex;
    align-items: center;
}

.chat-room-list-title {
    height: 20px;
    margin-bottom: 10px;
}

.user-mini-icon {
    display: flex;
    cursor: pointer;
    margin-left: 15px;
    margin-bottom: 5px;
    color: gray;
    font-size: 14px;
}

.chat-user-num {
    color: gray;
    font-size: 12px;
    margin-bottom: 5px;
}

.chat-room-list-chat {
    height: 20px;
    margin-bottom: 5px;
    max-width: 280px;
    /* 제목의 최대 너비를 설정 */
    overflow: hidden;
    /* 내용이 넘칠 경우 숨김 처리 */
    text-overflow: ellipsis;
    /* 넘치는 텍스트에 '...' 추가 !important*/
    white-space: nowrap;
    /* 텍스트 줄 바꿈 방지 */
    color: gray;
    font-size: 13px;
}

.unread-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1;
    margin-right: 16px;
}

.message-time {
    color: gray;
    font-size: 11px;
    position: absolute;
    right: 25px;
    bottom: 10px;
}
</style>