<template>
    <h1 style="margin:25px 0; font-weight:800">경조사 신청서</h1>
    <v-row style="padding:50px">
        <v-row justify="justify-space-around">
            <v-col cols="8">
                <v-row>
                    <v-col cols="2">
                        <v-list-subheader>신청인</v-list-subheader>
                    </v-col>
                    <v-col cols="4">
                        <v-text-field disabled>{{ this.userName }}</v-text-field>
                    </v-col>
                    <v-col cols="2">
                        <v-list-subheader>부서</v-list-subheader>
                    </v-col>
                    <v-col cols="4">
                        <v-text-field disabled>{{ this.departmentName }}</v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>경조사항</v-list-subheader>
                    </v-col>
                    <v-col cols="9">
                        <v-select label="경조 종류" v-model="formData.경조종류" :items="eventKeys" outlined></v-select>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>휴가일수</v-list-subheader>
                    </v-col>
                    <v-col cols="9">
                        <v-text-field label="휴가 일수" v-model="formData.휴가일수" disabled></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-checkbox v-model="submitCreateData.uploadBoard" label="게시판에 등록하시겠습니까?"></v-checkbox>
                </v-row>

            </v-col>

            <!-- 결재 라인 -->
            <v-col cols="4">
                <v-card style="background-color: rgba(123, 86, 86, 0.3);">
                    <v-card-title>결재 라인</v-card-title>
                    <v-list style="background-color: rgba(123, 86, 86, 0.3);">
                        <v-list-item v-for="user in users.filter(u => u.positionId < this.positionId)" :key="user.id"
                            draggable="true" @dragstart="onDragStart(user)" class="draggable-item">
                            <v-list-item-content>{{ user.name
                                }}</v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
                <v-card @dragover.prevent @drop="onDrop" class="drop-zone">
                    <v-card-text v-if="droppedUsers.length == 0">결재자를 선택하시오.</v-card-text>
                    <v-list>
                        <v-list-item v-for="(droppedUser, index) in droppedUsers" :key="droppedUser.id">
                            <v-list-item-content>{{ droppedUser.name }}</v-list-item-content>
                            <v-icon style="border:none" @click="removeUser(index)">mdi-close</v-icon>
                        </v-list-item>
                    </v-list>
                </v-card>
                <v-row class="submitBtn">
                    <v-btn style="background-color:#722121; color:#ffffff;" class="mt-8" @click="createSubmit">
                        결재라인 등록
                    </v-btn>
                </v-row>
            </v-col>
        </v-row>
    </v-row>

</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,
            departmentId: localStorage.getItem('departmentId') || null,
            positionId: localStorage.getItem('positionId') || null,

            userName: '',
            departmentName: '',

            eventOptions: {
                '본인의 결혼': '5일',
                '자녀결혼': '1일',
                '배우자의 출산': '10일',
                '입양': '20일',
                '배우자, 본인 및 배우자의 부모 사망': '5일',
                '자녀 사망': '3일',
                '본인 및 배우자의 (외)조부모 사망': '3일',
                '본인 및 배우자의 형제 자매 사망': '1일'
            },

            selectedEvent: null,
            eventDays: null,
            eventKeys: [],

            formData: {
                경조종류: '',
                휴가일수: '',
            },
            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitTypes: [],

            submitCreateData: {
                submitType: '경조사 신청서',
                contents: '',
                uploadBoard: false,
                submitUserDtos: [],
            },
        }
    },
    mounted() {
        this.fetchWriter();
        this.fetchDepartment();
        this.fetchUsers();
        this.submitCreateData.submitType = '경조사 신청서';
        this.eventKeys = Object.keys(this.eventOptions);

    },
    watch: {
        'formData.경조종류': function (newValue) {
            this.formData.휴가일수 = this.eventOptions[newValue];
        }
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await axios.get(`/user/department-users/${this.departmentId}`);
                this.users = response.data;
            } catch (e) {
                console.error('직원 불러오는데 오류 발생:', e);
            }
        },
        async fetchDepartment() {
            try {
                const response = await axios.get(`/department/name/${this.departmentId}`);
                this.departmentName = response.data.result;
            } catch (e) {
                console.error('직급 이름 불러오는데 오류 발생:', e);
            }
        },
        async fetchWriter() {
            try {
                const response = await axios.get('/user/userName');
                this.userName = response.data.result;
            } catch (e) {
                console.error('회원 이름 불러오는데 오류 발생:', e);
            }
        },
        onDragStart(user) {
            this.draggedUser = user;
        },
        onDrop() {
            if (this.draggedUser && !this.droppedUsers.includes(this.draggedUser)) {
                this.submitCreateData.submitUserDtos.push({
                    userName: this.draggedUser.name,
                    position: this.draggedUser.positionId,
                });
                this.droppedUsers.push(this.draggedUser);
                this.draggedUser = null;
            }
        },
        removeUser(index) {
            this.droppedUsers.splice(index, 1);
            this.submitCreateData.submitUserDtos.splice(index, 1);
        },
        async createSubmit() {
            try {
                this.submitCreateData.contents = this.submitCreateData.contents = JSON.stringify(this.formData);
                await axios.post('/submit/create', this.submitCreateData, { headers: { Authorization: `Bearer ${this.token}` } });

                console.log(this.submitCreateData)
                alert("결재 요청이 성공적으로 처리되었습니다.")
                location.reload();
            } catch (e) {
                console.error('결재 요청 실패:', e);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        },
    }
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
    border: 2px dashed #7A5656;
    padding: 20px;
}


.submitBtn {
    display: flex;
    justify-content: center;
    align-content: center;
}
</style>