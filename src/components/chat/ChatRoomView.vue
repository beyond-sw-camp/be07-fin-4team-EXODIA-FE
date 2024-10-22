<!-- 채팅방 하나의 화면 -->
<!--채팅방 나가기, 채팅방 내 메세지 검색 , 채팅구성원 확인, 채팅유저 초대, 채팅 파일 모아보기 -->
<!--채팅 날짜 구분해서 채팅메세지 불러오기 / 나와 구성원 구분하여 띄워주기 / 구성원 프로필사진 : 메세지-->
<!-- 채팅입력창, 파일 보내기, 이미지 보내기-->


<template>
    <v-container> <!--전체 채팅방 감싸요-->

        <!-- 채팅방 상단 -->
        <v-row class="chat-room-header">
            <v-col cols="1">
                <v-icon class="icon" @click="goBack">mdi-chevron-left</v-icon> <!-- 뒤로가기 -->
            </v-col>
            <v-col cols="10" class="chat-room-title">
                <span class="chat-room-name">{{ chatRoomNameProp }}</span>
                <v-icon id="user-activator" class="user-mini-icon">mdi-account</v-icon>
                <span class="chat-user-num">{{ chatUserList.length }}</span>
                <v-menu activator="#user-activator">
                    <v-list>
                        <v-list-item v-for="(user, index) in chatUserList" :key="index">
                            <v-list-item-title>{{ user.chatUserDepName }} {{ user.chatUserName }} {{
                                user.chatUserPosName }}님</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
            <v-col cols="1" class="header-icons">
                <!--<v-icon class="icon">mdi-magnify</v-icon>--> <!-- 검색 -->
                <v-icon id="menu-activator" class="icon">mdi-dots-vertical</v-icon> <!-- 메뉴 -->
                <v-menu activator="#menu-activator">
                    <v-list>
                        <v-list-item v-on:click="showchatUserInviteModal">
                            <v-list-item-title>
                                <v-icon>mdi-plus</v-icon>
                                채팅 상대 초대
                            </v-list-item-title>
                        </v-list-item>
                        <!-- <v-list-item>
                            <v-list-item-title> 
                                <v-icon>mdi-file</v-icon>
                                채팅 파일 모아보기
                            </v-list-item-title>
                        </v-list-item> -->
                        <v-divider></v-divider>
                        <v-list-item v-on:click="showexitChatRoomModal">
                            <v-list-item-title>
                                <v-icon>mdi-exit-to-app</v-icon>
                                채팅방 나가기
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>

        <InviteChatUserModal v-model="inviteUserModal" @update:dialog="inviteUserModal = $event"
            @invite="inviteUserMessage" :chatRoomIdProp="chatRoomId" :existChatUsersProp="chatRoomUserNumsProp">
        </InviteChatUserModal>

        <ExitChatRoomModal v-model="exitAlertModal" @update:dialog="exitAlertModal = $event" @exit="exitUserMesssage"
            :chatRoomIdProp="chatRoomId">
        </ExitChatRoomModal>

        <!-- 채팅 내용 -->
        <div class="chat-content" id="messageContainer">
            <div v-for="(chat, index) in chatMessageList" :key="chat.id">
                <!-- 날짜 구분 -->
                <div v-if="index === 0 || isDifferentDay(chat.createAt, chatMessageList[index - 1].createAt)">
                    <div class="date-divider">
                        <span class="date-text">{{ getDay(chat.createAt) }}</span>
                    </div>
                </div>

                <div v-if="chat.messageType == 'ENTER'">
                    <div class="date-divider">
                        <span class="date-text">{{ chat.senderName }}님이 입장했습니다.</span>
                    </div>
                </div>

                <div v-if="chat.messageType == 'QUIT'">
                    <div class="date-divider">
                        <span class="date-text">{{ chat.senderName }}님이 퇴장했습니다.</span>
                    </div>
                </div>

                <!-- 메시지 -->
                <div v-if="chat.messageType == 'TALK' || chat.messageType == 'FILE'"
                    :class="chat.senderNum === chatSenderNum ? 'my-message' : 'other-message'">
                    <v-row v-if="chat.senderNum !== chatSenderNum" class="message-row">
                        <span class="sender-name">{{ chat.senderDepName }} {{ chat.senderName }} {{ chat.senderPosName
                            }}님</span>
                        <v-col class="message" v-if="chat.messageType == 'TALK'">
                            <div class="message-text">{{ chat.message }}</div>
                        </v-col>
                        <v-col class="message" v-if="chat.messageType == 'FILE'">
                            <ChatFileBox :chatFilesProp="chat.files" :isMyMessage="chat.senderNum === chatSenderNum">
                            </ChatFileBox>
                            <div v-if="chat.message.length != 0" class="message-text">{{ chat.message }}</div>
                        </v-col>
                    </v-row>

                    <v-row v-if="chat.senderNum === chatSenderNum" class="message-row my-row">
                        <v-col class="message" v-if="chat.messageType == 'TALK'">
                            <div class="message-text">{{ chat.message }}</div>
                        </v-col>
                        <v-col class="message" v-if="chat.messageType == 'FILE'">
                            <ChatFileBox :chatFilesProp="chat.files" :isMyMessage="chat.senderNum === chatSenderNum">
                            </ChatFileBox>
                            <div v-if="chat.message.length != 0" class="message-text">{{ chat.message }}</div>
                        </v-col>
                    </v-row>

                    <!-- 보낸 시간 -->
                    <span class="message-time">{{ getTime(chat.createAt) }}</span>
                </div>
            </div>
        </div>

        <div class="image-group">
            <div v-for="(file, index) in fileList" :key="index" class="image-container">
                <v-icon color="red" class="close-icon" @click="deleteImage(index)">mdi-close-circle</v-icon>
                <img :src="file.fileUrl" @error="e => e.target.src = require('@/assets/file.png')"
                    style="height: 120px; width: 120px; object-fit: cover;">
                <p class="custom-contents">{{ file.name }}</p>
            </div>
        </div>
        <!-- 채팅 입력-->
        <v-container class="input-container">
            <v-row> <!--v-on:keypress.enter="sendMessage" auto-grow @keydown.shift.enter="insertNewLine"-->
                <v-textarea class="input-field" v-model="messageToSend" outlined 
                v-on:keypress.enter="sendMessage"></v-textarea>
            </v-row>
            <v-row ><!-- class="file-input-container"-->
                <v-file-input v-model="files" @change="fileUpdate" multiple hide-input prepend-icon="mdi-paperclip"
                    class="file-input-icon-left"></v-file-input>
                <v-btn class="send-btn" @click="sendMessage">전송</v-btn>
            </v-row>
        </v-container>

    </v-container>
