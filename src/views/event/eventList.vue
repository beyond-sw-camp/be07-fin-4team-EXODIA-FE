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
          <template v-slot:item.actions="{ item }">
            <v-btn color="primary" @click="selectEvent(item)" small>수정</v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 이벤트 수정 화면 (범위 선택) -->
    <v-row class="mt-5" v-if="selectedEventType">
      <v-col cols="12" class="text-center">
        <h2>{{ selectedEventType }} 일정 설정</h2>
      </v-col>

      <!-- 범위 선택 달력 -->
      <v-col cols="12" md="8" offset-md="2">
        <v-card class="pa-3">
          <v-date-picker
            v-model="selectedDateRange"
            range
            color="primary"
            full-width
            @input="validateDateRange"
          ></v-date-picker>
        </v-card>
      </v-col>

      <v-col cols="12" class="text-center mt-4">
        <v-btn color="primary" @click="setEventDate" large block>이벤트 날짜 설정</v-btn>
      </v-col>
    </v-row>

    <!-- 히스토리 목록 -->
    <v-row v-if="eventHistories.length" class="mt-5">
      <v-col cols="12">
        <h3 class="text-center">이벤트 변경 내역</h3>
        <v-row>
          <v-col cols="12" md="8" offset-md="2">
            <v-card v-for="history in eventHistories" :key="history.id" class="pa-3 mb-3">
              <v-card-title>{{ history.eventDate }} - {{ history.userNum }}에 의해 변경됨</v-card-title>
              <v-card-subtitle>
                변경된 기간: {{ history.startDate }} ~ {{ history.endDate }}
              </v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
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
      eventList: [], // 전체 일정 목록
      selectedEventType: '', // 선택된 이벤트 타입
      selectedDateRange: [], // 범위 선택 날짜
      eventHistories: [], // 이벤트 히스토리 목록
    };
  },
  methods: {
    async setEventDate() {
      const userNum = localStorage.getItem('userNum');
      if (!userNum) {
        alert('로그인 정보가 없습니다.');
        return;
      }

      const startDate = this.selectedDateRange[0];
      const endDate = this.selectedDateRange[1] || this.selectedDateRange[0];

      try {
        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        await axios.post('/eventDate/setDate', {
          eventType: this.selectedEventType,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          userNum: userNum,
        });
        alert('이벤트 날짜가 설정되었습니다.');
        this.fetchEventHistory();
      } catch (error) {
        console.error('날짜 설정 중 오류 발생:', error);
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

    selectEvent(item) {
      this.selectedEventType = item.eventType;
      this.selectedDateRange = [new Date(item.startDate), new Date(item.endDate)];
      this.fetchEventHistory();
    },

    async fetchEventHistory() {
      try {
        const response = await axios.get(`/eventDate/getHistory/${this.selectedEventType}`);
        this.eventHistories = response.data;
      } catch (error) {
        console.error('이벤트 히스토리 가져오기 중 오류:', error);
      }
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

    validateDateRange() {
      if (this.selectedDateRange[0] && this.selectedDateRange[1]) {
        if (this.selectedDateRange[1] < this.selectedDateRange[0]) {
          alert('종료일은 시작일보다 빨라야 합니다.');
          this.selectedDateRange[1] = this.selectedDateRange[0];
        }
      }
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

.history-item {
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
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
