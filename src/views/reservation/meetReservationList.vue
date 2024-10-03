<template>
  <v-container fluid class="timeline-container">
    <!-- 상단에 탭을 추가하여 차량 예약과 회의실 예약을 구분 -->
    <v-tabs v-model="selectedTab" align-with-title background-color="grey lighten-3">
      <v-tab @click="goToVehicleReservation" class="text-body-1">
        법인차량 예약
      </v-tab>

      <v-tab @click="goToMeetingRoomReservation" class="text-body-1">
        회의실 예약
      </v-tab>
    </v-tabs>

    <!-- 날짜 선택 버튼들 -->
    <v-row justify="center" class="my-3">
      <v-btn @click="prevDay" icon>
        <v-icon>mdi-chevron-left</v-icon> <!-- Left arrow icon -->
      </v-btn>

      <h2>{{ formattedDate(selectedDate) }}</h2>

      <v-btn @click="nextDay" icon>
        <v-icon>mdi-chevron-right</v-icon> <!-- Right arrow icon -->
      </v-btn>

      <v-btn @click="setToday">오늘</v-btn>

      <!-- 예약 추가 버튼 -->
      <v-btn color="primary" @click="openReservationDialog">
        예약 추가
        <v-icon right>mdi-calendar-plus</v-icon>
      </v-btn>
    </v-row>

    <!-- 타임 테이블 -->
    <v-row class="hours-row">
      <v-col cols="1">
        <div class="header-cell"></div>
      </v-col>
      <v-col cols="11">
        <v-row>
          <div v-for="(hour, index) in timeSlots" :key="index" class="hour-label">
            {{ displayHourLabel(hour, index) }}
          </div>
        </v-row>
      </v-col>
    </v-row>

    <!-- 회의실별 타임라인 -->
    <v-row v-for="(room, index) in meetingRooms" :key="index" class="day-row">
      <v-col cols="1">
        <div class="day-label">{{ room.name }}</div>
      </v-col>
      <v-col cols="11">
        <v-row class="timeline-row">
          <div v-for="slot in timeSlots" :key="slot" class="timeline-bar">
            <v-progress-linear
              height="50"
              :color="getTimeColor(room.id, slot)"
              class="timeline-progress"
              :value="100"
              style="width: 100%; padding: 0; margin: 0;"
            ></v-progress-linear>
          </div>
        </v-row>
      </v-col>
    </v-row>

    <!-- 예약 모달 -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          회의실 예약
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <!-- 회의실 선택 -->
            <v-select
              v-model="selectedMeetingRoom"
              :items="meetingRooms"
              item-text="name"
              item-value="id"
              label="회의실 선택"
              required
            ></v-select>

            <!-- 시작 날짜 선택 -->
            <v-row>
              <v-col>
                <v-date-picker v-model="startDate" label="예약 시작 날짜" />
              </v-col>
            </v-row>

            <!-- 시작 시간 선택 -->
            <v-row>
              <v-col>
                <v-text-field
                  v-model="startHour"
                  label="시작 시간 (시)"
                  type="number"
                  :min="0"
                  :max="23"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-select
                  v-model="startMinute"
                  :items="[0, 30]"
                  label="시작 시간 (분)"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <!-- 종료 시간 선택 -->
            <v-row>
              <v-col>
                <v-text-field
                  v-model="endHour"
                  label="종료 시간 (시)"
                  type="number"
                  :min="0"
                  :max="23"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-select
                  v-model="endMinute"
                  :items="[0, 30]"
                  label="종료 시간 (분)"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">취소</v-btn>
          <v-btn color="blue darken-1" text @click="submitReservation">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 사용자 예약 내역 표시 -->
    <br>
    <br>
    <v-row>
      <v-col>
        <h3>내 예약 내역</h3>
        <br>
        
        <v-data-table
          :headers="reservationHeaders"
          :items="userReservations"
          class="elevation-1"
        >
          <template v-slot:items="{ item }">
            <tr>
              <td>{{ item.meetingRoom ? item.meetingRoom.name : '회의실 정보 없음' }}</td>
              <td>{{ item.startTime }} 시작 시간 </td>
              <td>{{ item.endTime }}</td>
              <td>{{ item.status }}</td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
  data() {
    return {
      selectedTab: 1,
      selectedDate: new Date(),
      meetingRooms: [],
      reservations: [],
      userReservations: [], // 사용자 예약 내역을 저장할 배열
      timeSlots: this.generateTimeSlots(),
      dialog: false,
      selectedMeetingRoom: null,
      startDate: new Date(), // 시작 날짜
      startHour: null,
      startMinute: null,
      endHour: null,
      endMinute: null,
      valid: true,
    };
  },
  methods: {
    formattedDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    generateTimeSlots() {
      const slots = [];
      let start = moment("08:00", "HH:mm");
      let end = moment("19:00", "HH:mm");

      while (start <= end) {
        slots.push(start.format("HH:mm"));
        start = start.add(30, "minutes");
      }

      return slots;
    },
    async fetchMeetingRoomAvailability() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/meeting-room/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.meetingRooms = response.data.map(room => ({
          id: room.id,
          name: room.name
        }));
        console.log('회의실 목록:', this.meetingRooms);
      } catch (error) {
        console.error("회의실 정보 불러오는 중 오류 발생:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },
    async fetchReservations() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/reservation/meet/by-date`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            date: this.formattedDate(this.selectedDate),
          },
        });
        this.reservations = response.data;
      } catch (error) {
        console.error("예약 정보를 불러오는 중 오류 발생:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },
    async fetchUserReservations() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/reservation/meet/my-reservations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.userReservations = response.data; // 사용자 예약 내역 업데이트
      } catch (error) {
        console.error("사용자 예약 정보를 불러오는 중 오류 발생:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },
    isReserved(roomId, timeSlot) {
      return this.reservations.some(
        (reservation) =>
          reservation.meetingRoomId === roomId &&
          moment(timeSlot, "HH:mm").isBetween(reservation.startTime, reservation.endTime, null, "[)")
      );
    },
    getTimeColor(roomId, timeSlot) {
      return this.isReserved(roomId, timeSlot) ? "#4CAF50" : "#f5f5f5";
    },
    displayHourLabel(hour, index) {
      return index % 2 === 0 ? parseInt(hour, 10) : '';
    },
    setToday() {
      this.selectedDate = new Date();
      this.fetchReservations();
      this.fetchUserReservations(); // 오늘 날짜의 예약 내역도 업데이트
    },
    nextDay() {
      const nextDay = new Date(this.selectedDate);
      nextDay.setDate(this.selectedDate.getDate() + 1);
      this.selectedDate = nextDay;
      this.fetchReservations();
      this.fetchUserReservations(); // 다음 날짜의 예약 내역도 업데이트
    },
    prevDay() {
      const prevDay = new Date(this.selectedDate);
      prevDay.setDate(this.selectedDate.getDate() - 1);
      this.selectedDate = prevDay;
      this.fetchReservations();
      this.fetchUserReservations(); // 이전 날짜의 예약 내역도 업데이트
    },
    goToVehicleReservation() {
      this.$router.push("/reservation/reservationList");
    },
    openReservationDialog() {
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    async submitReservation() {
      try {
        const token = localStorage.getItem("token");
        const userNum = localStorage.getItem("userNum");

        if (!userNum) {
          console.error("userNum가 없습니다. 로그인 후 다시 시도해 주세요.");
          alert("로그인 후 예약을 시도해 주세요.");
          return;
        }

        // 사용자가 선택한 날짜와 시간을 조합
        const startTime = moment(`${this.startDate.getFullYear()}-${String(this.startDate.getMonth() + 1).padStart(2, '0')}-${String(this.startDate.getDate()).padStart(2, '0')}T${String(this.startHour).padStart(2, '0')}:${String(this.startMinute).padStart(2, '0')}`).format('YYYY-MM-DDTHH:mm:ss');
        const endTime = moment(`${this.startDate.getFullYear()}-${String(this.startDate.getMonth() + 1).padStart(2, '0')}-${String(this.startDate.getDate()).padStart(2, '0')}T${String(this.endHour).padStart(2, '0')}:${String(this.endMinute).padStart(2, '0')}`).format('YYYY-MM-DDTHH:mm:ss');

        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/reservation/meet/create`, {
          meetingRoomId: this.selectedMeetingRoom,
          startTime: startTime,
          endTime: endTime,
          userNum: userNum
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        this.dialog = false;
        this.fetchReservations(); 
        this.fetchUserReservations(); // 예약 생성 후 사용자 예약 목록 업데이트
      } catch (error) {
        if (error.response) {
          console.error("서버 응답 오류:", error.response.data);
        } else {
          console.error("예약 생성 중 오류 발생:", error.message);
        }
      }
    },
  },
  mounted() {
    this.fetchMeetingRoomAvailability();
    this.fetchUserReservations(); // 컴포넌트 마운트 시 사용자 예약 내역 가져오기
  },
};
</script>

<style scoped>
.timeline-container {
  background-color: white;
  border: solid 1px;
  border: 1px solid #D8EACA;
}

.hours-row {
  margin-bottom: 0;
}

.hour-label {
  width: calc(100% / 24);
  text-align: center;
  background-color: #d4d4d4;
  border: 1px solid #B9B9B9;
  padding: 10px;
  margin-bottom: -12px;
}

.day-label {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  margin-bottom: -10px;
}

.timeline-row {
  display: flex;
  flex-wrap: nowrap;
}

.timeline-bar {
  width: calc(100% / 24);
  padding: 0;
  height: 50px;
  border: 1px solid #B9B9B9;
  margin: 0;
  opacity: 0.7;
}

.v-progress-linear {
  height: 50px;
  padding: 0;
}

.reserved-slot {
  background-color: #a3dca3;
  padding: 5px;
  height: 50px;
  border-radius: 4px;
  text-align: center;
}

.available-slot {
  background-color: #f5f5f5;
  height: 50px;
  text-align: center;
}
</style>
