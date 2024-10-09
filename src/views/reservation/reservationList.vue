<template>
  <v-container fluid>
    <!-- 상단에 탭을 추가하여 차량 예약과 회의실 예약을 구분 -->
    <v-row justify="space-between">
      <v-tabs v-model="selectedTab" align-with-title background-color="grey lighten-3">
        <!-- 차량 예약 탭 -->
        <v-tab @click="goToVehicleReservation" class="text-body-1">
          법인 차량 예약
        </v-tab>

        <!-- 회의실 예약 탭 -->
        <v-tab @click="goToMeetingRoomReservation" class="text-body-1">
          회의실 예약
        </v-tab>
      </v-tabs>

      <!-- 오른쪽 상단에 관리자 전용 아이콘 추가 (인사팀인 경우에만 표시) -->
      <v-btn v-if="isHrDepartment" icon @click="goToAdminPage">
        <v-icon>mdi-cog</v-icon> <!-- 톱니바퀴 아이콘 -->
      </v-btn>
    </v-row>

    <!-- 현재 탭에 대한 내용 -->
    <v-tabs-items v-model="selectedTab">
      <!-- 차량 예약 탭 내용 -->
      <v-tab-item>
        <v-container fluid>
          <v-row justify="center" class="mb-5">
            <!-- Left Arrow Button for Previous Day -->
            <v-btn @click="prevDay" icon>
              <v-icon>mdi-chevron-left</v-icon> <!-- Left arrow icon -->
            </v-btn>

            <!-- Date Display -->
            <h2>{{ formattedDate(selectedDate) }}</h2>

            <!-- Right Arrow Button for Next Day -->
            <v-btn @click="nextDay" icon>
              <v-icon>mdi-chevron-right</v-icon> <!-- Right arrow icon -->
            </v-btn>

            <!-- Button to Set Today's Date -->
            <v-btn @click="setToday">오늘</v-btn>
          </v-row>

          <!-- Vehicle Availability Table -->
          <v-table>
            <thead>
              <tr>
                <th>종류</th>
                <th>차량 종류</th>
                <th>예약 상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vehicle in vehicles" :key="vehicle.carId">
                <td>{{ vehicle.carType }}</td>
                <td>{{ vehicle.carNum }}</td>
                <td>
                  <v-btn v-if="vehicle.status === 'AVAILABLE'" color="green" @click="createReservation(vehicle.carId)">
                    예약 가능
                  </v-btn>
                  <v-btn v-else color="red">
                    예약 불가
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      selectedTab: 0, // 탭 상태: 0이 차량 예약, 1이 회의실 예약
      selectedDate: new Date(), // Default to today's date
      vehicles: [], // 차량 데이터
      userName: "", // 사용자 이름
    };
  },
  computed: {
    ...mapGetters({
      departmentId: "getDepartmentId", // Vuex에서 departmentId 가져오기
    }),
    isHrDepartment() {
      // 인사팀이면 true를 반환
      return this.departmentId === "4"; // '4'가 인사팀의 departmentId라고 가정
    }
  },
  methods: {
    ...mapActions(["setUserAllInfoActions"]), // 사용자 정보를 Vuex에 저장하는 액션 호출
    formattedDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const weekDay = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
      return `${year}-${month}-${day} (${weekDay})`;
    },
    async fetchVehicleAvailability(date) {
      try {
        const token = localStorage.getItem("token");
        const formattedDate = date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/reservation/allcar/day`,
          {
            params: { date: formattedDate },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.vehicles = response.data;
      } catch (error) {
        console.error("Error fetching vehicle availability:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem("token");
        const userNum = localStorage.getItem("userNum");
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.userName = response.data.name; // 사용자 이름 저장
        this.setUserAllInfoActions(); // Vuex에 사용자 정보 저장
      } catch (error) {
        console.error("Error fetching user info:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },
    goToAdminPage() {
      // 관리자 페이지로 이동
      this.$router.push("/reservation/adminCarResList");
    },
    async createReservation(carId) {
      try {
        const token = localStorage.getItem("token");

        // 예약 생성 요청을 보낼 데이터 (현재 날짜로 예약)
        const reservationData = {
          carId: carId,
          startDate: this.selectedDate.toISOString().split("T")[0], // 현재 선택된 날짜
        };

        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/reservation/car/create`,
          reservationData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 예약 성공 시 사용자에게 알림
        alert(`${this.userName} 님 차량 예약을 완료했습니다.`);

        // 차량 상태 업데이트
        this.fetchVehicleAvailability(this.selectedDate);
      } catch (error) {
        console.error("Error creating reservation:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        } else {
          alert("예약 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }
      }
    },
    setToday() {
      this.selectedDate = new Date();
      this.fetchVehicleAvailability(this.selectedDate);
    },
    nextDay() {
      const nextDay = new Date(this.selectedDate);
      nextDay.setDate(this.selectedDate.getDate() + 1);
      this.selectedDate = nextDay;
      this.fetchVehicleAvailability(this.selectedDate);
    },
    prevDay() {
      const prevDay = new Date(this.selectedDate);
      prevDay.setDate(this.selectedDate.getDate() - 1);
      this.selectedDate = prevDay;
      this.fetchVehicleAvailability(this.selectedDate);
    },
    // 차량 예약 페이지로 이동하는 함수
    goToVehicleReservation() {
      this.selectedTab = 0;
      // 필요하면 추가 로직 작성 가능
    },
    // 회의실 예약 페이지로 이동하는 함수
    goToMeetingRoomReservation() {
      this.$router.push("/reservation/meetReservationList"); // 회의실 예약 페이지로 라우팅
    },
  },
  mounted() {
    this.fetchUserInfo(); // 컴포넌트가 마운트될 때 유저 정보를 가져옴
    this.fetchVehicleAvailability(this.selectedDate); // 차량 예약 상태를 가져옴
  },
};
</script>

<style scoped>
.v-btn {
  margin: 0 10px;
}
</style>