</template>

<script>
import axios from 'axios';
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'
import ChatFileBox from '@/components/chat/ChatFileBox.vue'
import InviteChatUserModal from './InviteChatUserModal.vue';
import ExitChatRoomModal from './ExitChatRoomModal.vue';

export default {
    props: [
        'chatRoomIdProp',
        'chatRoomNameProp',
        'chatRoomUserNumsProp',
    ], // 채팅방리스트에서 받아오는 값.
    components: {
        ChatFileBox, InviteChatUserModal, ExitChatRoomModal
    },
    data() {
        return {
            stompClient: null,
            chatRoomId: this.chatRoomIdProp, // 채팅방 id
            chatMessageList: [], // 주고받은 채팅내역

            // chatUserListCheck: false, // 채팅유저리스트 제어
            chatUserList: [], // 채팅유저리스트

            inviteUserModal: false, // 채팅유저초대 모달 제어
            exitAlertModal: false, // 채팅방나가기 모달 제어

            chatSenderNum: '', // 채팅방을 여는 사람 == 채팅보내는 사람

            files: null, // v-file-input로 업로드한 파일들
            fileList: [], // files를 가공한 리스트.
            fileRes: null, // 메세지와 함께 보내기 위한 파일메타데이터(name, s3url)

            messageToSend: '', // 메세지입력란
        }
    },
    async created() {
        this.chatRoomId = this.chatRoomIdProp;
        this.chatSenderNum = localStorage.getItem('userNum');
        // 메세지 불러오기
        const chatResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/${this.chatRoomId}`);
        if (chatResponse.data) {
            this.chatMessageList = chatResponse.data.result;
        }
        // chatUsers 불러오기
        const usersResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/chatUsers/${this.chatRoomId}`);
        if (usersResponse.data) {
            this.chatUserList = usersResponse.data.result;
        }
        this.scrollToBottom();
    },
    mounted() {
        this.connect();
        window.addEventListener('beforeunload', this.leave)
    },
    beforeUnmount() {
        window.removeEventListener('beforeunload', this.leave)
    },
    methods: {
        async leave() {
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.disconnect(() => {
                    console.log('WebSocket disconnected');
                });
            }
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/exit`);
            console.log(response);
        },
        scrollToBottom() {
            // 메시지 목록을 감싸는 컨테이너 찾기
            const container = document.getElementById('messageContainer');
            if (container) {
                // 잠시 딜레이를 주고 스크롤을 최하단으로 이동
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 100);
            }
        },
        connect() {
            if (this.stompClient && this.stompClient.connected) { return; } // 연결확인
            const socket = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/ws`);
            this.stompClient = Stomp.over(socket);
            const authtoken = localStorage.getItem('token');
            this.stompClient.connect(
                { Authorization: `Bearer ${authtoken}` },
                (frame) => {
                    console.log("frame : " + frame);
                    console.log("Connected to WebSocket");
                    this.stompClient.subscribe(`/topic/chat/room/${this.chatRoomId}`, (message) => {
                        this.scrollToBottom();
                        const receivedMessage = JSON.parse(message.body);
                        this.chatMessageList.push(receivedMessage);
                    });
                },
                (error) => {
                    console.error("Connection error: ", error);
                    setTimeout(() => this.connect(), 5000);  // 재연결 시도
                }
            )
            this.scrollToBottom();
        },

        insertNewLine() {
            this.messageToSend += '\n'; // 현재 입력된 텍스트에 줄바꿈을 추가
        },

        async sendMessage() {

            // 메시지가 비어있거나 공백 문자만 포함 + fileList가 없는 경우
            if (this.messageToSend.trim() === '' && this.fileList.length === 0) {
                return; // 함수 종료
            }

            if (this.stompClient && this.stompClient.connected) {
                if (this.fileList.length > 0) { // 파일이 있으면.
                    try {
                        const presignedUrls = await this.getPresignedURL();

                        // 각 파일에 대해 Presigned URL을 이용하여 S3에 업로드 -> s3 url만 남는다.
                        const uploadedFileUrls = await Promise.all(this.fileList.map(file => this.uploadFileToS3(file.file, presignedUrls[file.name])));

                        // 파일 중 업로드가 실패한 파일이 있으면 필터링
                        const successfulUploads = uploadedFileUrls.filter(url => url !== null);

                        // 메세지 보내면서 파일 메타데이터 저장을 한다.
                        // 메타데이터 저장을 위한 데이터 가공.
                        if (successfulUploads.length > 0) {
                            this.fileRes = successfulUploads.map((url, index) => ({
                                chatFileName: this.fileList[index].name,
                                chatFileUrl: url,
                            }));
                        }

                    } catch (error) {
                        console.error('Upload failed:', error);
                    }
                }

                const messageReq = {
                    senderNum: this.chatSenderNum,
                    roomId: this.chatRoomId,
                    messageType: this.fileList.length > 0 ? "FILE" : "TALK",
                    message: this.messageToSend,
                    files: this.fileRes,
                };

                this.stompClient.send(`/app/chat/message`, JSON.stringify(messageReq));

                this.messageToSend = ''; // 입력 필드 초기화
                this.fileList = []; // 빈 배열로 초기화
                this.fileRes = null;
                this.scrollToBottom();
            } else {
                console.error('WebSocket unconnected');
                setTimeout(() => this.connect(), 5000);
            }
        },

        // presignedUrl 생성
        async getPresignedURL() {
            const reqFiles = this.fileList.map(file => ({ chatFileName: file.name, fileSize: file.size }));
            const response = await axios.post(
                `${process.env.VUE_APP_API_BASE_URL}/file/presigned-urls`, reqFiles
            );
            return response.data.result; // [{filename:presignedUrl} ... ]
        },

        // presignedUrl으로 s3에 업로드
        async uploadFileToS3(file, presignedUrl) {
            try {
                const config = {
                    headers: {
                        'Content-Type': file.type,
                    },
                };

                await axios.put(presignedUrl, file, config);
                // S3에 업로드된 파일의 URL에서 ? 앞부분만 반환 (쿼리 파라미터 제거)
                return this.extractS3Url(presignedUrl);
            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                return null; // 업로드 실패 시 null 반환
            }
        },

        // Presigned URL에서 ? 이전의 S3 URL만 남김
        extractS3Url(presignedUrl) {
            return presignedUrl.split('?')[0]; // ? 기준으로 앞부분만 추출
        },

        // files -> fileList 로 가공
        fileUpdate() {
            // this.fileList = []; // 초기화 후 파일 추가
            this.files.forEach(file => {
                this.fileList.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file,
                    fileUrl: URL.createObjectURL(file)
                })
            });
            this.files = null;
        },

        deleteImage(index) {
            this.fileList.splice(index, 1);
        },

        // 보내는 시간
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
        isDifferentDay(d1, d2) {
            const day1 = new Date(d1);
            const day2 = new Date(d2);

            return day1.getFullYear() !== day2.getFullYear() ||
                day1.getMonth() !== day2.getMonth() ||
                day1.getDate() !== day2.getDate();
        },

        // 날짜 감별 후 표시
        getDay(createdAt) {
            const createdTime = new Date(createdAt);
            return `${createdTime.getFullYear()}년 ${createdTime.getMonth() + 1}월 ${createdTime.getDate()}일`;
        },

        async goBack() {
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.disconnect(() => {
                    console.log('WebSocket disconnected');
                });
            }
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/exit`);
            console.log(response);
            window.location.href = '/chatRoom/list';
            this.$emit('update:dialog', false);
            this.$emit('update:check', true);
            // window.location.reload('/chatRoom/list');
        },

        showchatUserInviteModal() {
            this.inviteUserModal = true;
        },

        async inviteUserMessage(inviteUserData) {
            const messageReq = {
                senderNum: inviteUserData,
                roomId: this.chatRoomId,
                messageType: "ENTER",
                message: "",
                files: null,
            };
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.send(`/app/chat/message`, JSON.stringify(messageReq));
            }
            const usersResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/chatUsers/${this.chatRoomId}`);
            if (usersResponse.data) {
                this.chatUserList = usersResponse.data.result;
            }
        },

        showexitChatRoomModal() {
            this.exitAlertModal = true;
        },

        exitUserMesssage(exitUserData) {
            // ⭐ 나갔을 때 채팅방 변화
            const messageReq = {
                senderNum: exitUserData,
                roomId: this.chatRoomId,
                messageType: "QUIT",
                message: "",
                files: null,
            };
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.send(`/app/chat/message`, JSON.stringify(messageReq));
            }
        },

    }
}

