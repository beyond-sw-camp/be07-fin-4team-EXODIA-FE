<template>
    <v-container>
      <v-row>
        <v-col>
          <h1 class="page-title">일정 관리</h1>
        </v-col>
      </v-row>
  
      <!-- Event 목록 -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-select
            v-model="selectedEventType"
            :items="eventTypes"
            label="이벤트 타입 선택"
            outlined
            dense
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-date-picker v-model="selectedDate" label="날짜 선택" class="styled-calendar"></v-date-picker>
        </v-col>
      </v-row>
  
      <v-row class="mb-4">
        <v-col class="text-center">
          <v-btn color="primary" @click="setEventDate" large>이벤트 날짜 설정</v-btn>
        </v-col>
      </v-row>
  
      <!-- History 목록 -->
      <v-row v-if="eventHistories.length">
        <v-col cols="12">
          <h3 class="history-title">이벤트 변경 내역</h3>
          <v-list dense>
            <v-list-item
              v-for="history in eventHistories"
              :key="history.id"
              class="history-item"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ history.changeDate }}에 {{ history.userNum }}에 의해 변경됨
                </v-list-item-title>
                <v-list-item-subtitle>변경된 범위: {{ history.eventRange }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        eventTypes: ['salary', 'evaluation'],
        selectedEventType: '',
        selectedDate: null,
        eventHistories: [],
      };
    },
    methods: {
      async setEventDate() {
        const userNum = localStorage.getItem('userNum');
        if (!userNum) {
          alert('로그인 정보가 없습니다.');
          return;
        }
  
        try {
          const formattedDate = this.selectedDate ? this.formatDate(this.selectedDate) : '';
          await axios.post('/eventDate/setDate', {
            eventType: this.selectedEventType,
            eventDate: formattedDate,
            userNum: userNum,
          });
          alert('이벤트 날짜가 설정되었습니다.');
          this.fetchEventHistory();
        } catch (error) {
          console.error('날짜 설정 중 오류 발생:', error);
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
  
      async fetchEventHistory() {
        try {
          const response = await axios.get(`/eventDate/getHistory/${this.selectedEventType}`);
          this.eventHistories = response.data;
        } catch (error) {
          console.error('이벤트 히스토리 가져오기 중 오류:', error);
        }
      }
    },
    mounted() {
      this.fetchEventHistory();
    }
  };
  </script>
  
  <style scoped>
  .page-title {
    margin-bottom: 20px;
    font-weight: bold;
    text-align: center;
    color: #2e7d32;
  }
  
  .styled-calendar .v-picker__title {
    background-color: #e3f2fd;
  }
  
  .styled-calendar .v-picker__body {
    border-radius: 10px;
  }
  
  .history-title {
    margin-top: 20px;
    font-weight: bold;
    color: #1976d2;
  }
  
  .history-item {
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .v-btn {
    width: 100%;
    font-size: 16px;
  }
  </style>
  