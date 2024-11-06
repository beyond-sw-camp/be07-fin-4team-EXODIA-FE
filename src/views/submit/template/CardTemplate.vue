<template>
    <v-container class="container">
        <v-row class="mb-6 mt-12" style="padding-left:30px">
            <h1>법인 카드 사용 신청서</h1>
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
                            <v-list-subheader>신청일</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <VueDatePicker locale="ko" v-model="formData.신청일" :type="'date'" format="yyyy-MM-dd"
                                :min-date="new Date(new Date().setDate(new Date().getDate() + 1))"
                                :enable-time-picker="false" @select="onDateSelect"></VueDatePicker>
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

                <v-col cols="3" class="create-submit">
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

                    <!-- 부사장까지 차까지 존재 -->
                    <v-card v-if="this.positionId >= 7" @dragover.prevent @drop="onDrop(3)" class="drop-zone">
                        <v-card-title>3차 결재자</v-card-title>
                        <v-card-text v-if="thirdApprovers.length === 0">본부장 직급에서 선택하시오.</v-card-text>
                        <v-list class="drop-user">
                            <v-list-item v-if="thirdApprovers.length != 0">
                                <v-avatar class="icon" size="36">
                                    <v-img :src="thirdApprovers.profileImage || defaultProfileImage"
                                        aspect-ratio="1"></v-img>
                                </v-avatar>
                                <v-list-item-content style="margin-left:10px">
                                    {{ thirdApprovers.name }}</v-list-item-content>
                                <v-list-item-content> | {{ thirdApprovers.positionName }}</v-list-item-content>
                                <v-icon @click="removeUser(index, 3)" style="margin-left: auto;">mdi-close</v-icon>
                            </v-list-item>
                        </v-list>
                    </v-card>

                    <!-- 부사장까지 차까지 존재 -->
                    <v-card v-if="this.positionId >= 6" @dragover.prevent @drop="onDrop(2)" class="drop-zone">
                        <v-card-title>2차 결재자</v-card-title>
                        <v-card-text v-if="secondApprovers.length === 0 && this.positionId >= 7">부서장 직급에서
                            선택하시오.</v-card-text>
                        <v-card-text v-if="secondApprovers.length === 0 && this.positionId == 6">사장 직급에서
                            선택하시오.</v-card-text>
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
        this.submitCreateData.submitType = '법인 카드 사용 신청서';
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


                    if (this.positionId >= 7) {
                        // 팀장 이하
                        this.positions[0] = 7;
                        this.positions[1] = 6;
                        this.positions[2] = 5;
                    } else if (this.positionId == 6) {
                        // 팀장
                        this.positions[0] = 5;
                        this.positions[1] = 1;

                    } else if (this.positionId <= 5) {
                        // 본부장
                        this.positions[0] = 1;
                    }

                    if (user.positionId === this.positions[0] && this.firstApprovers.length == 0) {
                        this.firstApprovers = user;

                        this.submitCreateData.submitUserDtos.push({
                            userName: user.name,
                            position: user.positionId,
                        });
                    } else if (user.positionId === this.positions[1] && this.secondApprovers.length == 0) {
                        this.secondApprovers = user;

                        this.submitCreateData.submitUserDtos.push({
                            userName: user.name,
                            position: user.positionId,
                        });
                    } else if (user.positionId === this.positions[2] && this.thirdApprovers.length == 0) {
                        this.thirdApprovers = user;

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
        onDrop(level) {
            if (this.draggedUser) {
                if (this.firstApprovers.length != 0 && this.secondApprovers.length != 0 && this.thirdApprovers.length != 0) {
                    alert('결재자 선택은 직급당 한명만 가능합니다.');
                }
                else {
                    if (level === 1) {
                        if (this.draggedUser.positionId != this.positions[2]) {
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
                        if (this.draggedUser.positionId != this.positions[1]) {
                            alert('지정된 직급에서 선택해주세요')
                        } else {
                            this.secondApprovers = [this.draggedUser][0];
                            this.submitCreateData.submitUserDtos.push({
                                userName: this.secondApprovers.name,
                                position: this.secondApprovers.positionId,
                            })
                        }
                    }
                    if (level === 3) {
                        if (this.draggedUser.positionId != this.positions[0]) {
                            alert('지정된 직급에서 선택해주세요')
                        } else {
                            this.thirdApprovers = [this.draggedUser][0];
                            this.submitCreateData.submitUserDtos.push({
                                userName: this.thirdApprovers.name,
                                position: this.thirdApprovers.positionId,
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
            if (level === 3) this.thirdApprovers = [];

            this.submitCreateData.submitUserDtos.splice(level - 1, 1);
        },
        async createSubmit() {
            try {
                if (this.submitCreateData.submitUserDtos.length == 0) {
                    alert('결재라인을 등록해주세요.');
                }

                this.submitCreateData.contents = JSON.stringify(this.formData);
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
        toggleSubmitLineVisibility() {
            this.isOpenSubmitLine = !this.isOpenSubmitLine;
        }
    },
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