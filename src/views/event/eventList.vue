<template>
  <v-container>
    <v-row class="mb-12" style="padding-left:30px">
      <!-- style="margin:40px 50px" -->
      <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle || '일정 목록' }}</h1>
    </v-row>

    <v-row class="mt-4 mb-4">
      <v-col class="text-right">
        <v-btn v-create @click="showDialog = true" large>
          새로운 일정 생성
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <!-- <v-row class="mb-3">
          <v-col cols="4"><strong>일정명</strong></v-col>
          <v-col cols="5"><strong>기간</strong></v-col>
          <v-col cols="3"><strong>히스토리</strong></v-col>
        </v-row> -->

        <v-row v-for="(event, index) in eventList" :key="event.id" class="event-row">
          <v-col cols="4">
            <h3 class="event-type">{{ event.eventType }}</h3>
          </v-col>
          <v-col cols="5">
            <p class="event-date">{{ event.startDate }} ~ {{ event.endDate }}</p>
          </v-col>

          <v-col cols="3" class="text-right">
            <v-btn v-list text @click="toggleHistory(index, event.id)">
              <v-icon>{{ event.showHistory ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              히스토리 보기
            </v-btn>
            <v-btn text v-delete @click="deleteEvent(event.id, index)">
              삭제
            </v-btn>
          </v-col>

          <!-- History Section -->
          <v-col cols="12" v-if="event.showHistory" transition="slide-y-transition">
            <v-row class="history-row">
              <v-col cols="12" offset-md="3" class="history-section">
                <v-card v-for="history in event.eventHistories" :key="history.id" class="pa-3 mb-3 history-card">
                  <v-card-title class="d-flex align-center">
                    <v-icon color="brown" class="mr-3">mdi-clock-outline</v-icon>
                    {{ history.startDate }} - {{ history.endDate }} 변경됨
                  </v-card-title>
                  <v-card-subtitle>
                    <v-icon color="blue" small>mdi-calendar-range</v-icon> 변경 날짜: {{ history.eventRange }} |
                    <v-icon color="green" small>mdi-account</v-icon> 변경자: {{ history.userNum }}
                  </v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="showDialog" max-width="600px">
      <v-card :style="{ height: 'auto', padding: '20px' }">
        <v-card-title>새 일정 생성</v-card-title>
        <v-card-text>
          <!-- 일정 타입 선택 -->
          <v-combobox 
            v-model="newEventType" 
            :items="eventTypes" 
            label="일정 타입 선택" 
            outlined 
            dense 
            placeholder="일정을 선택하세요" 
            class="mb-4"
             :error="!newEventType && showErrors"
             required
          />
          <span v-if="!newEventType && showErrors" class="error-text">일정 타입을 선택/입력해주세요</span>


          <!-- 달력 등록 체크박스 -->
          <v-checkbox v-model="registerToCalendar" label="달력 등록" class="mb-4"></v-checkbox>
          
          <!-- 시작일과 종료일 선택 -->
          <v-row class="mt-3" justify="space-between">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newStartDate"
                label="시작일 선택"
                type="date"
                @change="syncEndDate"
                outlined
                dense
                class="mb-4"
              />
            </v-col>
    
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newEndDate"
                label="종료일 선택"
                type="date"
                outlined
                dense
                class="mb-4"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <!-- 생성 버튼 -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="createOrUpdateCalendar">저장</v-btn>
          <v-btn text @click="showDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      eventTypes: ['급여', '인사평가'], // 이벤트 타입 목록
      eventList: [], // 전체 이벤트 목록
      newEventType: '', // 새로운 이벤트 타입 선택
      newStartDate: null, // 시작일 선택
      newEndDate: null, // 종료일 선택
      registerToCalendar: false, // 달력 등록 상태 추가
      showDialog: false, // 모달창 상태
      showErrors: false,
    };
  },
  methods: {
    syncEndDate() {
    if (!this.newEndDate || new Date(this.newEndDate) < new Date(this.newStartDate)) {
      this.newEndDate = this.newStartDate;
    }
  },
    async createOrUpdateCalendar() {
      this.showErrors = true;
      const userNum = localStorage.getItem('userNum');
      if (!userNum) {
        alert('로그인 정보가 없습니다.');
        return;
      }

      if (!this.newEventType) {
        alert("일정 타입을 선택/입력해주세요");
        return;
      }

      const startDate = this.newStartDate;
      const endDate = this.newEndDate || this.newStartDate;

      try {
        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        const eventPayload = {
          eventType: this.newEventType,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          userNum: userNum,
        };

        await axios.post('/eventDate/setDate', eventPayload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (this.registerToCalendar) {
          // 달력에서 이벤트가 있는지 확인
          try {
            const calendarResponse = await axios.get(`/calendars/findByTitle/${encodeURIComponent(this.newEventType)}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

            // 이미 이벤트가 있으면 업데이트
            const calendarUpdatePayload = {
              title: this.newEventType,
              content: '달력 등록된 이벤트입니다.',
              startTime: formattedStartDate + "T00:00:00",
              endTime: formattedEndDate + "T23:59:59",
              type: '회사일정',
              userId: userNum,
            };

            await axios.put(`/calendars/update/${calendarResponse.data.id}`, calendarUpdatePayload, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });

          } catch (error) {
            // 이벤트가 없는 경우, 새로 생성
            if (error.response && error.response.status === 404) {
              const calendarCreatePayload = {
                title: this.newEventType,
                content: '달력 등록된 이벤트입니다.',
                startTime: formattedStartDate + "T00:00:00",
                endTime: formattedEndDate + "T23:59:59",
                type: '회사일정',
                userId: userNum,
              };

              await axios.post('/calendars/create', calendarCreatePayload, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              });
            } else {
              console.error('달력 이벤트 처리 중 오류 발생:', error);
            }
          }
        }

        alert('일정이 성공적으로 처리되었습니다.');
        this.showDialog = false; // 모달창 닫기
        this.fetchEventList(); 
      } catch (error) {
        console.error('일정 저장 중 오류 발생:', error);
      }
    },

    async deleteEvent(eventId, index) {
      try {
        await axios.delete(`/eventDate/delete/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.eventList.splice(index, 1);
        alert('일정이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('일정 삭제 중 오류 발생:', error);
      }
    },

    async fetchEventList() {
      try {
        const response = await axios.get('/eventDate/all');
        this.eventList = response.data.map(event => ({
          ...event,
          showHistory: false,
          eventHistories: [],
        }));
      } catch (error) {
        console.error('전체 일정 목록을 불러오는 중 오류 발생:', error);
      }
    },

    async fetchEventHistory(eventId, index) {
      try {
        const response = await axios.get(`/eventDate/getHistory/${eventId}`);
        this.eventList[index].eventHistories = response.data;
      } catch (error) {
        console.error('일정 히스토리 가져오기 중 오류 발생:', error);
      }
    },

    toggleHistory(index, eventId) {
      this.eventList[index].showHistory = !this.eventList[index].showHistory;
      if (!this.eventList[index].eventHistories.length) {
        this.fetchEventHistory(eventId, index);
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
  },
  mounted() {
    this.fetchEventList();
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  border-radius: 12px;
}

.drawer-open {
  transition: margin-right 0.3s ease;
  margin-right: 200px;
}

h1 {
  margin-bottom: 20px;
}

.event-row {
  border-bottom: 1px solid #ddd;
  padding: 10px;
  transition: background-color 0.3s;
}

/* .event-row:hover {
  background-color: #f9f9f9;
} */

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
  margin-right: 10px;
}

.history-row {
  justify-content: flex-start;
}

.history-section {
  padding-left: 5%;
  max-width: 80%;
}

.history-card {
  background-color: #e9f7fe;
  border-radius: 10px;
  padding: 15px;
  width: 100%;
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
