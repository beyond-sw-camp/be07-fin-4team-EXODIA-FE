<template>
  <v-container>
    <h1>일정 목록</h1>

    <!-- 일정 목록 -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-row class="mb-3">
          <v-col cols="4"><strong>일정명</strong></v-col>
          <v-col cols="6"><strong>기간</strong></v-col>
        </v-row>

        <v-row v-for="(event, index) in eventList" :key="event.id" class="event-row">
          <!-- 이벤트 정보 -->
          <v-col cols="4">
            <h3 class="event-type">{{ event.eventType }}</h3>
          </v-col>
          <v-col cols="4">
            <p class="event-date">{{ event.startDate }} ~ {{ event.endDate }}</p>
          </v-col>

          <!-- 히스토리 보기 버튼 -->
          <v-col cols="2">
            <v-btn text @click="toggleHistory(index)">
              <v-icon>{{ event.showHistory ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              히스토리 보기
            </v-btn>
          </v-col>

          <!-- 히스토리 토글 -->
          <v-col cols="4" v-if="event.showHistory" transition="slide-y-transition">
            <v-card v-for="history in eventHistories" :key="history.id" class="pa-3 mb-3 history-card">
              <v-card-title>
                {{ history.startDate }} - {{ history.endDate }} 변경됨
              </v-card-title>
              <v-card-subtitle>
                변경 날짜: {{ history.eventRange }} | 변경자: {{ history.userNum }}
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <h1 class="text-center" style="margin-top:5%">일정 생성</h1>
    </v-row>

    <!-- 일정 생성 화면 -->
    <v-row class="mt-5">
      <v-col cols="12" md="10" offset-md="1">
        <v-card class="pa-5">
          <!-- 이벤트 타입 선택 -->
          <v-select
            v-model="newEventType"
            :items="eventTypes"
            label="이벤트 타입 선택"
            outlined
            dense
          ></v-select>

          <!-- 시작일과 종료일 선택 -->
          <v-row class="mt-3" justify="space-between">
            <v-col cols="12" md="5">
              <v-date-picker
                v-model="newStartDate"
                :max="newEndDate"
                label="시작일 선택"
                full-width
                color="brown"
                :style="{ width: '100%', height: '350px' }"
                :input-placeholder="'시작일'"
              ></v-date-picker>
            </v-col>

            <v-col cols="12" md="5">
              <v-date-picker
                v-model="newEndDate"
                :min="newStartDate"
                label="종료일 선택"
                full-width
                color="brown"
                :style="{ width: '100%', height: '350px' }"
                :input-placeholder="'종료일'"
              ></v-date-picker>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- 생성 버튼 -->
      <v-col class="text-right mt-4">
        <v-btn color="primary" @click="createEvent" large :style="{ width: '200px', right: '30px', bottom: '10%' }">
          이벤트 생성
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      eventTypes: ['salary', 'evaluation'], // 이벤트 타입 목록
      eventList: [], // 전체 이벤트 목록
      newEventType: '', // 새로운 이벤트 타입 선택
      newStartDate: null, // 시작일 선택
      newEndDate: null, // 종료일 선택
      eventHistories: [], // 이벤트 히스토리 목록
    };
  },
  methods: {
    async createEvent() {
      const userNum = localStorage.getItem('userNum');
      if (!userNum) {
        alert('로그인 정보가 없습니다.');
        return;
      }

      const startDate = this.newStartDate;
      const endDate = this.newEndDate || this.newStartDate;

      try {
        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        await axios.post('/eventDate/setDate', {
          eventType: this.newEventType,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          userNum: userNum,
        });
        alert('이벤트가 성공적으로 생성되었습니다.');
        this.fetchEventList(); // 이벤트 목록 갱신
      } catch (error) {
        console.error('이벤트 생성 중 오류 발생:', error);
      }
    },

    async fetchEventList() {
      try {
        const response = await axios.get('/eventDate/all');
        this.eventList = response.data;
      } catch (error) {
        console.error('전체 이벤트 목록을 불러오는 중 오류 발생:', error);
      }
    },

    async fetchEventHistory(eventId) {
      try {
        const response = await axios.get(`/eventDate/getHistory/${eventId}`);
        this.eventHistories = response.data;
      } catch (error) {
        console.error('이벤트 히스토리 가져오기 중 오류:', error);
      }
    },

    toggleHistory(index) {
      this.eventList[index].showHistory = !this.eventList[index].showHistory;
      this.fetchEventHistory(this.eventList[index].id);
    },

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    },
  },
  mounted() {
    this.fetchEventList();
  },
};
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}

.event-row {
  border-bottom: 1px solid #ddd;
  padding: 10px;
  transition: background-color 0.3s;
}

.event-row:hover {
  background-color: #f9f9f9;
}

.event-type {
  font-size: 20px;
  font-weight: bold;
}

.event-date {
  font-size: 16px;
  color: #666;
}

.v-btn {
  font-size: 16px;
}

.history-card {
  background-color: #e9f7fe;
  border-radius: 10px;
  padding: 15px;
}

.v-card-title {
  font-size: 18px;
  font-weight: bold;
}

.v-card-subtitle {
  font-size: 16px;
  color: #666;
}

.v-card {
  background-color: #f9f9f9;
}
</style>
