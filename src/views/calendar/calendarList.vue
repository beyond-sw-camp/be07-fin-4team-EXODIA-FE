<template>
    <div>
      <!-- FullCalendar Integration -->
      <FullCalendar :options="calendarOptions">
        <template v-slot:eventContent="arg">
          <div>
            <strong>{{ arg.event.title }}</strong>
            <p>{{ arg.event.extendedProps.content }}</p>
          </div>
        </template>
      </FullCalendar>
  
      <!-- Event Modal for creating/updating events -->
      <v-dialog v-model="isModalOpen" persistent max-width="500px">
        <v-card>
          <v-card-title>{{ isEditing ? 'Update Event' : 'Create Event' }}</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field v-model="formData.title" label="Title" required></v-text-field>
              <v-text-field v-model="formData.content" label="Content" required></v-text-field>
  
              <!-- Date and Time Pickers for Start Time -->
              <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y>
                <template v-slot:activator="{ attrs }">
                  <v-text-field v-model="formData.startDate" label="Start Date" readonly v-bind="attrs" @click="menuStart = true"></v-text-field>
                </template>
                <v-date-picker v-model="formData.startDate" @input="menuStart = false"></v-date-picker>
              </v-menu>
              <v-time-picker
                v-model="formData.startTimeClock"
                label="Start Time"
                format="24hr"
                @input="handleTimeChange('startTimeClock', $event)"
              ></v-time-picker>
  
              <!-- Date and Time Pickers for End Time -->
              <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field v-model="formData.endDate" label="End Date" readonly v-bind="attrs" v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="formData.endDate" @input="menuEnd = false"></v-date-picker>
              </v-menu>
  
              <!-- End Time Clock -->
              <v-time-picker
                v-model="formData.endTimeClock"
                label="End Time"
                format="24hr"
                @input="handleTimeChange('endTimeClock', $event)"
              ></v-time-picker>
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
  import interactionPlugin from '@fullcalendar/interaction';
  import axios from 'axios';
  
  export default {
    components: {
      FullCalendar
    },
    data() {
      return {
        calendarOptions: {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          events: [], // Calendar events will be fetched and set here
          dateClick: this.handleDateClick,
          eventClick: this.handleEventClick
        },
        isModalOpen: false,
        isEditing: false,
        formData: {
          id: null,
          title: '',
          content: '',
          startDate: '', // 날짜
          startTimeClock: '', // 시간 (clock)
          endDate: '',
          endTimeClock: '', // 시간 (clock)
        },
        menuStart: false,
        menuEnd: false
      };
    },
    methods: {
      // Fetch all events including holidays and user events
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
                content: event.content
              }
            }));
            this.calendarOptions.events = events;
          })
          .catch((error) => {
            console.error('Error fetching events:', error);
          });
      },
      handleTimeChange(type, value) {
        const hours = value.split(':')[0];
        const minutes = value.split(':')[1];
        const seconds = '00'; // 기본적으로 초는 00으로 설정
        const formattedTime = `${hours}:${minutes}:${seconds}`;
  
        if (type === 'startTimeClock') {
          this.formData.startTimeClock = formattedTime;
        } else if (type === 'endTimeClock') {
          this.formData.endTimeClock = formattedTime;
        }
      },
      // Handle clicking a date in the calendar to create a new event
      handleDateClick(info) {
        this.isEditing = false;
        this.formData.startDate = info.dateStr;
        this.formData.startTimeClock = '';
        this.formData.endDate = info.dateStr;
        this.formData.endTimeClock = '';
        this.formData.title = ''; // Clear previous input
        this.formData.content = ''; // Clear previous input
        this.isModalOpen = true;
      },
      // Handle clicking an existing event to edit it
      handleEventClick(info) {
        this.isEditing = true;
        this.formData.id = info.event.id;
        this.formData.title = info.event.title;
        this.formData.startDate = info.event.startStr.split('T')[0];
        this.formData.startTimeClock = info.event.startStr.split('T')[1];
        this.formData.endDate = info.event.endStr.split('T')[0];
        this.formData.endTimeClock = info.event.endStr.split('T')[1];
        this.formData.content = info.event.extendedProps.content;
        this.isModalOpen = true;
      },
      // Handle saving an event (either create or update)
      handleSaveEvent() {
        const startTime = `${this.formData.startDate}T${this.formData.startTimeClock || '00:00:00'}`;
        const endTime = `${this.formData.endDate}T${this.formData.endTimeClock || '00:00:00'}`;
  
        const url = this.isEditing
          ? `${process.env.VUE_APP_API_BASE_URL}/calendars/update/${this.formData.id}`
          : `${process.env.VUE_APP_API_BASE_URL}/calendars/create`;
  
        const method = this.isEditing ? 'put' : 'post';
  
        const payload = {
          title: this.formData.title,
          content: this.formData.content,
          startTime: startTime, // 날짜와 시간이 결합된 문자열
          endTime: endTime, // 날짜와 시간이 결합된 문자열
          type: '유저' // 기본값 설정
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
            this.fetchEvents(); // 이벤트 저장 후 다시 이벤트 목록을 불러옴
          })
          .catch((error) => {
            if (error.response) {
              console.error('Server Response:', error.response.data);
              alert(`Error: ${error.response.data.message || '이벤트 저장에 실패했습니다.'}`);
            } else if (error.request) {
              console.error('No Response from Server:', error.request);
            } else {
              console.error('Error setting up the request:', error.message);
            }
          });
      }
    },
    mounted() {
      this.fetchEvents(); // Fetch events when the component is mounted
    }
  };
  </script>
  