<template>
    <h1 style="margin:35px 0">법인 카드 신청</h1>
    <v-row justify="justify-space-around">
        <v-col cols="9">
            <v-row>
                <v-col cols="2">
                    <v-list-subheader>신청일</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-date-input label="Date of birth" prepend-icon="" variant="outlined"
                        persistent-placeholder></v-date-input>
                    <!-- <v-text-field label="사용 기간" v-model="formData.사용기간"></v-text-field> -->

                </v-col>
            </v-row>

            <v-row>
                <v-col cols="2">
                    <v-list-subheader>사용 기간</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-text-field label="사용 기간" v-model="formData.사용기간"></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="2">
                    <v-list-subheader>사유</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-text-field label="사유" v-model="formData.사유"></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="2">
                    <v-list-subheader>사용 인원</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-text-field label="사용 인원" v-model="formData.사용인원"></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="2">
                    <v-list-subheader>사용 금액</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-text-field label="사용 금액" v-model="formData.사용금액"></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="2">
                    <v-list-subheader>총 금액</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-text-field label="총 금액" v-model="formData.총금액"></v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="2">
                    <v-list-subheader>기타</v-list-subheader>
                </v-col>

                <v-col cols="10">
                    <v-text-field label="기타" v-model="formData.기타"></v-text-field>
                </v-col>
            </v-row>
        </v-col>

        <v-col cols="3">
            <v-card>
                <v-card-title>결재 라인</v-card-title>
                <v-list>
                    <v-list-item v-for="user in users" :key="user.id" draggable="true" @dragstart="onDragStart(user)"
                        class="draggable-item">
                        <v-list-item-content>{{ user.name }}</v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card>
            <v-card @dragover.prevent @drop="onDrop" class="drop-zone">
                <v-card-text>결재자를 선택하시오.</v-card-text>
                <v-list>
                    <v-list-item v-for="(droppedUser, index) in droppedUsers" :key="droppedUser.id">
                        <v-list-item-content>{{ droppedUser.name }} - {{ droppedUser.positionName
                            }}</v-list-item-content>
                        <v-btn icon color="red" @click="removeUser(index)">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-card>
            <v-btn color="primary" class="mt-4" @click="createSubmit">
                결재라인 등록
            </v-btn>
        </v-col>
    </v-row>


</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,

            formData: {
                신청일: '',
                사용기간: '',
                사유: '',
                사용인원: '',
                사용금액: '',
                총금액: '',
                기타: ''
            },
            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitTypes: [],

            submitCreateData: {
                submitType: '',
                contents: '',
                submitUserDtos: []
            },


        }
    },
    created() {
        this.fetchUsers();
        this.submitCreateData.submitType = '법인 카드 신청';
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await axios.get('/user/list');
                this.users = response.data;
            } catch (e) {
                console.error('직원 불러오는데 오류 발생:', e);
            }
        },

        onDragStart(user) {
            this.draggedUser = user;
        },
        onDrop() {
            if (this.draggedUser && !this.droppedUsers.includes(this.draggedUser)) {

                console.log(this.droppedUsers)

                this.submitCreateData.submitUserDtos.push({
                    userName: this.draggedUser.name,
                    position: this.draggedUser.positionName,

                });
                this.droppedUsers.push(this.draggedUser);
                this.draggedUser = null;
            }
        },
        removeUser(index) {
            this.droppedUsers.splice(index, 1);
        },
        async createSubmit() {
            try {
                this.submitCreateData.contents = this.submitCreateData.contents = JSON.stringify(this.formData);
                await axios.post('/submit/create', this.submitCreateData);
                alert("결재 요청이 성공적으로 처리되었습니다.")
                location.reload();
            } catch (e) {
                console.error('결재 요청 실패:', e);
            }
        }

    },
}
</script>

<style scoped>
.draggable-item {
    cursor: grab;
    margin: 5px;
    padding: 10px;
}

.drop-zone {
    min-height: 200px;
    border: 2px dashed #3f51b5;
    padding: 20px;
}
</style>