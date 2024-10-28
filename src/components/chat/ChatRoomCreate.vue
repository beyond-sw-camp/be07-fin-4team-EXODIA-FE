<template>
    <v-container>
        <!-- 채팅 상대 선택 화면 -->
        <v-container v-if="showChatUser" class="create-container">
            <v-row>
                <v-col cols="12">
                    <h3>채팅 상대 선택</h3>
                </v-col>
            </v-row>

            <div class="chat-user-list">
                <OrganizationChart @user-selected="addUser" />
            </div>

            <div class="select-divider">
                <div v-if="selectUser.length !== 0">
                    <br>
                    <hr class="select-line" />
                    <br>
                </div>
            </div>

            <!-- 선택된 유저 리스트 -->
            <div class="selected-user-row">
                <v-row>
                    <v-col class="select-user-list" cols="3" v-for="(userInfo, index) in selectUser" :key="index">
                        <v-icon color="grey" class="close-icon" @click="removeUser(index)">mdi-close-circle</v-icon>
                        <div class="select-user">{{ userInfo.name }}</div>
                    </v-col>
                </v-row>
            </div>


            <!-- 다음 버튼 -->
            <v-row>
                <v-col cols="12" class="text-right">
                    <v-btn color="success" @click="showChatRoomNameCreate">다음</v-btn>
                    <v-btn color="error" @click="closeCreate">취소</v-btn>
                </v-col>
            </v-row>
        </v-container>

        <!-- 채팅방 이름 작성 화면-->
        <v-container v-if="showChatRoomName" class="create-container">
            <v-row>
                <v-col cols="12">
                    <h3>채팅방 이름</h3>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12">
                    <v-text-field v-model="chatroomData.roomName" label="채팅방명을 작성해주세요."></v-text-field>
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
import OrganizationChart from '@/views/organization/OrganizationChart.vue';

export default {
    components: {
        OrganizationChart,
    },
    data() {
        return {
            showChatUser: null, // 채팅유저 선택 제어
            showChatRoomName: null, // 채팅방명 제어

            chatroomData: {
                roomName: "",
                userNum: "", // 만드는 사람
                userNums: [] // 초대받는 사람의 사번만
            }, // 채팅방 생성 데이터

            // userList: [], // 사원 

            selectUser: [], // 채팅 선택된 사원
        }
    },
    created() {
        this.chatroomData.userNum = localStorage.getItem('userNum');
        this.showChatUser = true;
        this.showChatRoomName = false;
    },
    methods: {
        // async searchUser() {
        //     try {
        //         const params = {
        //             search: this.searchQuery,
        //             searchType: "all",
        //         };
        //         const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, { params });
        //         this.userList = response.data;
        //         //⭐ 애초에 쿼리문에서 거르는게 좋을 거 같다.
        //         this.userList = this.userList.filter((user) => user.userNum != this.chatroomData.userNum);
        //     } catch (error) {
        //         console.error("유저 검색 중 오류 발생:", error);
        //     }
        // },

        removeUser(index) {
            this.selectUser.splice(index, 1);
        },
        addUser(user) {
            if (this.selectUser.indexOf(user) != -1) {
                alert("이미 선택한 유저입니다.");
                return;
            }
            if(user.userNum == this.chatroomData.userNum){
                alert("자기 자신은 선택할 수 없습니다.");
                return;
            }
            this.selectUser.push(user);
        },

        showChatRoomNameCreate() {
            if (this.selectUser.length === 0) {
                alert("유저를 고르세요.");
                return;
            }
            this.chatroomData.roomName = this.selectUser.map(user => user.name).join(", ");
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
                    this.$emit('update');
                    // window.location.href = '/chatRoom/list';
                } else {
                    alert("채팅방이 생성 성공");
                    this.$emit('update:dialog', false);
                    this.$emit('update:check', true);
                    this.$emit('update');
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
/* .create-container {
    background-color: #f0f0f0;
} */

.chat-user-list {
    padding-top: 15px;
    flex: 1;
    height: 350px;
    width: auto;
    overflow-y: scroll;
    overflow-x: hidden;
    /* flex-shrink: 0; */
    -ms-overflow-style: none;
    /* 인터넷 익스플로러 */
    scrollbar-width: none;
    /* 파이어폭스 */
}

.chat-user-list::-webkit-scrollbar {
    display: none;
}

.select-divider {
    height: 50px;
}

.select-line {
    border: 0px;
    border-top: 2px solid rgba(0, 0, 0, 0.1);
}

.selected-user-row {
    height: 90px;
    width: auto;
    margin-bottom: 10px;
}

.select-user-list {
    position: relative;
}

.close-icon {
    position: absolute;
    top: 8px;
    left: 64px;
    z-index: 1;
    /* 이미지보다 아이콘이 위에 표시되도록 z-index 설정 */
    cursor: pointer;
    /* 클릭 가능하게 설정 */
    font-size: small;
}

.select-user {
    text-align: center;
    width: max-content;
    background-color: rgba(233, 233, 233, 0.4);
    padding: 5px 10px;
    border-radius: 10px;
    font-size: 13px;
}
</style>