<template>
  <div id="second-calendar-container" class="calendar-container">
    <FullCalendar :options="secondCalendarOptions">
      <template v-slot:eventContent="arg">
        <div>
          <strong>{{ arg.event.title }}</strong>
        </div>
      </template>
    </FullCalendar>
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
      secondCalendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        editable: true,  // 드래그 앤 드롭 가능하게 설정
        droppable: true,  // 외부에서 드롭 가능하게 설정
        eventResizableFromStart: true,  // 시작 시간부터 이벤트를 조정할 수 있게 설정
        locale: 'ko', // 한국어 로케일 설정
        height: 700,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: ''
        },

        eventMouseEnter: this.handleEventHover,  // 이벤트에 마우스를 올렸을 때
        eventMouseLeave: this.handleEventLeave,  // 이벤트에서 마우스를 뗐을 때

        dayHeaderFormat: { weekday: 'short' },
        dayMaxEvents: true,
        dayMaxEventRows: 3,
        eventOverlap: false,
        allDaySlot: false, // 하루 종일 슬롯을 비활성화
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },

        // 이벤트 순서 정확하게 정렬
        eventOrder: "-duration,allDay,title",
        eventOrderStrict: true,

        // 당일 예약 스타일링
        eventContent: this.renderEventContent,

        // 드래그 앤 드롭 관련 핸들러 추가
        eventDrop: this.handleEventDrop, // 드래그 후 일정 변경
        eventResize: this.handleEventResize, // 일정 크기 조정
      },

      // 이벤트 데이터 초기화
      isModalOpen: false,
      isEditing: false,
      allDay: false, // 하루종일 여부

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
        this.secondCalendarOptions.events = events;
      }).catch(error => {
        console.error('이벤트 불러오기 오류:', error);
      });
    },

    // 일정 드래그 후 처리
    handleEventDrop(info) {
      const event = info.event;
      const newStartTime = event.start;
      const newEndTime = event.end;

      // 시작일과 종료일 화~긴 -> 
      const isMultiDayEvent = newStartTime.getDate() !== newEndTime.getDate();

      if (isMultiDayEvent) {
        alert('하루 이상인 이벤트는 수정할 수 없습니다.');
        info.revert(); // 이벤트를 원래 위치로 되돌립니다.
        return;
      }
      // 새로운 시간 정보를 처리 (서버로 전송 또는 로컬 업데이트)
      console.log("새로운 시작 시간:", newStartTime);
      console.log("새로운 종료 시간:", newEndTime);

      // 서버에 업데이트 요청 (필요시)
      this.updateEvent(event);
    },

    // 일정 크기 조정 후 처리
    handleEventResize(info) {
      const event = info.event;
      const newStartTime = event.start;
      const newEndTime = event.end;
      // 하루 이상의 이벤트인지 확인
      const isMultiDayEvent = newStartTime.getDate() !== newEndTime.getDate();

      if (isMultiDayEvent) {
        alert('하루 이상인 이벤트는 수정할 수 없습니다.');
        info.revert(); // 크기 조정을 취소하고 원래 상태로 되돌립니다.
        return;
      }
      // 크기 조정된 일정 시간을 서버 또는 로컬에서 처리
      console.log("크기 조정된 시작 시간:", newStartTime);
      console.log("크기 조정된 종료 시간:", newEndTime);

      // 서버에 업데이트 요청 (필요시)
      this.updateEvent(event);
    },

    // 서버에 일정 업데이트 요청
    updateEvent(event) {
      const payload = {
        title: event.title,
        content: event.extendedProps.content,
        type: event.extendedProps.type,
        startTime: this.formatLocalDateTime(event.start),
        endTime: this.formatLocalDateTime(event.end),
      };
      axios.put(`${process.env.VUE_APP_API_BASE_URL}/calendars/update/${event.id}`, payload)
        .then(() => {
          console.log("일정이 성공적으로 업데이트되었습니다.");
        })
        .catch(error => {
          console.error("일정 업데이트 중 오류 발생:", error);
        });
    },
    formatLocalDateTime(date) {
      return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') + 'T' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0');
    },

  },
  mounted() {
    this.fetchEvents(); // 캘린더 로드 시 이벤트 데이터 가져오기
  }
};
</script>
<style scoped></style>
<style>
#second-calendar-container .event-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #2196f3;
  border-radius: 50%;
  margin-right: 5px;
  height: auto;
  /* 높이를 자동으로 설정 */
  min-height: 1000px;
  /* 최소 높이 설정 */
}

