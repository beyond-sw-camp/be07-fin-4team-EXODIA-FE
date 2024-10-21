<template>
    <v-dialog v-model="dialog" max-width="400px">
        <v-container class="invite-container">
            <v-row>
                <v-col>
                    <h3>채팅 상대 선택</h3>
                </v-col>
            </v-row>

            <!-- 검색창 및 돋보기 아이콘 -->
            <v-row>
                <v-col cols="10">
                    <v-text-field v-model="searchQuery" @input="searchUser"
                        placeholder="부서, 직급, 이름으로 검색"></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="searchUser">mdi-magnify</v-icon>
                </v-col>
            </v-row>

            <!-- 검색된 유저 리스트 -->
            <v-row v-for="(userInfos, index) in userList" :key="index">
                <v-col cols="8">
                    <span>{{ userInfos.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="addUser(userInfos)">mdi-plus</v-icon>
                </v-col>
            </v-row>

            <div v-if="selectUser !== null">
                <br>
                <hr class="select-line" />
                <br>
            </div>

            <v-row v-if="selectUser !== null">
                <v-col cols="8">
                    <span>{{ selectUser.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="removeUser()">mdi-minus</v-icon>
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
    props: ['chatRoomIdProp', 'existChatUsersProp', 'invite'],
    data() {
        return {
            chatRoomId: null,
            searchQuery: "", // 유저 선택 검색어

            userList: [], // 사원 목록
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
            try {
                const params = {
                    search: this.searchQuery,
                    searchType: "all",
                };
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, { params });
                this.userList = response.data;
                //⭐ 애초에 쿼리문에서 거르는게 좋을 거 같다.
                this.userList = this.userList.filter((user) => !this.existChatUsersProp.includes(user.userNum));
            } catch (error) {
                console.error("유저 검색 중 오류 발생:", error);
            }
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
            // ⭐ 중복인원이 있는 채팅방을 초대로 만들 수 있다...
            this.inviteChatUserData.roomId = this.chatRoomId;
            this.inviteChatUserData.inviteUserNum = this.selectUser.userNum;
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/invite`, this.inviteChatUserData);
            this.$emit("invite", response.data.result);
            this.selectUser = null;
            this.$emit('update:dialog', false);
        },

        closeModal() {
            this.selectUser = null;
            this.$emit('update:dialog', false);
        }

    }
}
</script>

<style scoped>
.invite-container {
    background-color: #f0f0f0;
}

.select-line {
    border: 0px;
    border-top: 2px solid #000000;
}
</style>