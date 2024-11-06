meetReservation

<template>
  <v-container class="container">
    <!-- 상단에 탭을 추가하여 차량 예약과 회의실 예약을 구분 -->
    <v-tabs v-model="selectedTab" align-with-title background-color="grey lighten-3"
      style="margin-top: 30px;box-shadow: 0px 4px 4px -2px #F2F2F2;">
      <v-tab @click="goToMeetingRoomReservation" class="text-body-1">
        회의실예약
      </v-tab>
      <v-tab @click="goToVehicleReservation" class="text-body-1">
        법인차량예약
      </v-tab>

    </v-tabs>

    <!-- 날짜 선택 버튼들 -->
    <v-row style="margin-top:20px; margin-right: 70px;" align="center" justify="center" display="flex">
        <!-- 날짜 선택 아이콘 -->
        <v-btn @click="setToday" style="box-shadow: none; font-weight: bold; letter-spacing: -0.5px;" align="center">
          Today
        </v-btn>
        <v-btn @click="prevDay" icon style="box-shadow: none;">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <h2 style="font-size: 25px;">{{ formattedDate(selectedDate) }}</h2>
        <v-btn @click="nextDay" icon style="box-shadow: none; ">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
    </v-row>
    
    <!-- <v-row style="margin-top:20px;">
      <v-col cols="3"></v-col>
      <v-col cols="2" class="d-flex align-center" justify-center> -->
        <!-- 날짜 선택 아이콘 -->
        <!-- <v-btn icon @click="openDatePicker" style="box-shadow: none">
          <v-icon>mdi-calendar</v-icon>
        </v-btn>
        <v-btn @click="setToday" style="box-shadow: none; font-weight: bold; letter-spacing: -0.5px;">
          Today
        </v-btn>
        <v-btn @click="prevDay" icon style="box-shadow: none;">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="2" class="text-center">
        <h2 style="font-size: 25px;">{{ formattedDate(selectedDate) }}</h2>
      </v-col>

      <v-col cols="1">
        <v-btn @click="nextDay" icon style="box-shadow: none;">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-col> -->
      <!-- 장기 예약 버튼 -->
      <!-- <v-btn class="ml-2" @click="openLongTermReservationModal" color="primary" outlined>장기 예약</v-btn> -->
    <!-- </v-row> -->

    <v-row justify="end">
      <!-- 예약 추가 버튼 -->
      <v-col cols="3" class="text-right" style="margin-left:6%;">
        <v-btn color="rgb(154, 47, 47)" @click="openReservationDialog"
          style="box-shadow: none; margin-right: 14%;font-weight: bold; border-radius: 10px">
          예약하기
        </v-btn>
      </v-col>

      <v-btn v-create v-if="isAdmin" @click="createNewPost">
        작성하기
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
            <v-progress-linear height="50" :color="isReserved(room.id, slot) ? 'blue darken-2' : 'white'"
              class="timeline-progress" :value="100" @click="handleSlotClick(room.id, slot)"
              style="width: 100%; padding: 0; margin: 0; opacity: 1 !important; background-color: none;"></v-progress-linear>
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
            <v-select v-model="selectedMeetingRoom" :items="meetingRooms" item-title="name" item-value="id"
              label="회의실 선택" required></v-select>

            <!-- 시작 날짜 선택 -->
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="startDate" label="예약 시작 날짜" type="date" required />
              </v-col>
            </v-row>

            <!-- 시작 시간 선택 -->
            <v-row>
              <v-col>
                <v-text-field v-model="startHour" label="시작 시간 (시)" type="number" :min="0" :max="23"
                  hint="0시에서 23시 사이의 시간을 입력하세요." persistent-hint required></v-text-field>
              </v-col>
              <v-col>
                <v-select v-model="startMinute" :items="[0, 30]" label="시작 시간 (분)" required></v-select>
              </v-col>
            </v-row>

            <!-- 종료 시간 선택 -->
            <v-row>
              <v-col>
                <v-text-field v-model="endHour" label="종료 시간 (시)" type="number" :min="0" :max="23"
                  hint="0시에서 23시 사이의 시간을 입력하세요." persistent-hint required>
                </v-text-field>
              </v-col>
              <v-col>
                <v-select v-model="endMinute" :items="[0, 30]" label="종료 시간 (분)" required></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-create text @click="submitReservation">저장</v-btn>
          <v-btn v-delete text @click="closeDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 사용자 예약 내역 표시 -->

    <v-row>
      <v-col>
        <h2 style="margin-top: 20px; margin-bottom:10px">내 예약 내역</h2>
        <br>

        <!-- 테이블 헤더 -->
        <v-row class="mb-2"
          style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:400;">
          <v-col cols="1"><strong>번호</strong></v-col>
          <v-col cols="2"><strong>회의실</strong></v-col>
          <v-col cols="3"><strong>시작 시간</strong></v-col>
          <v-col cols="3"><strong>종료 시간</strong></v-col>
          <v-col cols="3"><strong>상태</strong></v-col>
        </v-row>

        <!-- 예약 내역 리스트 -->
        <v-row v-for="(item, index) in userReservations" :key="index" class="meetReservation-row" outlined
          style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500" @click="openInviteDialog(item)">
          <v-col cols="1">{{ index + 1 }}</v-col>
          <v-col cols="2">{{ getMeetingRoomName(item.meetingRoomId) }}</v-col>
          <!-- 날짜와 시간만 표시하도록 변경 -->
          <v-col cols="3">{{ formatDateTime(item.startTime) }} </v-col>
          <v-col cols="3">{{ formatDateTime(item.endTime) }}</v-col>
          <v-col cols="3">
            <span v-if="item.status === 'APPROVED'" class="status-approved">
              예약완료
            </span>
            <span v-else>
              {{ item.status }}
            </span>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 예약 정보 모달 -->
    <v-dialog v-model="dialogInfo" max-width="400px">
      <v-card v-if="selectedReservation">
        <v-card-title class="headline"
          style="background-color: #f5f5f5; padding: 20px; font-size: 18px; font-weight: bold;">
          예약정보
        </v-card-title>
        <v-card-text style="padding: 20px;">
          <!-- 프로필 이미지와 예약자 정보 섹션 -->
          <v-row align="center">
            <v-col cols="2">

            </v-col>
            <!-- 프로필 이미지 -->
            <v-col cols="3" style="text-align: left; ">
              <v-avatar size="80" style="box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); margin-left: 10px;">
                <!-- 여기에 margin-left 추가 -->
                <v-img :src="selectedReservation.userProfileImage || defaultProfileImage" alt="프로필 이미지" />
              </v-avatar>
            </v-col>

            <!-- 예약자 정보 -->
            <v-col cols="7" style="display: flex; flex-direction: column; justify-content: center;">
              <div style="margin-bottom: 10px;">
                {{ selectedReservation.userNum }}
              </div>
              <div>
                {{ selectedReservation.userName }}
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>
          <v-row>
            <v-col cols="12">
              <div style="margin-bottom: 10px; margin-left: -70px;"><strong>회의실</strong>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ getMeetingRoomName(selectedReservation.meetingRoomId) }}</div>
              <div style="margin-bottom: 10px;"><strong>시작시간</strong> &nbsp;&nbsp;{{
                formatDateTime(selectedReservation.startTime) }}</div>
              <div><strong>종료시간</strong>&nbsp;&nbsp; {{ formatDateTime(selectedReservation.endTime) }}</div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions style="padding: 15px;">
          <v-spacer></v-spacer>
          <v-btn v-close @click="dialogInfo = false" style="font-weight: bold;">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--  -->


  </v-container>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
  data() {
    return {
      selectedReservation: null,
      selectedTab: 0,
      selectedDate: new Date(),
      meetingRooms: [],
      reservations: [],
      timeSlots: this.generateTimeSlots(),
      userReservations: [],
      dialog: false,
      dialogInfo: false,
      selectedMeetingRoom: null,
      startDate: new Date(),
      startHour: null,
      startMinute: null,
      endHour: null,
      endMinute: null,
      valid: true,

      inviteDialog: false,
      userList: [],
      filteredUsers: [],
      selectedUsers: [],
      searchQuery: '',
      searchType: '이름',
      searchOptions: [
        // { text: '전체', value: 'all' },
        { text: '부서', value: 'department' },
        { text: '직급', value: 'position' },
        { text: '이름', value: 'name' }
      ]
    };
  },
  // computed: {
  //   getSearchLabel() {
  //     switch (this.searchType) {
  //       case 'department':
  //         return '부서명으로 검색';
  //       case 'position':
  //         return '직급으로 검색';
  //       case 'name':
  //         return '이름으로 검색';
  //       default:
  //         return '검색어 입력';
  //     }
  //   },
  // },
  methods: {

    // toggleUserSelection(userNum) {
    //   if (this.selectedUsers.includes(userNum)) {
    //     this.removeUserFromInviteList(userNum);
    //   } else {
    //     this.addUserToInviteList(userNum);
    //   }
    // },
    // async openInviteDialog(reservation) {
    //   this.selectedReservation = reservation;
    //   await this.fetchUserList();
    //   this.inviteDialog = true;
    // },
    async fetchUserList() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.userList = response.data;
        this.filteredUsers = this.userList;
      } catch (error) {
        console.error("유저 목록 불러오기 오류:", error);
      }
    },
    searchUsers() {
      const query = this.searchQuery.toLowerCase();
      if (this.searchType === '전체') {
        this.filteredUsers = this.userList;
      } else if (this.searchType === 'department') {
        this.filteredUsers = this.userList.filter(user => user.departmentName?.toLowerCase().includes(query));
      } else if (this.searchType === 'position') {
        this.filteredUsers = this.userList.filter(user => user.positionName?.toLowerCase().includes(query));
      } else if (this.searchType === 'name') {
        this.filteredUsers = this.userList.filter(user => user.name?.toLowerCase().includes(query));
      }
    },
    addUserToInviteList(userNum) {
      if (!this.selectedUsers.includes(userNum)) {
        this.selectedUsers.push(userNum);
      }
    },
    removeUserFromInviteList(userNum) {
      this.selectedUsers = this.selectedUsers.filter(id => id !== userNum);
    },
    getUserNameById(userNum) {
      const user = this.userList.find(user => user.userNum === userNum);
      return user ? user.name : '';
    },
    async inviteUsers() {
      try {
        if (!this.selectedReservation || !this.selectedReservation.id) {
          alert("예약 정보를 선택해 주세요.");
          return;
        }

        const token = localStorage.getItem("token");
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/reservation/meet/${this.selectedReservation.id}/invite`,
          this.selectedUsers,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.inviteDialog = false;
        this.selectedUsers = [];
        alert("유저가 성공적으로 초대되었습니다.");
      } catch (error) {
        console.error("유저 초대 오류:", error);
      }
    },

    getMeetingRoomName(meetingRoomId) {
      const room = this.meetingRooms.find(room => room.id === meetingRoomId);
      return room ? room.name : '회의실 정보 없음';
    },
    formatDateTime(dateTime) {
      return moment(dateTime).format('YYYY.MM.DD HH:mm');
    },
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
        console.log("예약 데이터:", response.data);  // 예약 데이터 콘솔 출력
        this.reservations = response.data;
      } catch (error) {
        console.error("예약 정보를 불러오는 중 오류 발생:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },

    handleSlotClick(roomId, timeSlot) {
      const selectedDateFormatted = this.formattedDate(this.selectedDate);
      const fullTimeSlot = moment(`${selectedDateFormatted}T${timeSlot}`, "YYYY-MM-DDTHH:mm");

      // 해당 시간에 예약된 회의실과 타임슬롯을 찾아냄
      const reservation = this.reservations.find(reservation => {
        const startTime = moment(reservation.startTime);
        const endTime = moment(reservation.endTime);
        return reservation.meetingRoomId === roomId && fullTimeSlot.isBetween(startTime, endTime, null, "[)");
      });

      if (reservation) {
        this.selectedReservation = reservation;
        this.dialogInfo = true;  // 예약 정보가 있을 때만 모달을 엶
      } else {
        console.log("해당 시간에 예약된 정보가 없습니다.");
      }
    },
    showReservationInfo(reservation) {

      this.dialogInfo = true;  // 모달을 여는 플래그
      this.selectedReservation = reservation;  // 선택된 예약을 저장
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
      // 선택된 날짜를 포함한 full timeSlot 생성
      const selectedDateFormatted = this.formattedDate(this.selectedDate); // 선택된 날짜(예: 2024-10-17)
      const fullTimeSlot = moment(`${selectedDateFormatted}T${timeSlot}`, "YYYY-MM-DDTHH:mm"); // 타임슬롯 시간 포함

      return this.reservations.some(reservation => {
        const startTime = moment(reservation.startTime);
        const endTime = moment(reservation.endTime);

        return reservation.meetingRoomId === roomId && fullTimeSlot.isBetween(startTime, endTime, null, "[)");
      });
    },
    getTimeColor(roomId, timeSlot) {
      return this.isReserved(roomId, timeSlot) ? "blue darken-2 !important" : "white";
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
        if (!this.selectedMeetingRoom) {
          alert("회의실을 선택해 주세요.");
          return;
        }
        if (!userNum) {
          console.error("userNum가 없습니다. 로그인 후 다시 시도해 주세요.");
          alert("로그인 후 예약을 시도해 주세요.");
          return;
        }

        // 날짜 값이 문자열로 들어오므로 이를 Date 객체로 변환
        const selectedStartDate = new Date(this.startDate);
        const selectedEndDate = new Date(this.startDate); // 종료 날짜는 같은 날로 가정
        selectedStartDate.setHours(this.startHour, this.startMinute);
        selectedEndDate.setHours(this.endHour, this.endMinute);

        if (isNaN(selectedStartDate) || isNaN(selectedEndDate)) {
          alert("올바른 날짜 및 시간을 입력해 주세요.");
          return;
        }

        // 시간대 오프셋 적용 (KST는 UTC+9)
        const timezoneOffset = selectedStartDate.getTimezoneOffset() * 60000; // 밀리초로 변환
        const startTime = new Date(selectedStartDate.getTime() - timezoneOffset).toISOString();
        const endTime = new Date(selectedEndDate.getTime() - timezoneOffset).toISOString();

        // 현재 시간과 비교
        const now = new Date();
        if (selectedStartDate < now) {
            alert("과거 시간으로는 예약할 수 없습니다.");
            return;
        }
        // 입력한 시간이 유효한지 체크
        if (isNaN(selectedStartDate) || isNaN(selectedEndDate)) {
          alert("올바른 날짜 및 시간을 입력해 주세요.");
          return;
        }
        // 24시 넘는 경우 처리
        if (this.endHour > 23 || this.endMinute > 59) {
          alert("종료 시간이 24시를 넘을 수 없습니다.");
          return;
        }
        // 종료 시간이 시작 시간보다 빠르면 오류
        if (selectedEndDate < selectedStartDate) {
          alert("종료 시간이 시작 시간보다 빠를 수 없습니다.");
          return;
        }

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
        alert("예약이 성공적으로 완료되었습니다!");
        // 예약이 성공적으로 완료된 후 필드를 초기화
        this.resetFormFields(); // 필드 초기화 함수 호출
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

    // 필드를 초기화하는 메서드 추가
    resetFormFields() {
      this.startDate = null; // 시작 날짜 초기화
      this.startHour = null; // 시작 시간 초기화
      this.startMinute = null; // 시작 분 초기화
      this.endHour = null; // 종료 시간 초기화
      this.endMinute = null; // 종료 분 초기화
      this.selectedMeetingRoom = null; // 회의실 선택 초기화
    },


  },
  mounted() {
    this.fetchMeetingRoomAvailability();
    this.fetchUserReservations(); // 컴포넌트 마운트 시 사용자 예약 내역 가져오기
    this.fetchReservations();
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  border-radius: 12px;
}

.timeline-container {
  background-color: white;
  /* border: solid 1px; */
  /* 외부 선  */
  /* border: 1px solid #D8EACA; */
}

.hours-row {
  margin-bottom: 0;
}

.hour-label {
  width: calc(100% / 24);
  text-align: center;
  background-color: rgba(122, 86, 86, 0.2);
  border: 1px solid #B9B9B9;
  padding: 10px;
  margin-bottom: -12px;
  font-size: 11px;
}

.day-label {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  margin-bottom: -30px;
}

.timeline-row {
  display: flex;
  flex-wrap: nowrap;

}

.v-btn {
  margin: 0 10px;
}

.timeline-bar {
  width: calc(100% / 24);
  padding: 0;
  height: 50px;
  border: 1px solid #B9B9B9;
  margin: 0;
  /* opacity: 0.7; */
}

.v-progress-linear {
  height: 50px;
  padding: 0;
  opacity: 1 !important;
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

.custom-right {
  background-color: #f5f5f5;
  box-shadow: none;
}



.meetReservation-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.meetReservation-row:hover {
  background-color: #f0f0f0;
}

.mb-2 {
  margin-bottom: 20px;
}

.v-row {
  text-align: center;
}



.v-avatar {
  border: 2px solid #ccc;
  /* 프로필 이미지에 테두리 추가 */
  border-radius: 50%;
}

.status-approved {
  background-color: #E0E0E0;
  color: #333333;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}

.selected {
  background-color: rgba(0, 123, 255, 0.1);
}

.selected-chip {
  background-color: #e3f2fd;
}

.custom-write-btn {
  text-align: center !important;
  cursor: pointer !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  /* padding: 10px 20px !important; */
  box-shadow: none !important;
  background-color: rgb(148, 148, 148) !important;
  color: black !important;
  font-size: 14px !important;
  font-weight: bold;
}
</style>