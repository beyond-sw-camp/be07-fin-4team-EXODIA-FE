<v-btn v-list class="mr-2" @click="goBack">목록으로</v-btn>
<v-btn v-create class="mr-2" @click="editBoard">수정</v-btn>
<v-btn v-delete @click="confirmDeleteBoard">삭제</v-btn><template>
  <div id="first-calendar-container" class="calendar-container">
    <FullCalendar :options="firstCalendarOptions">
      <template v-slot:eventContent="arg">
        <div>
          <strong>{{ arg.event.title }}</strong>
        </div>
      </template>
    </FullCalendar>

    <v-dialog v-model="isModalOpen" persistent max-width="500px">
      <v-card>
        <v-card-title>{{ isEditing ? '일정' : '일정 추가' }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="formData.title" label="Title" required></v-text-field>
            <v-text-field v-model="formData.content" label="Content" required></v-text-field>

            <!-- 타입 선택 -->
            <v-select v-model="formData.type" :items="eventTypes" label="Event Type" required></v-select>

            <!-- 날짜 입력 -->
            <v-text-field v-model="formData.startDate" label="시작 날짜 (YYYY-MM-DD)" required></v-text-field>
            <!-- 시간 입력 (시, 분 분리) -->
            <v-row>
              <v-col cols="6">
                <small style="margin-top: -10px; color: red;">* 시간을 입력해주세요 00~23</small>
                <v-text-field v-model="formData.startHour" label="시작 시간 (00시)" type="number" :min="0" :max="23" required
                  v-if="!allDay"></v-text-field>

              </v-col>
              <v-col cols="6">
                <small style="color: red;">* 분을 입력해주세요</small>
                <v-text-field v-model="formData.startMinute" label="시작 시간 (00분)" type="number" :min="0" :max="59"
                  required v-if="!allDay"></v-text-field>
              </v-col>
            </v-row>
            <v-text-field v-model="formData.endDate" label="종료 날짜 (YYYY-MM-DD)" required></v-text-field>

            <v-row>
              <v-col cols="6">
                <small style="margin-top: -10px; color: red;">* 시간을 입력해주세요 00~23</small>
                <v-text-field v-model="formData.endHour" label="종료 시간 (00시)" type="number" :min="0" :max="23" required
                  v-if="!allDay"></v-text-field>
              </v-col>
              <v-col cols="6">
                <small style="margin-top: -10px; color: red;">* 분을 입력해주세요</small>
                <v-text-field v-model="formData.endMinute" label="종료 시간 (00분)" type="number" :min="0" :max="59" required
                  v-if="!allDay"></v-text-field>
              </v-col>
            </v-row>

            <!-- 하루종일 버튼 -->
            <v-checkbox v-model="allDay" label="하루종일" @change="handleAllDay"></v-checkbox>

          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-create text @click="handleSaveEvent">생성</v-btn>
          <v-btn v-delete text @click="isModalOpen = false">취소</v-btn>
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
      firstCalendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        events: [],
        locale: 'ko',

        headerToolbar: {
          left: 'prev,next today', // 왼쪽에 '월/주/일' 버튼 배치
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        dayHeaderFormat: { weekday: 'short' },

        dayMaxEvents: true,
        dayMaxEventRows: 3,
        eventOverlap: false,

        allDaySlot: false,

        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,

        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        eventOrder: "-duration,allDay,title",  // 이벤트 순서 정확하게 정렬
        eventOrderStrict: true,  // 이벤트가 다중일일 때 같은 줄에 나오도록

        // eventOrder: function(a, b) {
        //   if (a.allDay && !b.allDay) {
        //     return -1;
        //   } else if (!a.allDay && b.allDay) {
        //     return 1;
        //   } else if (a.start < b.start) {
        //     return -1;
        //   } else if (a.start > b.start) {
        //     return 1;
        //   } else {
        //     return 0;
        //   }
        // },

        // 당일 예약 스타일링 
        eventContent: this.renderEventContent,

      },
      isModalOpen: false,
      isEditing: false,
      allDay: false,  // 하루종일 여부
      formData: {
        id: null,
        title: '',
        content: '',
        type: '유저',
        startDate: '',
        startHour: '',
        startMinute: '',
        endDate: '',
        endHour: '',
        endMinute: ''
      },
      eventTypes: ['유저', '부서', '회사일정'],
    };
  },
  methods: {

    fetchEvents() {
      axios.get(`${process.env.VUE_APP_API_BASE_URL}/calendars/allevents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(response => {
        const events = response.data.map(event => ({
          id: event.id,
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          extendedProps: {
            content: event.content,
            type: event.type
          },
          classNames: [event.type === '유저' ? 'user-event' : event.type === '부서' ? 'department-event' : 'company-event']
        }));
        this.firstCalendarOptions.events = events;
      }).catch(error => {
        console.error('이벤트 불러오기 오류:', error);
      });
    },

    handleSaveEvent() {
      if (!this.formData.title || !this.formData.content || !this.formData.startDate || !this.formData.endDate) {
        alert("모든 필수 항목을 입력해주세요.");
        return;
      }

      if (!this.allDay && (!this.formData.startHour || !this.formData.startMinute || !this.formData.endHour || !this.formData.endMinute)) {
        alert("시작 및 종료 시간을 입력해주세요.");
        return;
      }
      if (this.formData.startHour < 0 || this.formData.startHour > 23 || this.formData.endHour < 0 || this.formData.endHour > 23) {
        alert("시간은 0에서 23 사이여야 합니다.");
        return;
      }

      if (this.formData.startMinute < 0 || this.formData.startMinute > 59 || this.formData.endMinute < 0 || this.formData.endMinute > 59) {
        alert("분은 0에서 59 사이여야 합니다.");
        return;
      }

      const startTime = `${this.formData.startDate}T${this.formData.startHour.padStart(2, '0')}:${this.formData.startMinute.padStart(2, '0')}:00`;
      const endTime = `${this.formData.endDate}T${this.formData.endHour.padStart(2, '0')}:${this.formData.endMinute.padStart(2, '0')}:00`;

      if (new Date(startTime) >= new Date(endTime)) {
        alert("종료 시간은 시작 시간보다 늦어야 합니다.");
        return;
      }


      const payload = {
        title: this.formData.title,
        content: this.formData.content,
        startTime: startTime,
        endTime: endTime,
        type: this.formData.type
      };

      const url = this.isEditing
        ? `${process.env.VUE_APP_API_BASE_URL}/calendars/update/${this.formData.id}`
        : `${process.env.VUE_APP_API_BASE_URL}/calendars/create`;

      const method = this.isEditing ? 'put' : 'post';

      axios({
        method: method,
        url: url,
        data: payload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(() => {
        this.isModalOpen = false;
        this.fetchEvents();
      }).catch(error => {
        console.error('이벤트 저장 중 오류 발생:', error);
      });
    },
    handleAllDay() {
      if (this.allDay) {
        // 하루종일 체크 시 시간 자동 설정
        this.formData.startHour = '00';
        this.formData.startMinute = '00';
        this.formData.endHour = '23';
        this.formData.endMinute = '59';
      } else {
        // 하루종일 체크 해제 시 시간 초기화
        this.formData.startHour = '';
        this.formData.startMinute = '';
        this.formData.endHour = '';
        this.formData.endMinute = '';
      }
    },
    handleDateClick(info) {
      this.isEditing = false;
      this.formData.startDate = info.dateStr;
      this.formData.endDate = info.dateStr;
      this.isModalOpen = true;
    },
    handleEventClick(info) {
      this.isEditing = true;
      this.formData.id = info.event.id;
      this.formData.title = info.event.title;
      this.formData.content = info.event.extendedProps.content;
      this.formData.type = info.event.extendedProps.type;

      const startDateTime = new Date(info.event.start);
      this.formData.startDate = startDateTime.toISOString().split('T')[0];
      this.formData.startHour = startDateTime.getHours().toString().padStart(2, '0');
      this.formData.startMinute = startDateTime.getMinutes().toString().padStart(2, '0');

      const endDateTime = new Date(info.event.end);
      this.formData.endDate = endDateTime.toISOString().split('T')[0];
      this.formData.endHour = endDateTime.getHours().toString().padStart(2, '0');
      this.formData.endMinute = endDateTime.getMinutes().toString().padStart(2, '0');

      this.isModalOpen = true;
    }
  },
  mounted() {
    this.fetchEvents();
  }
};
</script>

<style scoped></style>
<style>
#first-calendar-container .event-dot {
  display: inline-block;
  font-size: 25px;
  width: 8px;
  height: 8px;
  background-color: #2196f3;
  border-radius: 50%;
  margin-right: 5px;
}

#first-calendar-container .fc-event {
  border-radius: 5px;
  font-size: 12px;
  padding: 2px;
  border-style: none;
}

#first-calendar-container .fc-daygrid-event {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* more 기능을 위한 height 조정 */
#first-calendar-container .fc-daygrid-day-bottom {
  margin-top: 5px;
}


#first-calendar-container {
  width: 100%;

  padding: 30px;
  /* 패딩을 좀 더 추가하여 여백 확보 */
  border-radius: 10px;
  background-color: #f9f9f9;
  /* 배경을 연한 회색으로 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  /* 그림자 효과 */
  border: 1px solid #ddd;
  /* 테두리를 추가하여 캘린더 강조 */
}

#first-calendar-container .user-event {
  background-color: #d0e9ff;
  /* 유저 이벤트는 연한 파란색 */
}

#first-calendar-container .department-event {
  background-color: #c0fac0;
  /* 부서 이벤트는 연한 초록색 */
}

#first-calendar-container .company-event {
  background-color: #fccccc;
  /* 회사 일정은 연한 빨간색 */
}

/* 2024 10 글씨 */
#first-calendar-container .fc-toolbar-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
}

/* 이전/다음 버튼 스타일 */
#first-calendar-container .fc .fc-button-prev,
#first-calendar-container .fc .fc-button-next {
  justify-content: center;
  align-items: center;
  background-color: #d3ccc1;
  color: #5a5246;
  padding: 10px 15px;
}

#first-calendar-container .fc .fc-button-prev:hover,
#first-calendar-container .fc .fc-button-next:hover {
  background-color: #cbc2b6;
  justify-content: center;
  align-items: center;
}

#first-calendar-container .fc-direction-ltr .fc-button-group>.fc-button:not(:last-child) {
  justify-content: center;
  align-items: center;
  font-size: 12px;
  border: #665f54 solid 3px;
  background-color: none;
  color: #665f54;
  padding: 10px 15px;
  border-radius: 30px 30px 30px 30px;
}

#first-calendar-container .fc-direction-ltr .fc-button-group>.fc-button:not(:first-child) {
  justify-content: center;
  border: #665f54 solid 3px;
  background-color: none;
  color: #665f54;
  align-items: center;
  padding: 10px 15px;
  font-size: 12px;
  border-radius: 30px 30px 30px 30px;
}

/* today 버튼 */
#first-calendar-container .fc-direction-ltr .fc-toolbar>*> :not(:first-child) {
  justify-content: center;
  align-items: center;
  border: #665f54 solid 3px;
  background-color: #f9f9f9;
  color: #665f54;
  padding: 10px 15px;
  font-size: 12px;
  border-radius: 30px 30px 30px 30px;
}

#first-calendar-container .fc .fc-button-group .fc-button {
  background-color: #f9f9f9;
  /* 기본 회색 배경 */
  color: #665f54;
  /* 텍스트 색상 */
  border-radius: 25px;
  padding: 8px 20px;
  border: none;
  margin: 0 5px;
}

#first-calendar-container .fc .fc-button-primary:disabled {
  background-color: #665f54;
  border-color: #665f54;
  color: white;
}

/* 상단 컴포넌트 호버 디자인 */
#first-calendar-container .fc .fc-button-group .fc-button:hover {
  background-color: #665f54;
  color: white;
}

#first-calendar-container .fc .fc-button-group .fc-button.fc-button-active {
  background-color: #665f54;
  /* 활성화된 버튼은 짙은 갈색 */
  color: white;
}

#first-calendar-container .fc-toolbar-title {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}
</style>