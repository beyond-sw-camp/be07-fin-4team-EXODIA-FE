<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-center">일정 관리</h1>
      </v-col>
    </v-row>

    <!-- 전체 일정 목록 -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="eventList"
          class="elevation-1"
          :items-per-page="5"
          dense
          @click:row="selectEvent"
        >
        <template v-slot:[`item.actions`]="{ item }">
            <v-btn color="primary" @click="selectEvent(item)" small>수정</v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 이벤트 수정 화면 -->
    <v-row class="mt-5">
      <v-col cols="12" class="text-center">
        <h2>{{ selectedEventType ? selectedEventType + ' 일정 수정' : '새로운 일정 생성' }}</h2>
      </v-col>

      <!-- 시작일과 종료일 선택 -->
      <v-col cols="12" md="8" offset-md="2">
        <v-card class="pa-3">
          <v-select
            v-model="newEventType"
            :items="eventTypes"
            label="이벤트 타입 선택"
            outlined
          ></v-select>

          <v-row>
            <v-col cols="12" md="6">
              <v-date-picker
                v-model="newStartDate"
                :max="newEndDate" 
                label="시작일 선택"
                full-width
                color="primary"
              ></v-date-picker>
            </v-col>

            <v-col cols="12" md="6">
              <v-date-picker
                v-model="newEndDate"
                :min="newStartDate"
                label="종료일 선택"
                full-width
                color="primary"
              ></v-date-picker>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" class="text-center mt-4">
        <v-btn color="primary" @click="createOrUpdateEvent" large block>{{ selectedEventType ? '이벤트 수정' : '이벤트 생성' }}</v-btn>
      </v-col>
    </v-row>

    <!-- 히스토리 목록 타임라인 -->
    <v-row v-if="eventHistories.length" class="mt-5">
      <v-col cols="12">
        <h3 class="text-center">이벤트 변경 내역</h3>
        <v-timeline dense>
          <v-timeline-item
            v-for="history in eventHistories"
            :key="history.id"
            color="primary"
          >
            <v-timeline-divider color="primary"></v-timeline-divider>
            <v-timeline-content>
              <v-card class="pa-3">
                <v-card-title>
                  {{ history.startDate }} ~ {{ history.endDate }}에 {{ history.userNum }}에 의해 변경됨
                </v-card-title>
                <v-card-subtitle>
                  이벤트 범위: {{ history.eventRange }} | 변경자: {{ history.userNum }}
                </v-card-subtitle>
              </v-card>
            </v-timeline-content>
          </v-timeline-item>
        </v-timeline>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      headers: [
        { text: '이벤트 타입', value: 'eventType' },
        { text: '시작일', value: 'startDate' },
        { text: '종료일', value: 'endDate' },
        { text: '수정', value: 'actions', sortable: false },
      ],
      eventTypes: ['salary', 'evaluation'], // 이벤트 타입 목록
      eventList: [], // 전체 이벤트 목록
      newEventType: '', // 새로운 이벤트 타입 선택
      newStartDate: null, // 시작일 선택
      newEndDate: null, // 종료일 선택
      selectedEventId: null, // 선택된 이벤트 ID
      eventHistories: [], // 이벤트 히스토리 목록
    };
  },
  methods: {
    async createOrUpdateEvent() {
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
        console.error('이벤트 히스토리 가져오기 중 오류 발생:', error);
      }
    },

    selectEvent(item) {
      this.selectedEventId = item.id;
      this.fetchEventHistory(this.selectedEventId);
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

.v-btn {
  font-size: 16px;
}

.v-card {
  background-color: #f9f9f9;
}

.v-card-title {
  font-size: 18px;
  font-weight: bold;
}

.v-card-subtitle {
  font-size: 16px;
  color: #666;
}
</style>
