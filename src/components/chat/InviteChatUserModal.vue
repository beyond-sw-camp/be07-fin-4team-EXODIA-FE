<template>
    <v-dialog v-model="dialog" max-width="400px">
        <v-container class="invite-container">
            <v-row>
                <v-col>
                    <h3>채팅 상대 선택</h3>
                </v-col>
            </v-row>

            <!-- ⭐⭐⭐ 검색창 및 돋보기 아이콘 -->
            <v-row>
                <v-col cols="10">
                    <v-text-field v-model="searchQuery" placeholder="부서, 이름, 사번으로 검색"></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="searchUser">mdi-magnify</v-icon>
                </v-col>
            </v-row>

            <!-- 검색된 유저 리스트  ⭐⭐⭐ 자기자신 빼고. -->
            <v-row v-for="(userInfos, index) in userList" :key="index">
                <v-col cols="8">
                    <span>{{ userInfos.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-btn icon @click="addUser(userInfos)">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <div v-if="selectUser !== null">
                <span>------------------------------------------------</span>
            </div>

            <v-row v-if="selectUser !== null">
                <v-col cols="8">
                    <span>{{ selectUser.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-btn icon @click="removeUser()">
                        <v-icon>mdi-minus</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <!-- 다음 버튼 -->
            <v-row>
                <v-col cols="12">
                    <v-btn @click="inviteChatUser">초대</v-btn>
                    <v-btn color="error" @click="closeModal">취소</v-btn>
                </v-col>
            </v-row>
        </v-container>

    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    props: ['chatRoomIdProp','existChatUsersProp'],
    data() {
        return {
            chatRoomId: null,
            searchQuery: "", // 유저 선택 검색어

            userList: [], // 사원
            selectUser: null, // 선택한 사원

            inviteChatUserData: {
                inviteUserNum: null,
                roomId: null
            }
        }
    },

    async created() {
        this.chatRoomId = this.chatRoomIdProp;
        this.loadUserList();
    },

    methods: {
        async loadUserList() {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`);
            console.log(response);
            this.userList = response.data;
            // 자기자신 제외하는 인원리스트 가져오는 거 백단에서 +서치 붙여서 만들기.
            
        },

        searchUser() {
            this.loadUserList();
        },

        removeUser() {
            this.selectUser = null;
        },
        addUser(userInfos) {
            this.selectUser = userInfos;
        },

        async inviteChatUser() {
            this.inviteChatUserData.roomId = this.chatRoomId;
            this.inviteChatUserData.inviteUserNum = this.selectUser.userNum;
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/invite`, this.inviteChatUserData);
            console.log(response);
            this.$emit("inviteUserMessage",response.data.result);
            this.$emit('update:dialog', false);
        },

        closeModal() {
            this.$emit('update:dialog', false);
        }

    }
}
</script>

<style scoped>
.invite-container {
    background-color: #f0f0f0;
}
</style>