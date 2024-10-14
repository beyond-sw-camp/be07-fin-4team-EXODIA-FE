<!-- 채팅방 이름, 작성. 유저 검색(이름, 사번) 추가, 삭제 -->
<template>
    <v-container max-width="500px">
        <!-- 채팅 상대 선택 화면 -->
        <v-container v-if="showChatUser" class="create-container">
            <v-row>
                <v-col cols="12">
                    <h3>채팅 상대 선택</h3>
                </v-col>
            </v-row>

            <!-- 검색창 및 돋보기 아이콘 -->
            <v-row>
                <v-col cols="10">
                    <v-text-field v-model="searchQuery" placeholder="부서, 이름, 사번으로 검색"></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="searchUser">mdi-magnify</v-icon>
                </v-col>
            </v-row>

            <!-- 검색된 유저 리스트 -->
            <v-row v-for="(userInfos, index) in userList" :key="index" class="user-row">
                <!-- <v-col cols="2">
                    <v-avatar>
                        <img :src="user.profileImage" alt="user avatar">
                    </v-avatar>
                </v-col> -->
                <v-col cols="8">
                    <span>{{ userInfos.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-btn icon @click="addUser(userInfos)">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <div v-if="selectdUser.length !== 0">
                <span>------------------------------------------------</span>
            </div>

            <!-- 선택된 유저 리스트 -->
            <v-row v-for="(userInfo, index) in selectdUser" :key="index" class="selected-user-row">
                <!-- <v-col cols="2">
                    <v-avatar>
                        <img :src="user.profileImage" alt="user avatar">
                    </v-avatar>
                </v-col> -->
                <v-col cols="8">
                    <span>{{ userInfo.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-btn icon @click="removeUser(index)">
                        <v-icon>mdi-minus</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <!-- 다음 버튼 -->
            <v-row>
                <v-col cols="12" class="text-right">
                    <v-btn color="success" @click="showChatRoomNameCreate">다음</v-btn>
                    <v-btn color="error" @click="closeCreate">취소</v-btn>
                </v-col>
            </v-row>
        </v-container>

        <!-- 채팅방 이름 작성 화면 -->
        <v-container v-if="showChatRoomName" class="create-container">
            <v-row>
                <v-col cols="12">
                    <h3>채팅방 이름</h3>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="chatroomData.roomName" placeholder="채팅방 이름을 입력하세요"></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" class="text-right">
                    <v-btn color="success" @click="createChatRoom">생성</v-btn>
                    <v-btn color="error" @click="closeCreate">취소</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script>
import axios from 'axios';
// import { alertProps } from 'element-plus';

export default {
    data() {
        return {
            showChatUser: null, // 채팅유저 선택 제어
            showChatRoomName: null, // 채팅방명 제어

            searchQuery: "", // 유저 선택 검색어

            chatroomData: {
                roomName: "",
                userNum: "", // 만드는 사람
                userNums: [] // 초대받는 사람의 사번만
            }, // 채팅방 생성 데이터

            userList: [], // 사원 

            selectdUser: [], // 채팅 선택된 사원

        }
    },
    created() {
        this.chatroomData.userNum = localStorage.getItem('userNum');
        this.showChatUser = true;
        this.showChatRoomName = false;
        this.loadUserList();
    },
    methods: {
        async loadUserList() {
            try {
                // const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`, {
                //     params: {
                //         ...{ searchName: this.searchQuery } )
                //     }
                // });
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
                console.log(response);
                this.userList = response.data;
            } catch (e) {
                console.error('사원 목록 조회 실패', e);
            }

        },

        searchUser() {
            this.loadUserList();
        },

        removeUser(index) {
            this.selectdUser.splice(index, 1);
        },
        addUser(userInfos) {
            this.selectdUser.push(userInfos);
        },
        // checkUser(){ // 선택된 채팅 유저 중 중복된 인원이 있으면 안된다.

        // },

        showChatRoomNameCreate() {
            if (this.selectdUser.length === 0) {
                alert("유저를 고르세요.");
                return;
            }
            this.showChatUser = false;
            this.showChatRoomName = true;
        },

        async createChatRoom() {
            try {
                this.chatroomData.userNums = this.selectdUser.map(num => num.userNum);
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/create`, this.chatroomData);
                console.log(response);
                if (response.data.result.existCheck) {
                    alert("이미 존재하는 채팅방입니다.");
                    this.$emit('update:dialog', false);
                    this.$emit('update:check', true);
                    // window.location.href='/chatRoom/list';
                    window.location.reload('chatRoom/list');
                } else {
                    alert("채팅방이 생성 성공");
                    this.$emit('update:dialog', false);
                    this.$emit('update:check', true);
                    window.location.href='/chatRoom/list';
                }
            } catch (e) {
                console.error("채팅방 생성 실패", e);
            }
        },

        closeCreate() {
            this.showChatUser = true;
            this.showChatRoomName = false;
            this.selectdUser = [];
            this.chatroomData.userNums = [];
            this.$emit('update:dialog', false);
            this.$emit('update:check', true);
        }

    }
}
</script>

<style scoped>
.create-container {
    background-color: #f0f0f0;
}
</style>