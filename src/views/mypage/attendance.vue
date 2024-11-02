<template>
  <v-container fluid class="timeline-container">
    <!-- Week Selection -->
    <v-row justify="start" class="ml-10">
      <v-col cols="4">
        <v-select density="compact" v-model="selectedWeek" :items="weeks" label="주차 선택" item-title="text"
          item-value="weekNumber" outlined style="margin-left: 30px;">
        </v-select>
      </v-col>

      <!-- 출근 버튼 -->
      <v-col cols="2" align-center>
        <v-btn v-list @click="workIn" :disabled="isWorkIn" class="mr-2">
          출근
        </v-btn>

        <!-- 퇴근 버튼 -->
        <v-btn v-create @click="workOut">
          퇴근
        </v-btn>
        <v-alert v-if="message" :type="alertType" dismissible>{{ message }}</v-alert>
      </v-col>

    </v-row>

    <!-- 타임라인 헤더 -->
    <v-row class="hours-row">
      <v-col cols="1">
        <div class="header-cell"></div>
      </v-col>
      <v-col cols="11" style="margin-top: 10px;">
        <v-row>
          <div v-for="hour in hours" :key="hour" class="hour-label">
            {{ hour }}
          </div>
        </v-row>
      </v-col>
    </v-row>

    <!-- Timeline for Each Day -->
    <v-row v-for="day in weekdays" :key="day" class="day-row">
      <v-col cols="1">
        <div class="day-label">{{ day }}</div>
      </v-col>
      <v-col cols="11">
        <v-row>
          <div v-for="hour in hours" :key="hour" class="timeline-bar">
            <!-- 근무 시간이 있을 때만 표시 -->
            <v-progress-linear v-if="isWorkHour(day, hour)" :value="100" height="40" :color="getTimeColor(day, hour)"
              class="timeline-progress"></v-progress-linear>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AttendanceRecord',
  data() {
    return {
      selectedWeek: null, // 선택된 주차
      // weeks: Array.from({ length: 52 }, (_, i) => `${i + 1}주차`), // 1주차부터 52주차까지 배열
      weeks: [],
      weekdays: ['월', '화', '수', '목', '금', '토', '일'], // 요일 설정
      hours: Array.from({ length: 24 }, (_, i) => `${i}`), // 0~23시까지 시간
      attendanceData: {}, // API에서 받은 데이터

      clockInTime: null, // 오늘 출근 시간
      clockOutTime: null, // 오늘 퇴근 시간
      weeklyWorkHours: 0, // 금주차 누적 근무 시간
      weeklyOvertimeHours: 0, // 금주차 초과 근무 시간

      /* 출퇴근 버튼 관련 */
      isWorkIn: false,  // 출근 여부
      isWorkOut: false, // 퇴근 여부
      message: "",      // 알림 메시지
      alertType: "info" // 알림 메시지 유형
    };
  },
  watch: {
    selectedWeek(newVal) {
      console.log('selectedWeek 변경됨: ', newVal);
      this.fetchWeeklyDetails(); // 주차가 변경될 때마다 데이터 불러오기
    },
  },
  mounted() {
    const today = new Date();
    const currentWeek = this.getISOWeekNumber(today); // 현재 주차 계산

    // this.selectedWeek = `${currentWeek}주차`; 
    this.selectedWeek = currentWeek;
    this.emitAttendanceData(); // 데이터 전송
    this.fetchWeeklyDetails();
    this.fetchWeeklyAttendance();
    this.initializeCurrentWeek();
  },
  methods: {
    async initializeCurrentWeek() {
      const today = new Date();
      const currentWeek = this.getISOWeekNumber(today);

      await this.fetchWeeklyAttendance();
      this.selectedWeek = this.weeks.find(week => week.weekNumber === currentWeek);
      this.fetchWeeklyDetails();
    },

    async fetchWeeklyAttendance() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/weekly`, {
          params: {
            year: 2024, // 원하는 연도 설정
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // 받은 데이터를 가공하여 weeks 배열에 넣기
        this.weeks = response.data.map((week) => ({
          weekNumber: week.weekNumber,   // value는 weekNumber 그대로
          text: `${week.startOfWeek} ~ ${week.endOfWeek}`  // 표시할 텍스트는 startOfWeek ~ endOfWeek
        }));

        // 기본으로 첫 번째 주차 선택
        if (!this.selectedWeek) {
          this.selectedWeek = this.weeks[0].weekNumber;
          await this.fetchWeeklyDetails(); // 주차에 맞는 데이터 로드
        }
      } catch (error) {
        // console.error('주차 정보를 불러오는 중 오류 발생:', error);
      }
    },

    // 출근 API 호출
    async workIn() {
      try {
        const now = new Date();
        const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const workInTime = `${kstDate.getFullYear()}-${String(kstDate.getMonth() + 1).padStart(2, '0')}-${String(kstDate.getDate()).padStart(2, '0')}T${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}:00`;

        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/attendance/work-in`, { workInTime }, {
          headers: this.getAuthHeaders()
        });
        this.message = response.data.message;
        this.alertType = "success";
        this.isWorkIn = true;
        location.reload();
      } catch (error) {
        this.message = "출근 기록 중 오류 발생";
        this.alertType = "error";
      }
    },

    // 퇴근 API 호출
    async workOut() {
      try {
        const now = new Date();
        const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const workOutTime = `${kstDate.getFullYear()}-${String(kstDate.getMonth() + 1).padStart(2, '0')}-${String(kstDate.getDate()).padStart(2, '0')}T${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}:00`;

        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/attendance/work-out`, { workOutTime }, {
          headers: this.getAuthHeaders()
        });
        this.message = response.data.message;
        this.alertType = "success";
        this.isWorkOut = true;
        location.reload();
      } catch (error) {
        this.message = "퇴근 기록 중 오류 발생";
        this.alertType = "error";
      }
    },

    // JWT 인증 헤더 설정
    getAuthHeaders() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("토큰이 없습니다. 로그인이 필요합니다.");
        return {};
      }
      return {
        Authorization: `Bearer ${token}`,
      };
    },

    created() {
      // 페이지 로딩 시 초기화 작업을 할 수 있음
    },

    emitAttendanceData() {
      this.$emit('update-attendance', {
        clockInTime: this.clockInTime,
        clockOutTime: this.clockOutTime,
        weeklyWorkHours: this.weeklyWorkHours,
        weeklyOvertimeHours: this.weeklyOvertimeHours,
      });
    },




    getISOWeekNumber(date) {
      const thursday = new Date(date.getTime());
      thursday.setDate(date.getDate() + (4 - (date.getDay() || 7)));

      const yearStart = new Date(thursday.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);

      return weekNumber;
    },
    // 선택된 주차의 데이터를 API에서 가져오는 함수
    async fetchWeeklyDetails() {
      // selectedWeek가 없을 때 오늘 기준으로 주차를 설정하고 데이터를 불러옴
      if (!this.selectedWeek) {
        const today = new Date();
        this.selectedWeek = this.getISOWeekNumber(today); // 현재 주차로 설정
        // console.log('selectedWeek가 없어 현재 주차를 설정: ', this.selectedWeek);
      }

      try {
        const weekNumber = this.selectedWeek; // 숫자로 전송
        // console.log('Fetching data for week: ', weekNumber);

        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/weekly`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            year: new Date().getFullYear(),
            weekNumber: weekNumber, // 숫자 주차 전송
          },
        });

        const weekData = response.data.find(week => week.weekNumber === weekNumber);
        if (weekData) {
          this.attendanceData = weekData.days;
          // console.log('attendanceData: ', this.attendanceData);
        } else {
          console.error('해당 주차에 대한 데이터가 없습니다.');
          this.attendanceData = {};
        }
        this.emitAttendanceData();
      } catch (error) {
        console.error('주차별 데이터를 불러오는 중 오류 발생:', error);
      }
    },


    async fetchAttendanceData() {
      try {
        const token = localStorage.getItem('token');
        const userNum = localStorage.getItem('userNum');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/today`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            userNum: userNum
          }
        });

        const attendanceData = response.data;
        // Log the entire response to check the structure
        // console.log('Fetched today\'s attendance data:', attendanceData);

        // Log today's clock-in and clock-out times
        if (attendanceData.todayClockInTime) {
          // console.log('Today\'s Clock-in Time:', attendanceData.todayClockInTime);
        } else {
          console.log('No clock-in record found for today');
        }

        if (attendanceData.todayClockOutTime) {
          // console.log('Today\'s Clock-out Time:', attendanceData.todayClockOutTime);
        } else {
          console.log('No clock-out record found for today');
        }
        this.attendanceData.clockInTime = attendanceData.todayClockInTime || 'N/A';
        this.attendanceData.clockOutTime = attendanceData.todayClockOutTime || 'N/A';

      } catch (error) {
        console.error("Error fetching today's clock-in/out data:", error);
      }
    },





    // 근무 시간이 있는지 확인하는 함수
    isWorkHour(day, hour) {
      const dayData = this.attendanceData[day];
      // console.log(day, dayData); // dayData 확인용 로그
      if (!dayData || !dayData.inTime || !dayData.outTime) {
        return false;
      }

      const startHour = new Date(dayData.inTime).getHours();
      const endHour = new Date(dayData.outTime).getHours();
      return hour >= startHour && hour < endHour;
    },

    // 시간대별 색상 설정 메서드
    getTimeColor(day, hour) {
      const dayData = this.attendanceData[day];
      if (dayData) {
        const inTime = new Date(dayData.inTime).getHours();
        const outTime = new Date(dayData.outTime).getHours();

        // hour가 근무 시간 범위 내에 있는 경우에만 색상을 결정
        if (hour >= inTime && hour < outTime) {
          const hoursWorked = dayData.hoursWorked;
          return hoursWorked > 8 ? 'brown' : 'brown';
        }
      }
      return 'white'; // 근무 시간이 아닌 경우
    },


  }
};
</script>

<style scoped>
.timeline-container {
  margin-left: -30px;

  /* background-color: white; */
  /* padding: 20px; */
  /* border: solid 1px; */
}

.hours-row {}

.hour-label {
  width: calc(100% / 25);
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  background-color: rgba(122, 86, 86, 0.2);
  border: 0.5px solid #B9B9B9;
  padding: 10px;
  margin-bottom: 0;
}

.day-label {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  font-size: 18px;
  margin-top: -20px;
  border-radius: 30px;
  margin-bottom: -15px;
}

.timeline-bar {
  margin-top: 0;
  width: calc(100% / 25);
  padding: 0;
  height: 40px;
  border-width: 0px 0.5px 0.5px 0.5px;
  border-style: solid;
  border-color: #B9B9B9;
}

.v-progress-linear {
  height: 30px;
}
</style>