</script>

<style scoped>
/* .chat-room-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: space-between;
} */

.chat-room-header {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #e9f4e4;
    border-bottom: 1px solid #ccc;
}

.icon {
    cursor: pointer;
    margin-right: 10px;
}

/* .chat-room-avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
} */

.chat-room-title {
    display: flex;
    align-items: center;
}

.chat-room-name {
    font-size: 20px;
    margin-left: 10px;
}

.user-mini-icon {
    cursor: pointer;
    margin-left: 15px;
    color: gray;
    font-size: 14px;
}

.chat-user-num {
    color: gray;
    font-size: 11px;
}

.header-icons {
    display: flex;
    justify-content: flex-end;
}

.chat-content {
    flex: 1;
    padding: 10px;
    max-height: calc(100vh - 150px);
    /* 화면의 상단 영역을 침범하지 않도록 높이 제한 */
    padding-top: 10px;
    /* 적절한 padding 추가 */
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    /* flex-shrink: 0; */
}

.date-divider {
    text-align: center;
    margin: 20px 0;
}

.date-text {
    background-color: #e9e9e9;
    padding: 5px 10px;
    border-radius: 10px;
}

.my-message {
    text-align: right;
}

.other-message {
    text-align: left;
}

.message-row {
    display: flex;
    align-items: center;
    margin-bottom: 0px;
}

