<template>
  <v-container class="container">

    <v-tabs v-model="selectedTab" align-with-title background-color="grey lighten-3"
      style="margin-top: 30px;box-shadow: 0px 4px 4px -2px #F2F2F2;">
      <!-- 차량 예약 탭 -->
      <v-tab @click="goToAdminApprovalChange" class="text-body-1">
        관리자조회
      </v-tab>

    </v-tabs>

    <!-- 관리자 예약 승인/거절 화면 -->
    <v-tabs-items v-model="selectedTab">
      <!-- 차량 예약 승인/거절 탭 내용 -->

      <v-row justify="center" class="mb-5" style="padding-top:20px;">
        <h1 style="margin-top:30px; margin-bottom:10px">예약 요청 목록</h1>
      </v-row>

      <v-row justify="end">
        <v-btn v-list @click="this.$router.push('/reservation/reservationList')" style="box-shadow: none;">
          돌아가기
        </v-btn>
      </v-row>

      <v-row justify="center" class="mt-4">
        <v-col cols="12">

          <v-row class="mb-2 text-center"
            style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:600;">
            <v-col cols="1"><strong>번호</strong></v-col>
            <v-col cols="2"><strong>차량 번호</strong></v-col>
            <v-col cols="2"><strong>차량 종류</strong></v-col>
            <v-col cols="2"><strong>예약자</strong></v-col>
            <v-col cols="2"><strong>예약 상태</strong></v-col>
            <v-col cols="3"><strong>승인/거절</strong></v-col>
          </v-row>

          <v-row justify="center" class="mt-4">
  <v-col cols="12">
    <!-- 예약 목록 -->
    <v-row v-for="(reservation, index) in reservations" :key="reservation.reservationId"
      style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500" class="text-center">
      <v-col cols="1">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</v-col>
      <v-col cols="2">{{ reservation.carNum }}</v-col>
      <v-col cols="2">{{ reservation.carType }}</v-col>
      <v-col cols="2">{{ reservation.userName }}</v-col>
      <v-col cols="2">
        <v-chip v-if="reservation.status === 'WAITING'" color="gray">
          대기중
        </v-chip>
        <v-chip v-else color="green">
          승인 완료
        </v-chip>
      </v-col>
      <v-col cols="3">
        <v-btn v-approve v-if="reservation.status === 'WAITING'" color="green"
          @click="approveReservation(reservation.reservationId)">
          승인
        </v-btn>
        <v-btn v-reject v-if="reservation.status === 'WAITING'" color="red"
          @click="rejectReservation(reservation.reservationId)">
          거절
        </v-btn>
        <span v-else></span>
      </v-col>
    </v-row>
    
    <!-- 페이징 컴포넌트 -->
    <v-pagination
      v-model="currentPage"
      :length="totalPages"
      :total-visible="5"
      @input="onPageChange"
      class="my-4"
    ></v-pagination>
  </v-col>
</v-row>

        </v-col>
      </v-row>


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
    currentPage: 1, // 현재 페이지
    itemsPerPage: 10, // 페이지당 항목 수
    totalPages: 1, // 총 페이지 수
  };
},

watch: {
    currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchReservations();
    },
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
      params: {
        page: this.currentPage - 1, // 페이지 번호 (0부터 시작)
        size: this.itemsPerPage // 페이지당 항목 수
      }
    });
    this.reservations = response.data.content; // 페이징된 예약 목록
    this.totalPages = response.data.totalPages; // 전체 페이지 수 업데이트
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

    onPageChange(page) {
  this.currentPage = page;
  this.fetchReservations();
},

  },

  mounted() {
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
  border: 1px solid #D8EACA;
}

.v-btn {
  margin: 0 10px;
}
</style>