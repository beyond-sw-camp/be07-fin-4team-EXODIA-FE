<!-- 채팅방 하나의 화면 -->
<!--채팅방 나가기, 채팅방 내 메세지 검색 , 채팅구성원 확인, 채팅유저 초대, 채팅 파일 모아보기, 채팅 이미지 모아보기 -->
<!--채팅 날짜 구분해서 채팅메세지 불러오기 / 나와 구성원 구분하여 띄워주기 / 구성원 프로필사진 : 메세지-->
<!-- 채팅입력창, 파일 보내기, 이미지 보내기-->


<template>
    <v-container> <!--전체 채팅방 감싸요-->

        <!-- 채팅방 상단 -->
        <v-row class="chat-room-header">
            <v-col cols="1">
                <v-icon class="icon" @click="goBack">mdi-chevron-left</v-icon> <!-- 뒤로가기 -->
            </v-col>
            <v-col cols="8" class="chat-room-title">
                <span class="chat-room-name">{{ chatRoomId }}</span>
            </v-col>
            <v-col cols="3" class="header-icons">
                <v-icon class="icon">mdi-magnify</v-icon> <!-- 검색 -->
                <v-icon class="icon">mdi-dots-vertical</v-icon> <!-- 메뉴 -->
            </v-col>
        </v-row>



        <!-- 채팅 내용 -->
        <div class="chat-content">
            <div v-for="(chat, index) in chatMessageList" :key="chat.id">
                <!-- 날짜 구분 -->
                <div v-if="index === 0 || isDifferentDay(chat.createAt, chatMessageList[index - 1].createAt)">
                    <div class="date-divider">
                        <span class="date-text">{{ getDay(chat.createAt) }}</span>
                    </div>
                </div>

                <!-- 메시지 -->
                <div :class="chat.senderNum === chatSenderNum ? 'my-message' : 'other-message'">
                    <v-row v-if="chat.senderNum !== chatSenderNum" class="message-row">
                        <!-- <v-avatar class="profile-avatar">
                            <img :src="chat.profileImage" alt="프로필 이미지" />
                        </v-avatar> -->
                        <v-col>
                            <span class="sender-name">{{ chat.senderName }}</span>
                        </v-col>
                        <v-col v-if="chat.messageType == 'TALK'">
                            <div class="message-text">{{ chat.message }}</div>
                        </v-col>
                        <v-col v-if="chat.messageType == 'FILE'">
                            <div class="message-text">파일입니다.</div>
                        </v-col>
                    </v-row>

                    <v-row v-if="chat.senderNum === chatSenderNum" class="message-row my-row">
                        <v-col v-if="chat.messageType == 'TALK'">
                            <div class="message-text">{{ chat.message }}</div>
                        </v-col>
                        <v-col v-if="chat.messageType == 'FILE'">
                            <div class="message-text">내가 보낸 파일입니다.</div>
                        </v-col>
                    </v-row>

                    <!-- 시간 -->
                    <span class="message-time">{{ getTime(chat.createAt) }}</span>
                </div>
            </div>
        </div>

        <!-- 채팅 입력 -->
        <v-container class="input-container">
            <v-row>
                <v-text-field style="height: 200px;" v-model="messageToSend" v-on:keypress.enter="sendMessage"></v-text-field>
            </v-row>
            <v-row>
                <v-file-input v-model="files" @change="fileUpdate" multiple hide-input prepend-icon="mdi-paperclip">
                    파일 전송
                </v-file-input>
                <v-btn class="send-btn" @click="sendMessage">전송</v-btn>
            </v-row>
        </v-container>


    </v-container>
</template>

<script>
import axios from 'axios';
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'

export default {
    props: [
        'chatRoomIdProp' // ⭐⭐⭐ 채팅방 리스트에서 채팅방 id, name, userNums 받자.=
    ],
    components: {

    },
    data() {
        return {
            stompClient: null,
            chatRoomId: null, // ⭐⭐⭐ this.$route.params.id, // props 로 처리할지 params->axios.get로 처리할지..
            // chatRoomName: "", // 채팅방 이름
            chatMessageList: [], // 주고받은 채팅내역

            chatSenderNum: '', // 채팅방을 여는 사람 == 채팅보내는 사람

            files: null, // v-file-input로 업로드한 파일들
            fileList: [], // files를 가공한 리스트.
            fileRes: null, // 메세지와 함께 보내기 위한 파일메타데이터(name, s3url)

            // messageType: '', // 메세지 타입 // TALK, FILE
            messageToSend: '', // 메세지입력란
        }
    },
    async created() {
        // this.chatRoomId = this.chatRoomIdProp; // ⭐⭐⭐ props 로 처리할지 params 로 처리할지.. ⭐⭐⭐
        this.chatRoomId = this.$route.params.id;
        this.chatSenderNum = localStorage.getItem('userNum');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/${this.chatRoomId}`);
        if (response.data) {
            this.chatMessageList = response.data.result;
        }
    },
    mounted() {
        this.connect();
    },
    methods: {
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
                        const receivedMessage = JSON.parse(message.body);
                        this.chatMessageList.push(receivedMessage);
                    });
                },
                (error) => {
                    console.error("Connection error: ", error);
                    setTimeout(() => this.connect(), 5000);  // 재연결 시도
                }
            )
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
                    imageUrl: URL.createObjectURL(file)
                })
            });
            this.files = null;
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

        goBack() {
            console.log("goback");
        },
    }
}

</script>

<style scoped>
.chat-room-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: space-between;
}

.chat-room-header {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #e9f4e4;
    border-bottom: 1px solid #ccc;
}

.chat-room-avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.chat-room-title {
    display: flex;
    align-items: center;
}

.chat-room-name {
    margin-left: 10px;
}

.header-icons {
    display: flex;
    justify-content: flex-end;
}

.icon {
    cursor: pointer;
    margin-right: 10px;
}

.chat-content {
    flex: 1;
    padding: 10px;
    height: 500px;
    overflow-y: auto;
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
    margin-bottom: 10px;
}

.my-row {
    justify-content: flex-end;
}

.profile-avatar img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
}

.sender-name {
    font-weight: bold;
}

.message-text {
    background-color: #e0f7fa;
    padding: 10px;
    border-radius: 10px;
    max-width: 60%;
    display: inline-block;
}

.message-time {
    font-size: 0.8em;
    color: gray;
}

.input-container {
    padding: 10px;
    background-color: #f1f1f1;
    border-top: 1px solid #ccc;
}

.send-btn {
    background-color: #4CAF50;
    color: white;
}
</style>