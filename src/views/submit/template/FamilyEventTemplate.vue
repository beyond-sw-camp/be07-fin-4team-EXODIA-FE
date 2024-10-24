<template>
    <v-container class="container">
        <v-row class="mb-6 mt-12" style="padding-left:30px">
            <h1>경조사 신청서</h1>
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

                    <!-- 경조사 종류 선택 -->
                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>경조 종류</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <v-select label="경조사 종류" v-model="formData.mainEventType" :items="mainEventOptions"
                                outlined></v-select>
                        </v-col>
                    </v-row>

                    <!-- 가족 관계 선택 (동적으로 변경) -->
                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>가족 관계</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <v-select label="가족 관계" v-model="formData.familyRelation"
                                :items="filteredFamilyRelationOptions" outlined></v-select>
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

                    <!-- 휴가 일수 -->
                    <v-row>
                        <v-col cols="3">
                            <v-list-subheader>휴가일수</v-list-subheader>
                        </v-col>
                        <v-col cols="9">
                            <v-text-field label="휴가 일수" v-model="formData.휴가일수" disabled></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- 게시판 등록 여부 -->
                    <!-- 게시판 등록 여부 -->
                    <v-row v-if="showUploadCheckbox">
                        <v-checkbox v-model="formData.uploadBoard" label="게시판에 등록하시겠습니까?"></v-checkbox>
                    </v-row>
                </v-col>

                <!-- 결재 라인 -->
                <v-col cols="4">
                    <v-card style="background-color: rgba(123, 86, 86, 0.3);">
                        <v-card-title>결재 라인</v-card-title>
                        <v-list style="background-color: rgba(123, 86, 86, 0.3);">
                            <v-list-item v-for="user in users" :key="user.id" draggable="true"
                                @dragstart="onDragStart(user)" class="draggable-item">
                                <v-list-item-content>{{ user.name }}</v-list-item-content>
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

            mainEventOptions: ['결혼', '출산', '부고'],
            familyRelationOptions: {
                '결혼': ['본인', '자녀', '형제자매'],
                '출산': ['배우자', '입양'],
                '부고': ['부모', '배우자', '조부모', '자녀', '형제자매'],
            },

            formData: {
                mainEventType: '',
                familyRelation: '',
                휴가일수: '',
                신청일: '',
                uploadBoard: false,
            },
            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitCreateData: {
                submitType: '경조사 신청서',
                contents: '',
                uploadBoard: false,
                submitUserDtos: [],
            },
        }
    },
    computed: {
        filteredFamilyRelationOptions() {
            return this.familyRelationOptions[this.formData.mainEventType] || [];
        },
        showUploadCheckbox() {
            if (this.formData.mainEventType === '출산') {
                return false;
            }
            return this.formData.familyRelation === '본인' || this.formData.mainEventType !== '결혼';
        }
    },
    mounted() {
        this.fetchWriter();
        this.fetchDepartment();
        this.fetchUsers();
    },
    watch: {
        'formData.mainEventType': function (newValue) {
            this.formData.familyRelation = '';  // 가족 관계 초기화
            this.formData.uploadBoard = false;
            this.formData.휴가일수 = this.getLeaveDays(newValue, this.formData.familyRelation);
        },
        'formData.familyRelation': function (newValue) {
            this.formData.uploadBoard = false;
            this.formData.휴가일수 = this.getLeaveDays(this.formData.mainEventType, newValue);
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
                this.submitCreateData.submitUserDtos.slice().sort((a, b) => b.PositionId - a.PositionId);
                this.submitCreateData.submitUserDtos.sort((a, b) => a.position - b.position);

                this.submitCreateData.contents = `{"경조종류": "${this.formData.mainEventType} ${this.formData.familyRelation}"}`;
                this.submitCreateData.uploadBoard = this.formData.uploadBoard;

                await axios.post('/submit/create', this.submitCreateData, {
                    headers: { Authorization: `Bearer ${this.token}` }
                });

                alert("결재 요청이 성공적으로 처리되었습니다.");
                this.$router.push("/submit/list/my")
            } catch (e) {
                console.error('결재 요청 실패:', e);
            }
        },
        getLeaveDays(eventType, familyRelation) {
            const leaveDays = {
                '결혼': { '본인': '6일', '자녀': '2일', '형제자매': '2일' },
                '출산': { '배우자': '10일', '입양': '20일' },
                '부고': { '부모': '6일', '배우자': '6일', '조부모': '5일', '자녀': '5일', '형제자매': '1일' },
            };
            return leaveDays[eventType]?.[familyRelation] || '';
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
