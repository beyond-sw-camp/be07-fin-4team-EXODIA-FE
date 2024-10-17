<template>
    <h1 style="margin:25px 0; font-weight:800">법인 카드 신청</h1>
    <v-card style="padding:50px">
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
                        <v-list-subheader>신청일</v-list-subheader>
                    </v-col>
                    <v-col cols="9">
                        <VueDatePicker locale="ko" v-model="formData.신청일" :type="'date'" format="yyyy-MM-dd"
                            :min-date="new Date()" :enable-time-picker="false" @select="onDateSelect"></VueDatePicker>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>사용 기간</v-list-subheader>
                    </v-col>

                    <v-col cols="9">
                        <v-text-field label="사용 기간" v-model="formData.사용기간"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>사유</v-list-subheader>
                    </v-col>

                    <v-col cols="9">
                        <v-text-field label="사유" v-model="formData.사유"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>사용 인원</v-list-subheader>
                    </v-col>

                    <v-col cols="9">
                        <v-text-field label="사용 인원" v-model="formData.사용인원"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>사용 금액</v-list-subheader>
                    </v-col>

                    <v-col cols="9">
                        <v-text-field label="사용 금액" v-model="formData.사용금액"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>총 금액</v-list-subheader>
                    </v-col>

                    <v-col cols="9">
                        <v-text-field label="총 금액" v-model="formData.총금액"></v-text-field>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="3">
                        <v-list-subheader>기타</v-list-subheader>
                    </v-col>

                    <v-col cols="9">
                        <v-text-field label="기타" v-model="formData.기타"></v-text-field>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="4" class="createSubmit">
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
                            <v-btn icon @click="removeUser(index)">
                                <v-icon style="border:none">mdi-close</v-icon>
                            </v-btn>
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
    </v-card>
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

            formData: {
                신청일: new Date().toISOString().split("T")[0], // ISO 형식으로 초기화
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
                submitUserDtos: [],
            },
        }
    },
    mounted() {
        this.fetchWriter();
        this.fetchDepartment();

        this.fetchUsers();
        this.submitCreateData.submitType = '법인 카드 신청';
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
        async fetchWriter() {
            try {
                const response = await axios.get('/user/userName');
                this.userName = response.data.result;
            } catch (e) {
                console.error('회원 이름 불러오는데 오류 발생:', e);
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
        onDateSelect(date) {
            this.formData.신청일 = date;
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
        },
        async createSubmit() {
            try {
                this.submitCreateData.contents = this.submitCreateData.contents = JSON.stringify(this.formData);
                await axios.post('/submit/create', this.submitCreateData, { headers: { Authorization: `Bearer ${this.token}` } });
                alert("결재 요청이 성공적으로 처리되었습니다.")
                this.$router.push("/submit/list/my")
            } catch (e) {
                console.error('결재 요청 실패:', e);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        }
    },
}
</script>

<style scoped>
*:not(h1) {}

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