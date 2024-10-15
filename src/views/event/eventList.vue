<template>
    <v-container>
      <v-row>
        <v-col>
          <h1>일정 관리</h1>
        </v-col>
      </v-row>
  
      <!-- Event 목록 -->
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="selectedEventType"
            :items="eventTypes"
            label="이벤트 타입 선택"
            outlined
          ></v-select>
        </v-col>
        <v-col cols="12">
          <v-date-picker v-model="selectedDate" label="날짜 선택"></v-date-picker>
        </v-col>
        <v-col cols="12">
          <v-btn color="primary" @click="setEventDate">이벤트 날짜 설정</v-btn>
        </v-col>
      </v-row>
  
      <!-- History 목록 -->
      <v-row v-if="eventHistories.length">
        <v-col cols="12">
          <h3>이벤트 변경 내역</h3>
          <v-list dense>
            <v-list-item
              v-for="history in eventHistories"
              :key="history.id"
            >
              <v-list-item-content>
                <v-list-item-title>{{ history.changeDate }}에 {{ history.userNum }}에 의해 변경됨</v-list-item-title>
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
          await axios.post('/eventDate/setDate', {
            eventType: this.selectedEventType,
            eventDate: this.selectedDate,
            userNum: userNum
          });
          alert('이벤트 날짜가 설정되었습니다.');
          this.fetchEventHistory();
        } catch (error) {
          console.error('날짜 설정 중 오류 발생:', error);
        }
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
  h1 {
    margin-bottom: 20px;
  }
  
  .v-list-item {
    margin-bottom: 10px;
    background-color: #f0f0f0;
    border-radius: 10px;
  }
  </style>
  