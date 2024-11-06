<template>
    <v-container class="container">
        <v-row class="mb-6 mt-12" style="padding-left:30px">
            <h1>휴가 신청서</h1>
        </v-row>
        <v-row style="padding:50px">
            <v-row justify="justify-space-around">
                <v-col cols="9">
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
                <v-col cols="3">
                    <v-card style="background-color: rgba(123, 86, 86, 0.3);">
                        <v-card-title>결재 라인
                            <v-icon class="icon" @click="toggleSubmitLineVisibility"> {{ isOpenSubmitLine ?
                                'mdi-chevron-up' :
                                'mdi-chevron-down' }}</v-icon>
                        </v-card-title>

                        <v-list v-if="isOpenSubmitLine" class="submitline-user"
                            style="background-color: rgba(123, 86, 86, 0.3);max-height: 300px; overflow-y: auto;">
                            <v-list-item v-for="user in users" :key="user.id" draggable="true"
                                @dragstart="onDragStart(user)" class="draggable-item">
                                <v-list-item-content style="font-weight:600;">
                                    {{ user.name }}
                                </v-list-item-content>
                                <v-list-item-content>
                                    | {{ user.positionName }}
                                    <span v-if="user.userNum === this.userNum">
                                        <v-chip>본인</v-chip>
                                    </span>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-card>

                    <!-- 팀장만 2차까지 존재 -->
                    <v-card v-if="this.positionId == 7" @dragover.prevent @drop="onDrop(2)" class="drop-zone">
                        <v-card-title>2차 결재자</v-card-title>
                        <v-card-text v-if="secondApprovers.length === 0">본부장 직급에서 선택하시오.</v-card-text>
                        <v-list class="drop-user">
                            <v-list-item v-if="secondApprovers.length != 0">
                                <v-avatar class="icon" size="36">
                                    <v-img :src="secondApprovers.profileImage || defaultProfileImage"
                                        aspect-ratio="1"></v-img>
                                </v-avatar>
                                <v-list-item-content style="margin-left:10px">
                                    {{ secondApprovers.name }}</v-list-item-content>
                                <v-list-item-content> | {{ secondApprovers.positionName }}</v-list-item-content>
                                <v-icon @click="removeUser(index, 2)" style="margin-left: auto;">mdi-close</v-icon>
                            </v-list-item>
                        </v-list>
                    </v-card>


                    <v-card @dragover.prevent @drop="onDrop(1)" class="drop-zone">
                        <v-card-title>1차 결재자</v-card-title>

                        <v-card-text v-if="firstApprovers.length === 0 && this.positionId >= 7">팀장 직급에서
                            선택하시오.</v-card-text>
                        <v-card-text v-if="firstApprovers.length === 0 && this.positionId === 7">부서장 직급에서
                            선택하시오.</v-card-text>
                        <v-card-text v-if="firstApprovers.length === 0 && this.positionId == 6">본부장 직급에서
                            선택하시오.</v-card-text>
                        <v-card-text v-if="firstApprovers.length === 0 && this.positionId <= 5">사장 직급에서
                            선택하시오.</v-card-text>
                        <v-list class="drop-user">
                            <v-list-item v-if="firstApprovers.length != 0">
                                <v-avatar class="icon" size="36">
                                    <v-img :src="firstApprovers.profileImage || defaultProfileImage"
                                        aspect-ratio="1"></v-img>
                                </v-avatar>
                                <v-list-item-content style="margin-left:10px">
                                    {{ firstApprovers.name }}</v-list-item-content>
                                <v-list-item-content> | {{ firstApprovers.positionName }}</v-list-item-content>
                                <v-icon @click="removeUser(index, 1)" style="margin-left: auto;">mdi-close</v-icon>
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

            firstApprovers: [],
            secondApprovers: [],
            thirdApprovers: [],
            isOpenSubmitLine: false,

            positions: [],
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
                const response = await axios.get(`/department/${this.departmentId}/parent/users`);
                this.users = response.data
                    .filter(u => Number(u.positionId) <= Number(this.positionId))
                    .sort((a, b) => Number(a.positionId) - Number(b.positionId));

                for (let i = 0; i < this.users.length; i++) {
                    let user = this.users[i];

                    if (this.positionId >= 8) {
                        // 팀장 이하
                        this.positions[0] = 7;
                    } else if (this.positionId == 7) {
                        // 팀장
                        this.positions[0] = 6;
                        this.positions[1] = 5;

                    } else if (this.positionId == 6) {
                        // 본부장
                        this.positions[0] = 5;
                    } else if (this.positionId <= 5) {
                        // 본부장 이사
                        this.positions[0] = 1;
                    }

                    if (user.positionId === this.positions[0] && this.firstApprovers.length == 0) {
                        this.firstApprovers = user;
                        this.submitCreateData.submitUserDtos.push({
                            userName: user.name,
                            position: user.positionId,
                        });
                    }
                    if (user.positionId === this.positions[1] && this.secondApprovers.length == 0) {
                        this.secondApprovers = user;
                        this.submitCreateData.submitUserDtos.push({
                            userName: user.name,
                            position: user.positionId,
                        });
                    }
                }
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
        onDrop(level) {
            if (this.draggedUser) {
                if (this.firstApprovers.length != 0 && this.secondApprovers.length != 0 && this.thirdApprovers.length != 0) {
                    alert('결재자 선택은 직급당 한명만 가능합니다.');
                }
                else {
                    if (level === 1) {
                        if (this.draggedUser.positionId != this.positions[1]) {
                            alert('지정된 직급에서 선택해주세요')
                        } else {
                            this.firstApprovers = [this.draggedUser][0];
                            this.submitCreateData.submitUserDtos.push({
                                userName: this.firstApprovers.name,
                                position: this.firstApprovers.positionId,
                            })

                        }
                    }
                    if (level === 2) {
                        if (this.draggedUser.positionId != this.positions[0]) {
                            alert('지정된 직급에서 선택해주세요')
                        } else {
                            this.secondApprovers = [this.draggedUser][0];
                            this.submitCreateData.submitUserDtos.push({
                                userName: this.secondApprovers.name,
                                position: this.secondApprovers.positionId,
                            })

                        }
                    }
                    this.draggedUser = null;
                }
            }
        },
        removeUser(index, level) {
            if (level === 1) this.firstApprovers = [];
            if (level === 2) this.secondApprovers = [];

            this.submitCreateData.submitUserDtos.splice(level - 1, 1);
        },
        async createSubmit() {
            try {
                if (this.submitCreateData.submitUserDtos.length == 0) {
                    alert('결재라인을 등록해주세요.');
                }

                this.submitCreateData.contents = this.submitCreateData.contents = JSON.stringify(this.formData);
                this.submitCreateData.submitUserDtos.sort((a, b) => b.position - a.position);

                await axios.post('/submit/create', this.submitCreateData, { headers: { Authorization: `Bearer ${this.token}` } });
                alert("결재 요청이 성공적으로 처리되었습니다.")
                this.$router.push("/submit/list/my")
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
        },
        calculateDays() {
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

        },
        toggleSubmitLineVisibility() {
            this.isOpenSubmitLine = !this.isOpenSubmitLine;
        }
    }
}

</script>
<style scoped>
.container {
    padding: 20px;
    border-radius: 12px;
}

.draggable-item {
    cursor: grab;
    margin: 5px;
    padding: 10px;
}

.drop-zone {
    margin: 20px 0;
    min-height: 80px;
    border: 2px solid rgba(122, 86, 86, 0.2);
    padding: 5px;
}

.submit-btn {
    display: flex;
    justify-content: center;
    align-content: center;
}

.drop-user {
    padding: 5px;
}

.submitline-user::-webkit-scrollbar {
    width: 6px;
}

.submitline-user::-webkit-scrollbar-thumb {
    background-color: #888888;
    border-radius: 10px;
}

.submitline-user::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 10px;
}
</style>