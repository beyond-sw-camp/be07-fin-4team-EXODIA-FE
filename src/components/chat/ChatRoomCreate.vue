<!-- 채팅방 이름, 작성. 유저 검색(이름, 사번) 추가, 삭제 -->
<template>
    <v-container>
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
                    <v-text-field v-model="searchQuery" @input="searchUser" placeholder="부서, 직급, 이름으로 검색"></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="searchUser">mdi-magnify</v-icon>
                </v-col>
            </v-row>

            <!-- 검색된 유저 리스트-->
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

            <div v-if="selectUser.length !== 0">
                <br>
                <hr class="select-line" />
                <br>
            </div>

            <!-- 선택된 유저 리스트 -->
            <v-row v-for="(userInfo, index) in selectUser" :key="index" class="selected-user-row">
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

        <!-- 채팅방 이름 작성 화면 ⭐⭐⭐ -> 없으면 참여유저이름들로. -->
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

            selectUser: [], // 채팅 선택된 사원

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
                const params = {
                    search: this.searchQuery,
                    searchType: "all",
                };
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, { params });
                this.userList= response.data;
                console.log("모든 유저 리스트가 나와야한다.");
                console.log(this.userList);

                //⭐ 애초에 쿼리문에서 거르는게 좋을 거 같다. // 이거 지금 뭔가 이상해...
                for(let i =0 ; i< this.userList.length ; i++){
                    if(this.userList[i].userNum == this.chatroomData.userNum){
                        this.userList.splice(i,1);
                        break;
                    }
                }
            } catch (error) {
                console.error("유저 검색 중 오류 발생:", error);
            }
        },

        async searchUser() {
            this.loadUserList();
        },

        removeUser(index) {
            this.selectUser.splice(index, 1);
        },
        addUser(userInfos) {
            if (this.selectUser.indexOf(userInfos) != -1) {
                alert("이미 선택한 유저입니다.");
                return;
            }
            this.selectUser.push(userInfos);
        },

        showChatRoomNameCreate() {
            if (this.selectUser.length === 0) {
                alert("유저를 고르세요.");
                return;
            }
            this.showChatUser = false;
            this.showChatRoomName = true;
        },

        async createChatRoom() {
            try {
                if (this.chatroomData.roomName.trim() === '') {
                    alert("채팅방명을 작성해주세요.");
                    return;
                }
                this.chatroomData.userNums = this.selectUser.map(user => user.userNum);
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/create`, this.chatroomData);
                console.log(response);
                if (response.data.result.existCheck) {
                    alert("이미 존재하는 채팅방입니다.");
                    this.$emit('update:dialog', false);
                    this.$emit('update:check', true);
                    window.location.href = '/chatRoom/list';
                    // window.location.reload('/chatRoom/list');
                } else {
                    alert("채팅방이 생성 성공");
                    this.$emit('update:dialog', false);
                    this.$emit('update:check', true);
                    window.location.href = '/chatRoom/list';
                }
            } catch (e) {
                console.error("채팅방 생성 실패", e);
            }
        },

        closeCreate() {
            this.showChatUser = true;
            this.showChatRoomName = false;
            this.selectUser = [];
            this.chatroomData.roomName = "";
            this.chatroomData.userNum = "";
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
.select-line {
    border: 0px;
    border-top: 2px solid #000000;
}
</style>