<!-- 채팅방 이름, 작성. 유저 검색(이름, 사번) 추가, 삭제 -->
<template>
    <v-container>
        <v-card>
            <v-card-title>
                채팅방 생성
            </v-card-title>
            <v-row>
                <v-form @submit.prevent="createChatRoom">
                    <!-- 채팅방 이름 입력-->
                    <v-row>
                        <v-text-field v-model="chatroomData.roomName">
                        </v-text-field>
                    </v-row>


                    <!-- 채팅방 유저 검색 -->
                    <v-row>

                        <v-row> <!-- 유저 검색 -->
                            <v-col>
                                <v-text-field v-model="searchQuery" label="search"></v-text-field>
                            </v-col>
                            <v-col>
                                <v-btn @click="searchUser">searchIcon</v-btn>
                            </v-col>
                        </v-row>

                        <v-row v-for="(userInfos, index) in userList" :key="index"> <!-- 유저 리스트 : 사번순 -->
                            <v-col>
                                <div>
                                    <span> {{ userInfos.name }} </span>
                                    <span> - </span>
                                    <span> {{ userInfos.positionName }} 님</span>
                                    <span> - </span>
                                    <span> {{ userInfos.departmentName }} </span>
                                </div>
                            </v-col>
                            <v-col>
                                <v-btn @click="addUser(userInfos)"> <!-- 유저 선택 -->
                                    <span>+</span>
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row v-for="(userInfo, index) in selectdUser" :key="index"> <!-- 선택 유저 리스트 : 사번순 -->
                            <v-col>
                                <span>{{ userInfo.name }}</span>
                            </v-col>
                            <v-col>
                                <v-btn @click="removeUser(index)"> <!-- 유저 선택해제 -->
                                    <span>-</span>
                                </v-btn>
                            </v-col>
                        </v-row>

                    </v-row>


                    <!-- 채팅방 생성, 취소 버튼 -->
                    <v-row>
                        <v-btn type="submit">create</v-btn>
                        <!-- <v-btn>cancel</v-btn> -->
                    </v-row>

                </v-form>
            </v-row>
        </v-card>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            searchQuery: "",

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
        async createChatRoom() {
            try{
                this.chatroomData.userNums = this.selectdUser.map(num => num.userNum);
                console.log(this.chatroomData);
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/create`, this.chatroomData);
                console.log(response);
                // this.$router.push("/chat/list");
            }catch(e){
                console.error("채팅방 생성 실패", e);
            }
        },

    }
}
</script>
