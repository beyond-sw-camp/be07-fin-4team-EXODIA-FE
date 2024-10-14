<template>
  <div>
    <FullCalendar :options="calendarOptions">
      <template v-slot:eventContent="arg">
        <div>
          <strong>{{ arg.event.title }}</strong>
          <p>{{ arg.event.extendedProps.content }}</p>
        </div>
      </template>
    </FullCalendar>

    <v-dialog v-model="isModalOpen" persistent max-width="500px">
      <v-card>
        <v-card-title>{{ isEditing ? '일정 수정' : '일정 추가' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="formData.title" label="Title" required></v-text-field>
            <v-text-field v-model="formData.content" label="Content" required></v-text-field>

            <!-- 타입 선택 -->
            <v-select
              v-model="formData.type"
              :items="eventTypes"
              label="Event Type"
              required
            ></v-select>

            <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y>
              <template v-slot:activator="{ attrs }">
                <v-text-field v-model="formData.startDate" label="Start Date" readonly v-bind="attrs" @click="menuStart = true"></v-text-field>
              </template>
              <v-date-picker v-model="formData.startDate" @input="menuStart = false"></v-date-picker>
            </v-menu>

            <!-- Start Time 입력 필드 -->
            <v-text-field
              v-model="formData.startTimeClock"
              label="Start Time (HH:MM)"
              placeholder="Enter time in HH:MM format"
              outlined
            ></v-text-field>

            <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-text-field v-model="formData.endDate" label="End Date" readonly v-bind="attrs" v-on="on"></v-text-field>
              </template>
              <v-date-picker v-model="formData.endDate" @input="menuEnd = false"></v-date-picker>
            </v-menu>

            <!-- End Time 입력 필드 -->
            <v-text-field
              v-model="formData.endTimeClock"
              label="End Time (HH:MM)"
              placeholder="Enter time in HH:MM format"
              outlined
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="handleSaveEvent">Save</v-btn>
          <v-btn color="red darken-1" text @click="isModalOpen = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        events: [],
        locale: 'ko',
        headerToolbar: {
          left: 'prev,next today myCustomButton',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        allDaySlot: false,
        customButtons: {
          myCustomButton: {
            text: '이벤트1',
            click: this.handleCustomButtonClick
          }
        },
        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }
      },
      isModalOpen: false,
      isEditing: false,
      formData: {
        id: null,
        title: '',
        content: '',
        type: '유저', 
        startDate: '',
        startTimeClock: '',
        endDate: '',
        endTimeClock: '',
      },
      eventTypes: ['유저', '부서', '회사일정'],
      menuStart: false,
      menuEnd: false
    };
  },
  methods: {
    fetchEvents() {
      axios
        .get(`${process.env.VUE_APP_API_BASE_URL}/calendars/allevents`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then((response) => {
          const events = response.data.map((event) => ({
            id: event.id,
            title: event.title,
            start: event.startTime,
            end: event.endTime,
            extendedProps: {
              content: event.content,
              type: event.type
            }
          }));
          this.calendarOptions.events = events;
        })
        .catch((error) => {
          console.error('이벤트 불러오기에 실패하였습니다 : ', error);
        });
    },
    handleTimeChange(type, value) {
      const hours = value.split(':')[0];
      const minutes = value.split(':')[1];
      const seconds = '00'; 
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      if (type === 'startTimeClock') {
        this.formData.startTimeClock = formattedTime;
      } else if (type === 'endTimeClock') {
        this.formData.endTimeClock = formattedTime;
      }
    },
    handleDateClick(info) {
      this.isEditing = false;
      this.formData.startDate = info.dateStr;
      this.formData.startTimeClock = '';
      this.formData.endDate = info.dateStr;
      this.formData.endTimeClock = '';
      this.formData.title = '';
      this.formData.content = '';
      this.formData.type = '유저';
      this.isModalOpen = true;
    },
    handleEventClick(info) {
      this.isEditing = true;
      this.formData.id = info.event.id;
      this.formData.title = info.event.title;
    
      if (info.event.startStr) {
        this.formData.startDate = info.event.startStr.split('T')[0];
        this.formData.startTimeClock = info.event.startStr.split('T')[1]?.substring(0, 5) || '';
      } else {
        this.formData.startDate = '';
        this.formData.startTimeClock = '';
      }

      if (info.event.endStr) {
        this.formData.endDate = info.event.endStr.split('T')[0];
        this.formData.endTimeClock = info.event.endStr.split('T')[1]?.substring(0, 5) || '';
      } else {
        this.formData.endDate = '';
        this.formData.endTimeClock = '';
      }

      this.formData.content = info.event.extendedProps.content;
      this.formData.type = info.event.extendedProps.type || '유저';
      this.isModalOpen = true;
    },
    handleSaveEvent() {
  // startDate와 endDate가 문자열인 경우 Date 객체로 변환
  const startDate = new Date(this.formData.startDate);
  const endDate = new Date(this.formData.endDate);

  // Date 객체인지 확인 후 처리
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    alert('유효한 날짜를 입력하세요.');
    return;
  }

  const startTime = `${this.formData.startDate}T${this.formData.startTimeClock || '00:00:00'}`;
  const endTime = `${this.formData.endDate}T${this.formData.endTimeClock || '00:00:00'}`;

  const url = this.isEditing
    ? `${process.env.VUE_APP_API_BASE_URL}/calendars/update/${this.formData.id}`
    : `${process.env.VUE_APP_API_BASE_URL}/calendars/create`;

  const method = this.isEditing ? 'put' : 'post';

  const payload = {
    title: this.formData.title,
    content: this.formData.content,
    startTime: startTime,
    endTime: endTime,
    type: this.formData.type
  };

  axios({
    method: method,
    url: url,
    data: payload,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(() => {
      this.isModalOpen = false;
      this.fetchEvents(); 
    })
    .catch((error) => {
      if (error.response) {
        console.error('Server Response:', error.response.data);
        alert(`Error: ${error.response.data.message || '이벤트 저장에 실패했습니다.'}`);
      } else if (error.request) {
        console.error('서버에서 응답 없음 :', error.request);
      } else {
        console.error('요청 설정 중 오류 발생 :', error.message);
      }
    });
}
  },
  mounted() {
    this.fetchEvents();
  }
};
</script>

<style scoped>
.v-btn {
  margin: 0 10px;
}
</style>
