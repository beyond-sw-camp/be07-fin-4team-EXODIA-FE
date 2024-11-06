<template>
    <v-dialog v-model="dialog" max-width="400px">
        <v-container class="invite-container">
            <div v-if="chatUserSelect">
                <v-row>
                    <v-col>
                        <h3>채팅 상대 선택</h3>
                    </v-col>
                </v-row>

                <div class="chat-user-list">
                    <OrganizationChart @user-selected="addUser" />
                </div>

                <div class="select-divider">
                    <div v-if="selectUser !== null">
                        <br>
                        <hr class="select-line" />
                        <br>
                    </div>
                </div>

                <!-- 선택된 유저-->
                <div class="selected-user-row" v-if="selectUser !== null">
                    <v-row>
                        <v-chip-group column multiple active-class="selected-chip">
                            <v-chip style="width: max-content; font-size: 13px; margin: 12px; margin-right: 0px; margin-bottom: 3px;"
                                @click="removeUser()">
                                {{ selectUser.name }}
                                <v-icon style="font-size: 13px; padding-left: 2px;" right>mdi-close</v-icon>
                            </v-chip>
                        </v-chip-group>
                    </v-row>
                    <!-- <v-row>
                        <v-col class="select-user-list" cols="3">
                            <v-icon color="grey" class="close-icon" @click="removeUser()">mdi-close-circle</v-icon>
                            <div class="select-user">{{ selectUser.name }}</div>
                        </v-col>
                    </v-row> -->
                </div>

                <v-row justify="end">
                    <v-btn v-list @click="showChatRoomNameChange">다음</v-btn>
                    <v-btn v-delete @click="closeModal">취소</v-btn>
                </v-row>
            </div>


            <div v-if="chatRoomNameChange">
                <v-row>
                    <v-col cols="12">
                        <h3>채팅방 이름</h3>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="chatRoomName" label="채팅방명을 다시 작성해주세요."></v-text-field>
                    </v-col>
                </v-row>
                <v-row justify="end">
                    <v-btn v-create @click="inviteChatUser">초대</v-btn>
                    <v-btn v-delete @click="closeModal">취소</v-btn>
                </v-row>
            </div>
        </v-container>
    </v-dialog>
</template>

<script>
import axios from 'axios';
import OrganizationChart from '@/views/organization/OrganizationChart.vue';

export default {
    props: ['chatRoomIdProp', 'chatRoomNamePropProp', 'existChatUsersProp', 'invite'],
    components: {
        OrganizationChart,
    },
    data() {
        return {
            chatRoomId: null,
            chatRoomName: null,

            chatUserSelect: true, // 초대 사원 선택 제어
            chatRoomNameChange: false, // 채팅방 이름 변경 제어

            selectUser: null, // 선택한 사원

            inviteChatUserData: {
                inviteUserNum: null,
                roomId: null
            },
            changeChatRoomNameData: {
                chatRoomName: null,
                roomId: null
            }
        }
    },

    async created() {
        this.chatRoomId = this.chatRoomIdProp;
    },

    methods: {
        removeUser() {
            this.selectUser = null;
        },
        addUser(userInfos) {
            if (this.existChatUsersProp.indexOf(userInfos.userNum) != -1) {
                alert("이미 채팅방에 존재하는 유저입니다.");
                return;
            }
            this.selectUser = userInfos;
            console.log(this.selectUser);
        },

        showChatRoomNameChange() {
            // ⭐ 중복인원이 있는 채팅방을 초대로 만들 수 있다...
            if (this.selectUser == null) {
                alert("유저를 고르세요.");
                return;
            }
            this.chatUserSelect = false;
            this.chatRoomNameChange = true;
            this.chatRoomName = this.chatRoomNamePropProp + ', ' + this.selectUser.name;
        },

        async inviteChatUser() {
            try {
                this.inviteChatUserData.roomId = this.chatRoomId;
                this.inviteChatUserData.inviteUserNum = this.selectUser.userNum;

                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/invite`, this.inviteChatUserData);

                this.changeChatRoomNameData.chatRoomName = this.chatRoomName;
                this.changeChatRoomNameData.roomId = this.chatRoomId;
                const response_ = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/updateName`, this.changeChatRoomNameData);
                console.log(response_);

                const changeChatRoom = {
                    senderNum: response.data.result.senderNum,
                    senderName: response.data.result.senderName,
                    chatRoomNameChange: this.chatRoomName
                }
                this.$emit("invite", changeChatRoom);
                this.selectUser = null;
                this.$emit('update:dialog', false);

            } catch (e) {
                console.error('유저 초대를 실패했습니다.', e);
            }
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
    background-color: white;
}

.chat-user-list {
    padding-top: 15px;
    flex: 1;
    height: 250px;
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
    width: 6px;
}

.chat-user-list::-webkit-scrollbar-thumb {
    background-color: #888888;
    border-radius: 10px;
}

.chat-user-list::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 10px;
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

.v-btn {
    margin-right: 10px;
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