#second-calendar-container .fc-event {
  border-radius: 5px;
  font-size: 12px;
  padding: 2px;
  border-style: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  /* 그림자 추가 */
  transition: transform 0.2s;
  /* 호버 시 부드럽게 확대 */
}

#second-calendar-container .fc-event:hover {
  transform: scale(1.03);
  /* 호버 시 살짝 확대 */
}

#second-calendar-container .fc-daygrid-event {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* more 기능을 위한 height 조정 */
#second-calendar-container .fc-daygrid-day-bottom {
  margin-top: 5px;
}


#second-calendar-container {
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  /* background-image: linear-gradient(135deg, #f0f4f8, #f9f9f9); */
}


#second-calendar-container .user-event {
  background-color: #d0e9ff;
  /* 유저 이벤트는 연한 파란색 */
}

#second-calendar-container .department-event {
  background-color: #c0fac0;
  /* 부서 이벤트는 연한 초록색 */
}

#second-calendar-container .company-event {
  background-color: #fccccc;
  /* 회사 일정은 연한 빨간색 */
}


#second-calendar-container .fc-toolbar-title {
  font-size: 14px;
  color: #665f54;
  margin-left: 10px;
}

#second-calendar-container .fc .fc-button {
  background-color: #f9f9f9;
  color: #665f54;
  border: 1px solid #ddd;
  border-radius: 50%;
  font-size: 12px;
  padding: 5px;
  height: 30px;
  width: 30px;
  display: flex;
  margin-right: 10px;
  justify-content: center;
  align-items: center;
  outline: none;
  transition: background-color 0.3s, color 0.3s;
  /* 여기가 배경색 수정 부분이니 펼요시 수정 */
}

#second-calendar-container .fc .fc-button:focus {
  outline: none;
}

#second-calendar-container .fc .fc-button.fc-today-button {
  padding: 5px 15px;
  font-size: 12px;
  border-radius: 20px;
  height: 30px;
  width: auto;

}

#second-calendar-container .fc-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

}

#second-calendar-container .fc-toolbar .fc-button:hover {
  background-color: #cbc2b6;
  color: white;
  outline: none;
}

#second-calendar-container .fc .fc-button.fc-today-button:hover {
  background-color: #cbc2b6;
  border-style: none;
  color: white;
}

#second-calendar-container .fc-toolbar-chunk {
  display: flex;
  align-items: center;
}


/* 오늘 날 표시 */
#second-calendar-container .fc-timegrid-slot {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}

#second-calendar-container .v-dialog {
  max-width: 500px;
  border-radius: 10px;
}

#second-calendar-container .v-card-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

#second-calendar-container .v-text-field input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

#second-calendar-container .v-btn {
  border-radius: 5px;
  padding: 10px 20px;
}

#second-calendar-container .fc-event-dragging,
.fc-event-resizing {
  opacity: 0.7;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}

#second-calendar-container .fc-timegrid-axis-cushion {
  font-size: 10px;
  /* 글씨를 작게 */
  color: #666;
  /* 글씨 색을 회색으로 */
  padding: 2px;
  /* 여백을 줄여 더 간결하게 */
}

/* 시간 라벨 추가 조정 */
#second-calendar-container .fc-timegrid-slot-label {
  font-size: 11px;
  font-weight: 500;
  color: #444;
  padding: 0 4px;

}

#second-calendar-container ::-webkit-scrollbar {
  width: 12px;
}

#second-calendar-container ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

#second-calendar-container ::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
  border: 2px solid #f1f1f1;
}

#second-calendar-container ::-webkit-scrollbar-thumb:hover {
  background: #555;
}

#second-calendar-container {
  height: 800px;
}
</style>