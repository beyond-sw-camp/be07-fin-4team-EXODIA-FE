<template>
  <v-container fluid>
    <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">

      <v-tab @click="navigateTab(0)">프로필</v-tab>
      <v-tab @click="navigateTab(1)">평가리스트</v-tab>
      <v-tab @click="navigateTab(2)">오늘의 점심</v-tab>
      <v-tab @click="navigateTab(3)">인사평가</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <!-- 프로필 -->
      <v-tab-item v-if="activeTab === 0">
        <v-row no-gutters class="profile-content">
          <v-col cols="12" md="3">
            <v-card class="profile-card">
              <v-img 
                :src="userProfile?.profileImage || defaultProfileImage" 
                aspect-ratio="1" 
                class="profile-img"
              ></v-img>
              <v-card-title class="profile-name">{{ userProfile?.name || '이름' }}</v-card-title>
            </v-card>
          </v-col>

          <v-col cols="12" md="7" class="profile-info">
            <v-card class="info-card">
              <v-card-text>
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th style="width: 30%;">항목</th>
                      <th style="width: 70%;">세부 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>사번</td>
                      <td>{{ userProfile?.userNum || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>부서명</td>
                      <td>{{ userProfile?.departmentName || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>직책</td>
                      <td>{{ userProfile?.positionName || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>전화번호</td>
                      <td>{{ userProfile?.phone || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>입사일</td>
                      <td>{{ userProfile?.joinDate || 'N/A' }}</td>
                    </tr>
                  </tbody>
                </table>
              </v-card-text>
            </v-card>
          </v-col>

        </v-row>


        <v-row class="leave-info-table" justify="" style="margin-top: 10px;">
          <v-col cols="8" md="6">
            <v-card>
              <v-card-text>
                <table class="custom-leave-table">
                  <thead>
                    <tr>
                      <th>잔여 휴가</th>
                      <th>사용 휴가</th>
                      <th>병가</th>
                      <th>결근</th>
                      <th>유연 근무제</th>
                      <th>근무 일수</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ userProfile?.annualLeave || 'N/A' }}일</td>
                      <td>{{ usedLeave || 'N/A' }}일</td>
                      <td>{{ sickLeave || 'N/A' }}일</td>
                      <td>{{ absentDays || 'N/A' }}일</td>
                      <td>{{ flexWork || 'N/A' }}</td>
                      <td>{{ workDays || 'N/A' }}일</td>
                    </tr>
                  </tbody>
                </table>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="8" md="5">
            <v-card>
              <v-card-text>
                <table class="custom-attendance-table">
                  <thead>
                    <tr>
                      <th>출근시간</th>
                      <th>퇴근시간</th>
                      <th>주차누적근무</th>
                      <th>주차초과근무</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ attendanceData.clockInTime || 'N/A' }}</td>
                      <td>{{ attendanceData.clockOutTime || 'N/A' }}</td>
                      <td>{{ attendanceData.weeklyWorkHours || 'N/A' }}</td>
                      <td>{{ attendanceData.weeklyOvertimeHours || 'N/A' }}</td>
                    </tr>
                  </tbody>
                </table>
              </v-card-text>
            </v-card>
          </v-col>



        </v-row>

        <!-- 타임라인 -->
        <v-row class="timeline-container" style="margin-top: 10px;">
          <attendance-record />
        </v-row>
      </v-tab-item>

      
      <v-tab-item v-if="activeTab === 1">
        <!-- 평가리스트 -->
      </v-tab-item>      
      <v-tab-item v-if="activeTab === 2">
        <!-- 오늘의 점심 -->
      </v-tab-item>
      <v-tab-item v-if="activeTab === 3">
        <!-- 인사평가 -->
      </v-tab-item>

    </v-tabs-items>
  </v-container>
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
      activeTab: 0  ,
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
        { label: "인사평가"}
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

      console.log('출근 시간 기록 :', this.userProfile.attendanceData?.clockInTime || '출근기록없');
      console.log('퇴근 시간 기록 :', this.userProfile.attendanceData?.clockOutTime || '퇴근기록없');

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
        
        this.attendanceData.clockInTime = this.userProfile.attendanceData?.clockInTime
        ? moment(this.userProfile.attendanceData.clockInTime).format('HH:mm:ss')
        : 'N/A';
      this.attendanceData.clockOutTime = this.userProfile.attendanceData?.clockOutTime
        ? moment(this.userProfile.attendanceData.clockOutTime).format('HH:mm:ss')
        : 'N/A';
      this.attendanceData.weeklyWorkHours = this.userProfile.attendanceData?.weeklyWorkHours || 'N/A';
      this.attendanceData.weeklyOvertimeHours = this.userProfile.attendanceData?.weeklyOvertimeHours || 'N/A';
      

      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
// 출 퇴근 기록 예시(ver1)
async fetchTodayAttendance() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/today`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      // 출퇴근 시간 데이터 바인딩
      this.attendanceData.clockInTime = data.clockInTime || 'N/A';
      this.attendanceData.clockOutTime = data.clockOutTime || 'N/A';
      this.attendanceData.weeklyWorkHours = data.weeklyWorkHours || 'N/A';
      this.attendanceData.weeklyOvertimeHours = data.weeklyOvertimeHours || 'N/A';

    } catch (error) {
      console.error('오늘의 출퇴근 기록을 가져오는 중 오류 발생:', error);
    }
  },


    navigateTab(index) {
      if (index === 1) {
        this.$router.push('/mypage/evalutionFrame');
      } else if (index === 2) {
        this.$router.push('/mypage/spinWheel');
      } else if (index === 3) {
        this.$router.push('/mypage/evalutionList');
      } else {
        this.activeTab = index;
      }
    }
  }
};
</script>

<style scoped>
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

/* 프로필(이미지) 컨텐츠 */
.profile-content {
  margin-top: 30px;
}

.profile-card {
  text-align: center;
  padding: 20px;
  margin: 0;
}

.profile-img {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin: 0 auto;
}

.profile-name {
  font-size: 24px;
  font-weight: bold;
  margin-top: 20px;
}

.profile-info {
  margin-left: 30px;
}

.info-card {
  padding: 20px;
  
}

.v-simple-table {
  width: 100%;
  
}

thead th {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: left;
  padding: 10px;
  
}

tbody td {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

td:first-child {
  font-weight: bold;
  color: #666;
}

.leave-info-table {
  margin-top: 20px;
  /* background-color: #f5f5f5; */
  box-shadow: none;
}

.timeline-container {
  /* background-color: white; */
  /* padding: 20px; */
  /* border: solid 1px; */
}

.hours-row {
  margin-bottom: 10px;
}

.hour-label {
  width: calc(100% / 36);
  text-align: center;
  font-weight: bold;
  background-color: #ffffff;
  border: 1px solid #D8EACA;
  padding: 10px;
}

.day-label {
  display: flex;
  justify-content: center;
  align-items: center;
  /* background-color: #f0f0f0; */
  height: 40px;
  font-size: 18px;
  margin-bottom: 10px;
  border-radius: 30px;
}

.timeline-bar {
  width: calc(100% / 36);
  padding: 0;
  height: 50px;
}

.v-progress-linear {
  height: 30px;
}


.custom-table {
  width: 100%; /* v-col 크기와 동일하게 맞추기 */
  table-layout: fixed; /* 테이블 셀의 고정된 너비 설정 */
  border-collapse: collapse; /* 경계선 중복 제거 */
}

.custom-table th,
.custom-table td {
  
  padding: 10px; /* 셀 내 패딩 추가 */
}

.custom-table th {
  
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: left;
  border: 1px solid #e0e0e0;
}

.custom-table td:first-child {
  
  font-weight: bold;
  color: #666;
}

.custom-leave-table {
  width: 100%; /* v-col 크기와 동일하게 설정 */
  table-layout: fixed; /* 셀 너비 고정 */
  border-collapse: collapse; /* 테두리 중복 제거 */
  text-align: center; /* 텍스트 중앙 정렬 */
  background-color: #ffffff;
}

.custom-leave-table th,
.custom-leave-table td {
  padding: 10px; /* 셀 내 패딩 */
  
}

.custom-leave-table th {
  background-color: #f0f0f0; /* 헤더 배경색 */
  font-weight: bold;
  text-align: center;
}
.custom-attendance-table {
  width: 100%; /* v-col 크기와 동일하게 설정 */
  table-layout: fixed; /* 셀 너비 고정 */
  border-collapse: collapse; /* 테두리 중복 제거 */
  text-align: center; /* 텍스트 중앙 정렬 */
}

.custom-attendance-table th,
.custom-attendance-table td {
  padding: 10px; /* 셀 내 패딩 */
}

.custom-attendance-table th {
  background-color: #f0f0f0; /* 헤더 배경색 */
  font-weight: bold;
  text-align: center;
}
</style>