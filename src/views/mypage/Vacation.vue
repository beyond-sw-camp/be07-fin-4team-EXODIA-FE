<template>
  <MypageTemplate>
    <template #attendance>
      <v-row style="margin-top: 10px;">
        <v-col cols="12">
          <v-row>
            <v-card-text>
              <table class="custom-leave-table">
                <thead>
                  <tr>
                    <th>잔여 휴가</th>
                    <th>병가</th>
                    <th>결근</th>
                    <!-- <th>근무 일수</th> -->
                    <th>출근시간</th>
                    <th>퇴근시간</th>
                    <th>주차<br />누적근무</th>
                    <th>주차<br />초과근무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ userProfile?.annualLeave || ' ' }}일</td>
                    <td>{{ this.userProfile.sickDay }}일</td>
                    <td>{{ this.userProfile.absentDay }}일</td>
                    <!-- <td>{{ workDays || ' ' }}일</td> -->
                    <td>{{ this.attendanceData.clockInTime || ' ' }}</td>
                    <td>{{ this.attendanceData.clockOutTime || ' ' }}</td>
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
    </template>
  </MypageTemplate>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import AttendanceRecord from './attendance.vue';
import MypageTemplate from './MypageTemplate.vue'

export default {
  name: "VacationPage",
  components: {
    AttendanceRecord,
    MypageTemplate

  },
  data() {
    return {
      userProfile: {},
      workDays: null,
      attendanceData: {
        clockInTime: null,
        clockOutTime: null,
        weeklyWorkHours: 0,
        weeklyOvertimeHours: 0,
      },
      defaultProfileImage: 'https://via.placeholder.com/150',
    };
  },
  mounted() {
    this.fetchUserProfile();
    this.fetchTodayAttendance();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('token');
        const userNum = localStorage.getItem('userNum');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.userProfile = response.data;

        if (this.userProfile.joinDate) {
          const joinDate = moment(this.userProfile.joinDate, "YYYY-MM-DD HH:mm:ss.SSSSSS");
          const currentDate = moment();
          this.workDays = currentDate.diff(joinDate, 'days'); // 근무 일수 계산
        }
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

        const data = response.data.result;
        this.attendanceData.clockInTime = data.inTime ? moment(data.inTime).format('HH:mm:ss') : ' ';
        this.attendanceData.clockOutTime = data.outTime ? moment(data.outTime).format('HH:mm:ss') : ' ';
        this.attendanceData.weeklyWorkHours = data.hoursWorked ? data.hoursWorked.toFixed(1) + '(시간)' : ' ';
        this.attendanceData.weeklyOvertimeHours = data.overtimeHours || ' ';
      } catch (error) {
        console.error('오늘의 출퇴근 기록을 가져오는 중 오류 발생:', error);
      }
    }
  }
};
</script>

<style scoped>
.custom-leave-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #f5f5f5;
}

.custom-leave-table th {
  padding: 15px 30px;
  border: 1px solid #f5f5f5;
  font-weight: 500;
}

.custom-leave-table th {
  background-color: rgba(122, 86, 86, 0.2);
  text-align: center;
}

.custom-leave-table td {
  font-size: 18px;
  font-weight: 800;
  color: #444444;
  padding: 25px 30px;
  border: 1px solid #f5f5f5;
  font-weight: 700;
}
</style>