<template>
  <v-container fluid class="timeline-container">

    <v-tabs v-model="selectedTab" align-with-title background-color="grey lighten-3">
      <!-- 차량 예약 탭 -->
        <v-tab @click="goToAdminApprovalChange" class="text-body-1">
          관리자조회
        </v-tab>
      <v-tab @click="goToVehicleReservation" class="text-body-1">
        법인차량예약
      </v-tab>
    </v-tabs>

    <!-- 관리자 예약 승인/거절 화면 -->
    <v-tabs-items v-model="selectedTab">
      <!-- 차량 예약 승인/거절 탭 내용 -->
      <v-tab-item>
        <v-container fluid>
          <v-row justify="center" class="mb-5">
            <h2>예약 요청 목록</h2>
          </v-row>

          <!-- Reservation Approval Table -->
          <v-table>
            <thead>
              <tr>
                <th>차량 번호</th>
                <th>차량 종류</th>
                <th>예약자</th>
                <th>예약 상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reservation in reservations" :key="reservation.reservationId">
                <td>{{ reservation.carNum }}</td>
                <td>{{ reservation.carType }}</td>
                <td>{{ reservation.userName }}</td>
                <td>{{ reservation.status }}</td>
                <td>
                  <v-btn
                  v-approve
                  v-if="reservation.status === 'WAITING'"
                  @click="approveReservation(reservation.reservationId)"
                >
                  승인
                </v-btn>
                <v-btn
                  v-reject
                  v-if="reservation.status === 'WAITING'"
                  @click="rejectReservation(reservation.reservationId)"
                >
                  거절
                </v-btn>
                  <span v-else>{{ reservation.status }}</span>
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

export default {
  data() {
    return {
      selectedTab: 0,
      reservations: [], // 예약 요청 목록
    };
  },
  methods: {
    // 예약 목록 가져오기
    async fetchReservations() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/reservation/car/alllist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.reservations = response.data;
      } catch (error) {
        console.error("예약 목록을 가져오는 중 오류 발생:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },

    // 예약 승인
    async approveReservation(reservationId) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/reservation/car/approve/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("예약이 승인되었습니다.");
        this.fetchReservations(); // 승인 후 목록을 다시 가져옴
      } catch (error) {
        console.error("예약 승인 중 오류 발생:", error);
      }
    },

    // 예약 거절
    async rejectReservation(reservationId) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/reservation/car/reject/${reservationId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("예약이 거절되었습니다.");
        this.fetchReservations();
      } catch (error) {
        console.error("예약 거절 중 오류 발생:", error);
      }
    },

    goToAdminApprovalChange() {
      this.selectedTab = 0;
    },

    goToVehicleReservation() {
      this.$router.push("/reservation/reservationList");
    },
  },

  mounted() {
    this.fetchReservations();
  },
};
</script>
  
<style scoped>
.timeline-container {
  background-color: white;
  /* border: solid 1px; */
  /* 외부 선  */
  border: 1px solid #D8EACA; 
}  
  .v-btn {
    margin: 0 10px;
  }
</style>
  