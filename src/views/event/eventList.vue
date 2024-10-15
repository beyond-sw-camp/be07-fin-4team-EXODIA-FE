<template>
    <v-container>
      <h1>일정 관리</h1>
      
      <!-- Event list and creation form -->
      <v-row>
        <v-col>
          <v-select
            v-model="newEvent.eventType"
            :items="eventTypes"
            label="이벤트 타입 선택"
            outlined
          ></v-select>
        </v-col>
        <v-col>
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="newEvent.eventDate"
                label="이벤트 날짜 선택"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="newEvent.eventDate" @input="menu = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col>
          <v-btn color="primary" @click="createEventDate">일정 추가</v-btn>
        </v-col>
      </v-row>
  
      <!-- Existing event dates -->
      <v-row>
        <v-col cols="12">
          <v-simple-table>
            <thead>
              <tr>
                <th>이벤트 타입</th>
                <th>날짜</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="event in eventDates" :key="event.id">
                <td>{{ event.eventType }}</td>
                <td>{{ event.eventDate }}</td>
                <td>
                  <v-btn icon @click="editEvent(event)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon @click="deleteEvent(event.id)">
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-col>
      </v-row>
  
      <!-- Edit Event Modal -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>
            <span class="headline">일정 수정</span>
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="editEventForm.eventType"
              :items="eventTypes"
              label="이벤트 타입"
            ></v-select>
            <v-menu
              v-model="menuEdit"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="editEventForm.eventDate"
                  label="이벤트 날짜"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="editEventForm.eventDate" @input="menuEdit = false"></v-date-picker>
            </v-menu>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updateEventDate">수정</v-btn>
            <v-btn @click="editDialog = false">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        eventDates: [],  // List of all event dates
        eventTypes: ["급여일 관리", "인사평가 관리"],  // Event types
        newEvent: { eventType: "", eventDate: "" },  // Data for new event
        editEventForm: { id: null, eventType: "", eventDate: "" },  // Data for editing an event
        menu: false,
        menuEdit: false,
        editDialog: false,
      };
    },
    methods: {
      // Fetch all event dates from the backend
      async fetchEventDates() {
        try {
          const response = await axios.get("/eventDate/getAll");
          this.eventDates = response.data;
        } catch (error) {
          console.error("Failed to fetch event dates:", error);
        }
      },
  
      // Create a new event date
      async createEventDate() {
        try {
          const payload = {
            eventType: this.newEvent.eventType,
            eventDate: this.newEvent.eventDate
          };
          const response = await axios.post("/eventDate/setDate", payload);
          this.eventDates.push(response.data);
          this.newEvent = { eventType: "", eventDate: "" };  // Clear input fields
        } catch (error) {
          console.error("Failed to create event date:", error);
        }
      },
  
      // Open dialog to edit an event date
      editEvent(event) {
        this.editEventForm = { ...event };  // Pre-fill the form with the event data
        this.editDialog = true;
      },
  
      // Update the selected event date
      async updateEventDate() {
        try {
          const payload = {
            eventType: this.editEventForm.eventType,
            eventDate: this.editEventForm.eventDate,
          };
          await axios.put(`/eventDate/updateDate/${this.editEventForm.id}`, payload);
          this.fetchEventDates();
          this.editDialog = false;
        } catch (error) {
          console.error("Failed to update event date:", error);
        }
      },
  
      // Delete an event date
      async deleteEvent(eventId) {
        try {
          await axios.delete(`/eventDate/delete/${eventId}`);
          this.fetchEventDates();
        } catch (error) {
          console.error("Failed to delete event date:", error);
        }
      },
    },
    mounted() {
      this.fetchEventDates();  // Fetch the event dates when the component is mounted
    },
  };
  </script>
  
  <style scoped>
  .tree-container {
    margin-top: 30px;
  }
  </style>
  