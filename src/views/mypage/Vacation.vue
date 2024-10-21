<template>
    <div class="main-view">
        <v-container fluid>
            <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">
                <v-tab @click="navigateTab(0)">전사 근태 통계</v-tab>
                <v-tab @click="navigateTab(1)">프로필</v-tab>
                <v-tab @click="navigateTab(2)">평가리스트</v-tab>
                <v-tab @click="navigateTab(3)">오늘의 점심</v-tab>
                <v-tab @click="navigateTab(4)">인사평가</v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
                <!-- 전사 근태 통계 -->
                <v-tab-item v-if="activeTab === 0">
                    <v-row class="leave-info-table" style="margin-top: 10px;">
                        <v-col cols="12">
                            <v-row>
                                <v-card-text>
                                    <table class="custom-leave-table">
                                        <thead>
                                            <tr>
                                                <th>잔여 휴가</th>
                                                <th>사용 휴가</th>
                                                <th>병가</th>
                                                <th>결근</th>
                                                <th>근무 일수</th>
                                                <th>출근시간</th>
                                                <th>퇴근시간</th>
                                                <th>주차<br />누적근무</th>
                                                <th>주차<br />초과근무</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{{ userProfile?.annualLeave || 'N/A' }}일</td>
                                                <td>{{ usedLeave || 'N/A' }}일</td>
                                                <td>{{ sickLeave || 'N/A' }}일</td>
                                                <td>{{ absentDays || 'N/A' }}일</td>
                                                <td>{{ workDays || 'N/A' }}일</td>
                                                <td>{{ attendanceData.clockInTime || 'N/A' }}</td>
                                                <td>{{ attendanceData.clockOutTime || 'N/A' }}</td>
                                                <td>{{ attendanceData.weeklyWorkHours || 'N/A' }}</td>
                                                <td>{{ attendanceData.weeklyOvertimeHours || 'N/A' }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </v-card-text>
                            </v-row>
                        </v-col>
                    </v-row>


                    <!-- 타임라인 -->
                    <v-row class="timeline-container" style="margin-top: 10px;">
                        <attendance-record />
                    </v-row>
                </v-tab-item>


                <v-tab-item v-if="activeTab === 1">
                    <!-- 프로필 -->
                </v-tab-item>
                <v-tab-item v-if="activeTab === 2">
                    <!-- 평가리스트 -->
                </v-tab-item>
                <v-tab-item v-if="activeTab === 3">
                    <!-- 오늘의 점심 -->
                </v-tab-item>
                <v-tab-item v-if="activeTab === 4">
                    <!-- 인사평가 -->
                </v-tab-item>
            </v-tabs-items>
        </v-container>
    </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment'; // 날짜 계산에 사용할 라이브러리
import AttendanceRecord from './attendance.vue';

export default {
    name: "UserProfile",
    components: {
        AttendanceRecord // 타임라인 컴포넌트 등록
    },
    data() {
        return {
            activeTab: 0,
            userProfile: {},
            workDays: null, // 근무 일수
            usedLeave: 0, // 사용된 휴가
            sickLeave: 0, // 병가
            absentDays: 0, // 결근일수
            flexWork: '8-5', // 유연 근무제 정보
            attendanceData: {
                clockInTime: null,
                clockOutTime: null,
                weeklyWorkHours: 0,
                weeklyOvertimeHours: 0,
            },
            tabs: [
                { label: "프로필" },
                { label: "평가리스트" },
                { label: "오늘의 점심" },
                { label: "인사평가" },
                { label: "전사 근태 통계" }
            ],
            defaultProfileImage: 'https://via.placeholder.com/150'
        };
    },
    mounted() {
        this.fetchUserProfile();
        this.fetchTodayAttendance(); //
    },

    methods: {


        updateAttendanceData(data) {
            this.attendanceData = data;
        },
        async fetchUserProfile() {
            try {
                const token = localStorage.getItem('token');
                const userNum = localStorage.getItem('userNum');
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log('Received User Profile:', response.data);
                this.userProfile = response.data;

                // console.log('출근 시간 기록 :', this.userProfile.attendanceData?.clockInTime || '출근기록없');
                // console.log('퇴근 시간 기록 :', this.userProfile.attendanceData?.clockOutTime || '퇴근기록없');

                // 입사일로부터 현재까지의 근무일수 계산
                if (this.userProfile.joinDate) {
                    const joinDate = moment(this.userProfile.joinDate, "YYYY-MM-DD HH:mm:ss.SSSSSS");
                    const currentDate = moment();
                    this.workDays = currentDate.diff(joinDate, 'days'); // 근무 일수 계산
                    console.log('Joindate : ', joinDate);
                    console.log('Work Days : ', this.workDays);
                }

                // 여기서 추가적인 데이터를 설정할 수 있음 (병가, 결근 등)
                this.sickLeave = this.userProfile.sickLeave || 0;
                this.usedLeave = this.userProfile.usedLeave || 0;
                this.absentDays = this.userProfile.absentDays || 0;

                // this.attendanceData.clockInTime = this.userProfile.attendanceData?.clockInTime
                //     ? moment(this.userProfile.attendanceData.clockInTime).format('HH:mm:ss')
                //     : 'N/A';
                // this.attendanceData.clockOutTime = this.userProfile.attendanceData?.clockOutTime
                //     ? moment(this.userProfile.attendanceData.clockOutTime).format('HH:mm:ss')
                //     : 'N/A';
                // this.attendanceData.weeklyWorkHours = this.userProfile.attendanceData?.weeklyWorkHours || 'N/A';
                // this.attendanceData.weeklyOvertimeHours = this.userProfile.attendanceData?.weeklyOvertimeHours || 'N/A';


            } catch (error) {
                console.error('유저 정보 가져오기 실패:', error);
            }
        },
        async fetchTodayAttendance() {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/today`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = response.data.result; // API 응답의 result 부분을 사용

                console.log("Today attendance data:", data); // 로그로 데이터 확인

                // 출퇴근 시간 및 근무시간 바인딩
                this.attendanceData.clockInTime = data.inTime
                    ? moment(data.inTime).format('HH:mm:ss')
                    : 'N/A';
                this.attendanceData.clockOutTime = data.outTime
                    ? moment(data.outTime).format('HH:mm:ss')
                    : 'N/A';
                this.attendanceData.weeklyWorkHours = data.hoursWorked
                    ? data.hoursWorked.toFixed(1) + '(시간)' // 소숫점 .1 자리까지 설정함
                    : 'N/A';
                this.attendanceData.weeklyOvertimeHours = data.overtimeHours || 'N/A';

                const clockInTime = moment(data.inTime);
                const clockOutTime = data.outTime ? moment(data.outTime) : moment(); // 퇴근 시간이 없으면 현재 시간 사용

                // 09:00 ~ 18:00 근무 시간 이외의 시간 계산
                const standardStartTime = moment(clockInTime).set({ hour: 9, minute: 0, second: 0 });
                const standardEndTime = moment(clockInTime).set({ hour: 18, minute: 0, second: 0 });

                let overtimeHours = 0;
                if (clockInTime.isBefore(standardStartTime)) {
                    overtimeHours += standardStartTime.diff(clockInTime, 'hours', true); // 출근 시간이 09:00보다 이른 경우 초과 근무 계산
                }
                if (clockOutTime.isAfter(standardEndTime)) {
                    overtimeHours += clockOutTime.diff(standardEndTime, 'hours', true); // 퇴근 시간이 18:00보다 늦은 경우 초과 근무 계산
                }

                this.attendanceData.weeklyOvertimeHours = overtimeHours.toFixed(1) + '(시간)'; // 소수점 1자리로 표시

            } catch (error) {
                console.error('오늘의 출퇴근 기록을 가져오는 중 오류 발생:', error);
            }
        },


        navigateTab(index) {
            if (index == 0) {
                this.$router.push('/mypage/vacation');
            } else if (index === 1) {
                this.$router.push('/mypage/userProfile');
            } else if (index === 2) {
                this.$router.push('/mypage/evalutionFrame');
            } else if (index === 3) {
                this.$router.push('/mypage/spinWheel');
            } else if (index === 4) {
                this.$router.push('/mypage/evalutionList');
            } else {
                this.activeTab = index;
            }
        }
    }
};
</script>

<style scoped>
.main-view {
    padding: -50px;
}

/* 헤더 탭 여백 */
.header-tabs {
    margin-bottom: 30px;

}

.tab-item {
    font-weight: bold;
    font-size: 16px;
    color: #4CAF50;
}

.v-tabs--density-default {
    --v-tabs-height: 48px;
}

.v-tabs {
    border-bottom: 1px solid #e0e0e0;
}

.v-tab {
    font-weight: bold;
}


.v-simple-table {
    width: 100%;

}

thead th {
    background-color: rgba(122, 86, 86, 0.2);
    text-align: left;
    padding: 10px;
}

.custom-leave-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    text-align: center;
    background-color: #ffffff;
    border: 1px solid #f5f5f5;
}

.custom-leave-table td {
    padding: 15px 30px;
    border: 1px solid #f5f5f5;
    font-weight: 700;
}

.custom-leave-table th {
    background-color: rgba(122, 86, 86, 0.2);
    padding: 20px;
    border: 1px solid #f5f5f5;
    text-align: center;
    font-weight: 400;
}


tr>td {
    font-size: 18px;
    font-weight: 800;
    color: #444444;
}
</style>