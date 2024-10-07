<template>
  <v-container fluid class="timeline-container">
    <!-- Week Selection -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedWeek"
          :items="weeks"
          label="주차 선택"
          outlined
        ></v-select>
      </v-col>
    </v-row>

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
    <v-row v-for="day in weekdays" :key="day" class="day-row">
      <v-col cols="1">
        <div class="day-label">{{ day }}</div>
      </v-col>
      <v-col cols="11">
        <v-row>
          <div v-for="hour in hours" :key="hour" class="timeline-bar">
            <!-- 근무 시간이 있을 때만 표시 -->
            <v-progress-linear
              v-if="isWorkHour(day, hour)"
              :value="100"
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
      selectedWeek: null, // 선택된 주차
      weeks: Array.from({ length: 52 }, (_, i) => `${i + 1}주차`), // 1주차부터 52주차까지 배열
      weekdays: ['월', '화', '수', '목', '금', '토', '일'], // 요일 설정
      hours: Array.from({ length: 24 }, (_, i) => `${i}`), // 0~23시까지 시간
      attendanceData: {}, // API에서 받은 데이터
    };
  },
  watch: {
    selectedWeek() {
      this.fetchWeeklyDetails(); // 주차가 변경될 때마다 데이터 불러오기
    },
  },
  mounted() {
    const today = new Date();
    const currentWeek = this.getISOWeekNumber(today); // 현재 주차 계산
    this.selectedWeek = `${currentWeek}주차`; // 선택된 주차 기본 설정
    this.fetchWeeklyDetails(); // 기본 주차 데이터 로드
  },
  methods: {
    getISOWeekNumber(date) {
    const thursday = new Date(date.getTime());
    thursday.setDate(date.getDate() + (4 - (date.getDay() || 7)));
    
    const yearStart = new Date(thursday.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
    
    return weekNumber;
  },
    // 선택된 주차의 데이터를 API에서 가져오는 함수
    async fetchWeeklyDetails() {
      if (!this.selectedWeek) return;

      try {
        const weekNumber = this.selectedWeek.replace('주차', ''); // '1주차' 같은 값을 숫자로 변환
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/attendance/weekly`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            year: new Date().getFullYear(),
          },
        });

        const weekData = response.data.find(week => week.weekNumber == weekNumber);
        if (weekData) {
          this.attendanceData = weekData.days;
        } else {
          this.attendanceData = {};
        }
      } catch (error) {
        console.error('주차별 데이터를 불러오는 중 오류 발생:', error);
      }
    },

    // 근무 시간이 있는지 확인하는 함수
    isWorkHour(day, hour) {
      const dayData = this.attendanceData[day];
      if (dayData) {
        const startHour = new Date(dayData.inTime).getHours();
        const endHour = new Date(dayData.outTime).getHours();
        return hour >= startHour && hour < endHour;
      }
      return false; // 근무 시간이 없는 경우
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
      return hoursWorked > 8 ? '#4CAF50' : '#D8EACA'; // 초과 근무는 초록색, 일반 근무는 연한 초록색
    }
  }
  return 'white'; // 근무 시간이 아닌 경우
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
