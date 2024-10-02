<template>
  <v-container fluid class="timeline-container">
    <!-- Month Selection -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedMonth"
          :items="months"
          label="월 선택"
          outlined
        ></v-select>
      </v-col>
    </v-row>

    <!-- Week Selection -->
    <v-tabs v-model="selectedWeek" background-color="grey lighten-5">
      <v-tab v-for="week in getWeeksInMonth(selectedMonth)" :key="week">
        {{ week }}주차
      </v-tab>
    </v-tabs>

    <!-- Timeline Header with Hours -->
    <v-row class="hours-row">
      <v-col cols="1">
        <div class="header-cell"></div>
      </v-col>
      <v-col cols="11" style="margin-top: 30px;">
        <v-row>
          <div v-for="hour in hours" :key="hour" class="hour-label">
            {{ hour }}
          </div>
        </v-row>
      </v-col>
    </v-row>

    <!-- Timeline for Each Day -->
    <v-row v-for="(day, index) in weekdays" :key="index" class="day-row">
      <v-col cols="1">
        <div class="day-label">{{ day }}</div>
      </v-col>
      <v-col cols="11">
        <v-row>
          <div v-for="hour in hours" :key="hour" class="timeline-bar">
            <v-progress-linear
              :value="getWorkHoursPercentage(day, hour)"
              height="30"
              :color="getTimeColor(day, hour)"
              class="timeline-progress"
            ></v-progress-linear>
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
      selectedMonth: new Date().getMonth() + 1, // Default to current month
      selectedWeek: 1, // Default to the first week
      months: Array.from({ length: 12 }, (_, i) => `${i + 1}월`), // 1월부터 12월까지 배열
      weekdays: ['월', '화', '수', '목', '금', '토', '일'], // 요일 설정
      hours: Array.from({ length: 24 }, (_, i) => `${i}`), // 0~23시까지 시간
      attendanceData: {}, // API에서 받은 데이터
      startDate: null, // 주차 시작 날짜
      endDate: null, // 주차 종료 날짜
    };
  },
  watch: {
    selectedMonth() {
      this.updateDateRange();
    },
    selectedWeek() {
      this.updateDateRange();
    },
  },
  mounted() {
    this.fetchUserInfo(); // 유저 정보 확인 후 데이터 불러오기
    this.updateDateRange();
  },
  methods: {
    // 주차 시작 날짜와 종료 날짜를 계산하는 함수
    updateDateRange() {
      const firstDayOfMonth = new Date(new Date().getFullYear(), this.selectedMonth - 1, 1);
      const selectedWeekNumber = this.selectedWeek;

      if (!selectedWeekNumber || selectedWeekNumber <= 0) {
        console.error("유효하지 않은 주차입니다.");
        return;
      }

      // 주차의 시작 날짜 계산 (월요일 기준, ISO-8601)
      const startOfSelectedWeek = this.getStartOfISOWeek(firstDayOfMonth, selectedWeekNumber);

      if (!isNaN(startOfSelectedWeek.getTime())) {
        this.startDate = startOfSelectedWeek.toISOString().split('T')[0]; // ISO 형식으로 변환
      } else {
        console.error("유효하지 않은 날짜입니다.");
        return;
      }

      // 주차의 마지막 날을 계산 (일요일)
      const endOfSelectedWeek = new Date(startOfSelectedWeek);
      endOfSelectedWeek.setDate(startOfSelectedWeek.getDate() + 6); // ISO 주 기준으로 일요일을 계산
      this.endDate = endOfSelectedWeek.toISOString().split('T')[0];

      this.fetchWeeklyDetails(); // 주차 및 달 변경 후 데이터 가져오기
    },

    async fetchUserInfo() {
      try {
        const userNum = localStorage.getItem('userNum');
        if (!userNum) {
          throw new Error('로그인 정보가 없습니다.');
        }

        await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        this.fetchWeeklyDetails();
      } catch (error) {
        console.error('유저 정보를 불러오는 중 오류 발생:', error);
        if (error.response?.status === 401) {
          alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
          this.$router.push('/login');
        }
      }
    },

    async fetchWeeklyDetails() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/weekly-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            startDate: this.startDate,
            endDate: this.endDate,
          },
        });

        const weeklyDetails = response.data.result || {};
        this.attendanceData = this.parseAttendanceData(weeklyDetails);
      } catch (error) {
        console.error('근무 기록을 불러오는 중 오류 발생:', error);
        if (error.response?.status === 401) {
          alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
          this.$router.push('/login');
        }
      }
    },

    // ISO-8601 기준으로 월의 주차 계산
    getWeeksInMonth(month) {
      const year = new Date().getFullYear();
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0); // 해당 달의 마지막 날

      const weeks = [];
      let startOfWeek = this.getStartOfISOWeek(firstDayOfMonth);

      while (startOfWeek <= lastDayOfMonth) {
        weeks.push(this.getISOWeekNumber(startOfWeek));
        startOfWeek.setDate(startOfWeek.getDate() + 7); // 다음 주로 이동
      }

      return Array.from(new Set(weeks)); // 중복된 주차를 제거
    },

    // ISO-8601 기준으로 주차의 시작(월요일)을 반환하는 함수
    getStartOfISOWeek(date, weekNumber = 1) {
      const startOfWeek = new Date(date);
      const dayOfWeek = startOfWeek.getDay() || 7; // ISO 기준: 일요일은 7로 설정
      startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1)); // 월요일 기준으로 설정

      if (weekNumber > 1) {
        startOfWeek.setDate(startOfWeek.getDate() + (weekNumber - 1) * 7); // 선택한 주차로 이동
      }

      return startOfWeek;
    },

    // ISO-8601 기준 주차 계산
    getISOWeekNumber(date) {
      const thursday = new Date(date.getTime());
      thursday.setDate(date.getDate() + (4 - (date.getDay() || 7))); // ISO 주차 기준 목요일로 계산

      const yearStart = new Date(thursday.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);

      return weekNumber;
    },

    parseAttendanceData(weeklyDetails) {
      const parsedData = {};

      Object.keys(weeklyDetails).forEach((day) => {
        const dayData = weeklyDetails[day];
        parsedData[day] = dayData.map((attendance) => ({
          inTime: new Date(attendance.inTime),
          outTime: new Date(attendance.outTime),
          hoursWorked: attendance.hoursWorked,
        }));
      });

      return parsedData;
    },

    getWorkHoursPercentage(day, hour) {
      const dayData = this.attendanceData[day];
      if (dayData) {
        const matchingEntry = dayData.find((entry) => {
          const startHour = entry.inTime.getHours();
          const endHour = entry.outTime.getHours();
          return hour >= startHour && hour < endHour;
        });

        if (matchingEntry) {
          return 100; // 해당 시간에 근무한 경우
        }
      }

      return 0;
    },

    getTimeColor(day, hour) {
      const dayData = this.attendanceData[day];
      if (dayData) {
        const matchingEntry = dayData.find((entry) => {
          const startHour = entry.inTime.getHours();
          const endHour = entry.outTime.getHours();
          return hour >= startHour && hour < endHour;
        });

        if (matchingEntry) {
          return matchingEntry.hoursWorked > 8 ? '#4CAF50' : '#D8EACA'; // 초과 근무일 경우 초록색
        }
      }
      return 'white';
    },
  },
};
</script>

<style scoped>
.timeline-container {
  background-color: white;
  padding: 20px;
  border: solid 1px;
}

.hours-row {
  margin-bottom: 10px;
}

.hour-label {
  width: calc(100% / 24);
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
  background-color: #f0f0f0;
  height: 50px;
  font-size: 18px;
  margin-bottom: 10px;
  border-radius: 30px;
}

.timeline-bar {
  width: calc(100% / 24);
  padding: 0;
  height: 50px;
}

.v-progress-linear {
  height: 30px;
}
</style>
