<!-- 채팅방 하나의 화면 -->
<!--채팅방 나가기, 채팅방 내 메세지 검색 , 채팅구성원 확인, 채팅유저 초대, 채팅 파일 모아보기, 채팅 이미지 모아보기 -->
<!--채팅 날짜 구분해서 채팅메세지 불러오기 / 나와 구성원 구분하여 띄워주기 / 구성원 프로필사진 : 메세지-->
<!-- 채팅입력창, 파일 보내기, 이미지 보내기-->


<template>
    <v-container>
        <v-app-bar>
            <template>

            </template>
            <v-app-bar-title>
            </v-app-bar-title>
            <template>

            </template>
        </v-app-bar>

        <v-container>
        </v-container>
    </v-container>


    <div>
        <div>
            <div v-for="(messageContent, index) in chatMessageList" :key="index">
                <strong>{{ messageContent.sendName }}:</strong>
                <span>{{ messageContent.message }}</span>
                <!-- <small>{{ messageContent.sendAt }}</small> -->
            </div>
        </div>

        <div>
            <input v-model="messageToSend" @keyup.enter="sendMessage" placeholder="메시지를 입력하세요..." />
            <button @click="sendMessage">전송</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Stomp from 'webstomp-client'
import SockJS from 'sockjs-client'

export default {
    props: [
        'chatRoomIdProp' // 채팅방 번호 받아다가 // 입장 및 연결 
    ],
    components: {

    },
    data() {
        return {
            stompClient: null,
            chatRoomId: this.$route.params.id,
            chatSenderNumTmp: '', // 채팅방을 여는 사람 
            chatMessageList: [], // 주고받은 채팅
            messageType: '', // 메세지 타입
            messageToSend: '',
            sendTime: '',
        }
    },
    async created() {
        // this.chatRoomId = this.chatRoomIdProp;
        this.chatSenderNumTmp = localStorage.getItem('userNum');
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
            const authtoken = localStorage.getItem('token'); // Authorization: `Bearer ${authtoken}`
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
            if (this.messageToSend !== '') {
                if (this.stompClient && this.stompClient.connected) {
                    // this.getSendTime();
                    const messageReq = {
                        userNum: localStorage.getItem('userNum'),
                        roomId: this.chatRoomId,
                        messageType: "TALK",
                        message: this.messageToSend,
                        // sendAt: this.sendTime
                    }; // type 은 그때그때 달라져야한다.
                    this.stompClient.send(`/app/chat/message`, JSON.stringify(messageReq));
                    this.messageToSend = ''; // 입력 필드 초기화
                } else {
                    console.error('unconnected');
                }
            }
        },

        // getSendTime() {
        //     // let today = new Date();
        //     // let year = today.getFullYear(); // 년
        //     // let month = today.getMonth() + 1; // 월
        //     // let date = today.getDate(); // 일
        //     // let hour = today.getHours(); // 시
        //     // let minutes = today.getMinutes(); // 분
        //     // this.sendTime = year + "-" + month + "-" + date + " " + hour + ":" + minutes;
        //     const today = new Date();
        //     this.sendTime = today.toISOString().slice(0, 16).replace('T', ' ');
        // },
    }
}

</script>
