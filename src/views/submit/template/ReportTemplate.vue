<template>
    <v-container class="container">
        <v-row class="mb-6 mt-12" style="padding-left:30px">
            <h1>보고서 결재</h1>
        </v-row>

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
                            <v-list-subheader>휴가 종류</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <v-select label="휴가 종류" v-model="formData.휴가종류" :items="휴가종류목록" outlined></v-select>

                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>휴가 시작일</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <VueDatePicker locale="ko" v-model="formData.휴가시작일" :type="'date'" format="yyyy-MM-dd"
                                :min-date="new Date()" :enable-time-picker="false"></VueDatePicker>
                        </v-col>
                    </v-row>


                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>휴가 종료일</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <VueDatePicker locale="ko" v-model="formData.휴가종료일" :type="'date'" format="yyyy-MM-dd"
                                :min-date="new Date()" :enable-time-picker="false"></VueDatePicker>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>총 휴가 일수</v-list-subheader>
                        </v-col>

                        <v-col cols="9">
                            <v-text-field label="총 휴가 일수" v-model="formData.총휴가일수"></v-text-field>
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

                </v-col>

                <!-- 결재 라인 -->
                <v-col cols="4">
                    <v-card style="background-color: rgba(123, 86, 86, 0.3);">
                        <v-card-title>결재 라인</v-card-title>
                        <v-list style="background-color: rgba(123, 86, 86, 0.3);">
                            <v-list-item v-for="user in users" :key="user.id" draggable="true"
                                @dragstart="onDragStart(user)" class="draggable-item">
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
                    <v-row class="submit-btn">
                        <v-btn v-create class="mt-8" @click="createSubmit">
                            결재 등록
                        </v-btn>
                    </v-row>
                </v-col>
            </v-row>
        </v-row>
    </v-container>

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

            휴가종류목록: ['연차', '반차', '병가', '기타'],

            formData: {
                휴가종류: '',
                휴가시작일: new Date().toISOString().split("T")[0],
                휴가종료일: new Date().toISOString().split("T")[0],
                총휴가일수: '',
                사유: ''
            },
            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitTypes: [],

            submitCreateData: {
                submitType: '휴가신청',
                contents: '',
                submitUserDtos: [],
            },
        }
    },
    mounted() {
        this.fetchWriter();
        this.fetchDepartment();
        this.fetchUsers();
        this.submitCreateData.submitType = '휴가 신청';
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await axios.get(`/department/${this.departmentId}/users`);
                this.users = response.data.filter(u => Number(u.positionId) <= Number(this.positionId));
            }
            catch (e) {
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
                this.submitCreateData.submitUserDtos.sort((a, b) => b.position - a.position);

                await axios.post('/submit/create', this.submitCreateData, { headers: { Authorization: `Bearer ${this.token}` } });
                alert("결재 요청이 성공적으로 처리되었습니다.")
                location.reload();
            } catch (e) {
                console.error('결재 요청 실패:', e);
            }
        },
        formatDate(date) {
            return new Date(date)
                .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
                .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        }
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


.submit-btn {
    display: flex;
    justify-content: center;
    align-content: center;
}
</style>