<template>
    <v-dialog v-model="dialog" max-width="400px">
        <v-container class="invite-container">
            <v-row>
                <v-col cols="12">
                    <h3>채팅방 이름 변경</h3>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <!-- ⭐기존의 이름이 안들어간다 -->
                    <v-text-field v-model="chatRoomNameInput" label="채팅방명을 다시 작성해주세요."></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-btn v-create @click="changeChatRoomName">변경</v-btn>
                    <v-btn v-delete @click="closeModal">취소</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    props: ['chatRoomIdProp', 'chatRoomNamePropProp', 'changeRoomName'],
    data() {
        return {
            chatRoomId: null,

            chatRoomNameInput: null,

            changeChatRoomNameData: {
                chatRoomName: null,
                roomId: null
            }
        }
    },
    created() {
        this.chatRoomId = this.chatRoomIdProp;
        this.chatRoomNameInput = this.chatRoomNamePropProp;
        console.log(this.chatRoomNamePropProp);
    },
    mounted(){
        this.chatRoomNameInput = this.chatRoomNamePropProp;
    },
    methods: {
        async changeChatRoomName() {
            try {
                this.changeChatRoomNameData.chatRoomName = this.chatRoomNameInput;
                this.changeChatRoomNameData.roomId = this.chatRoomId;
                const response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/updateName`, this.changeChatRoomNameData);
                console.log(response);
                const changeChatRoom = {
                    chatRoomNameChange: this.chatRoomNameInput
                };
                this.$emit("changeRoomName", changeChatRoom);
                this.$emit('update:dialog', false);

            } catch (e) {
                console.error('채팅방명 변경을 실패하였습니다.', e);
            }
        },

        closeModal() {
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