/* .profile-avatar img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
} */

.sender-name {
    font-weight: bold;
}

.message {
    padding-top: 15px;
    padding-bottom: 0px;
    padding-left: 12px;
    padding-right: 12px;
}

.message-text {
    background-color: #e0f7fa;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 10px;
    max-width: 60%;
    display: inline-block;
    white-space: pre-wrap;
}

.my-row {
    justify-content: flex-end;
}

.message-time {
    font-size: 0.8em;
    color: gray;
    margin-left: 5px;
}

.image-group {
    display: flex;
    flex-direction: row;
    width: 120px;
    max-height: 180px;
}

.image-container {
    position: relative;
    /* 아이콘과 이미지를 겹치게 하기 위해 부모에 relative 추가 */
    display: inline-block;
    /* 여러 이미지를 가로로 정렬 */
}

.image-container img {
    display: block;
}

.close-icon {
    position: absolute;
    top: 5px;
    /* 이미지 위쪽에서 5px */
    left: 5px;
    /* 이미지 왼쪽에서 5px */
    z-index: 1;
    /* 이미지보다 아이콘이 위에 표시되도록 z-index 설정 */
    cursor: pointer;
    /* 클릭 가능하게 설정 */
}

.custom-contents {
    max-width: 120px;
    /* 제목의 최대 너비를 설정 */
    overflow: hidden;
    /* 내용이 넘칠 경우 숨김 처리 */
    text-overflow: ellipsis !important;
    /* 넘치는 텍스트에 '...' 추가 (이거 적용안됨 이후 수정필요)*/
    white-space: nowrap;
    /* 텍스트 줄 바꿈 방지 */
}

.input-container {
    padding: 10px;
    background-color: #f1f1f1;
    border-top: 1px solid #ccc;
}

.input-field {
    width: 100%;
    height: 60px;
    /* height: 100px; */
    /* padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    resize: none;
    font-size: 1rem; */
}

.file-input-container {
    position: relative;
    display: flex;
    justify-content: flex-start;
    /* 파일 전송 아이콘을 왼쪽 정렬 */
}

.file-input-icon-left .v-input__prepend-inner {
    justify-content: flex-start;
    /* 아이콘을 왼쪽으로 정렬 */
}

.send-btn {
    background-color: #4CAF50;
    color: white;
}
</style>