<template>
    <v-container class="container">
        <v-row class="mb-6 mt-12" style="padding-left:30px">
            <h1>휴가 신청서</h1>
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
                            <v-select label="휴가 종류" v-model="formData.휴가종류" :items="vacationOptions" outlined>
                            </v-select>

                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>휴가 시작일</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <VueDatePicker locale="ko" v-model="formData.휴가시작일" :type="'date'" format="yyyy-MM-dd"
                                :min-date="new Date(new Date().setDate(new Date().getDate() + 1))"
                                :enable-time-picker="false"></VueDatePicker>
                        </v-col>
                    </v-row>


                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>휴가 종료일</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <VueDatePicker locale="ko" v-model="formData.휴가종료일" :type="'date'" format="yyyy-MM-dd"
                                :min-date="new Date(new Date().setDate(new Date().getDate() + 1))"
                                :enable-time-picker="false"></VueDatePicker>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>총 휴가 일수</v-list-subheader>
                        </v-col>

                        <v-col cols="9">
                            <v-text-field label="총 휴가 일수" v-model="formData.총휴가일수" disabled></v-text-field>
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
                                <v-list-item-content>{{ user.positionName
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
                            결재라인 등록
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

            vacationOptions: ['연차', '반차', '병가', '기타'],

            formData: {
                휴가종류: '',
                휴가시작일: new Date().toISOString().split("T")[0],
                휴가종료일: new Date().toISOString().split("T")[0],
                총휴가일수: 0,
                사유: ''
            },
            totalLeaveDays: 0,

            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitTypes: [],

            submitCreateData: {
                submitType: '휴가 신청서',
                contents: '',
                submitUserDtos: [],
            },
        }
    },
    mounted() {
        this.fetchWriter();
        this.fetchDepartment();
        this.fetchUsers();
        this.submitCreateData.submitType = '휴가 신청서';
    },
    watch: {
        'formData.휴가종류'(newVal) {
            this.calculateDays(newVal);
        },
        // 'formData.휴가시작일'(newVal) {
        //     this.calculateDays(newVal);
        // },
        'formData.휴가종료일'(newVal) {
            this.calculateDays(newVal);
        }
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
                this.submitCreateData.submitUserDtos.sort((a, b) => a.position - b.position);

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
        },
        calculateDays() {
            // console.log("시작: " + this.formData.휴가시작일);
            const startDate = new Date(this.formData.휴가시작일);
            const endDate = new Date(this.formData.휴가종료일);
            let totalDays = 0;

            // 시작일과 종료일이 유효한 경우만 계산
            if (startDate && endDate && startDate <= endDate) {
                // 날짜 차이 계산
                const dayInMillis = 1000 * 60 * 60 * 24;
                const totalTime = (endDate - startDate) / dayInMillis;

                // 주말 제외하고 계산
                for (let i = 0; i <= totalTime; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    const dayOfWeek = currentDate.getDay();

                    // 0: 일요일, 6: 토요일
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        totalDays++;
                    }
                }
            }


            if (this.formData.휴가종류 === '반차') {
                this.formData.총휴가일수 = totalDays - 0.5;
            } else {
                this.formData.총휴가일수 = totalDays;
            }

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