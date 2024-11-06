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

    <v-row justify="end">
      <!-- 장기 예약  -->
      <v-btn v-create @click="openLongTermReservationModal">
        예약하기
      </v-btn>
      <v-btn v-list v-if="isHrAdmin" @click="goToAdminPage" style="box-shadow: none;">
        예약 요청 목록
      </v-btn>
    </v-row>

    <!-- 필터 모달창 (당일 예약된 차량만 표시) -->
    <v-dialog v-model="isFilterModalOpen" max-width="500px">
      <v-card>
        <v-card-title>당일 예약된 차량</v-card-title>
        <v-card-text>
          <!-- reservedVehicles가 비어 있지 않은지 확인 -->
          <v-list v-if="reservedVehicles.length">
            <v-list-item v-for="vehicle in reservedVehicles" :key="vehicle.carId">
              <v-list-item-content>
                <v-list-item-title>{{ vehicle.carType }} - {{ vehicle.carNum }}</v-list-item-title>
                <v-list-item-subtitle>{{ vehicle.userName }}님 예약 중</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <div v-else>당일 예약된 차량이 없습니다.</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="isFilterModalOpen = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    
    <!-- 현재 탭에 대한 내용 -->
    <v-tabs-items v-model="selectedTab">
      <!-- 차량 예약 탭 내용 -->
      <v-tab-item>

        <v-row>
          <v-col>
            <!-- <h3 style="margin: px;">차량 예약 내역</h3> -->
            <br>

            <!-- 테이블 헤더 -->
            <v-row class="mb-2"
              style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:400;">
              <v-col cols="1"><strong></strong></v-col>
              <v-col cols="3"><strong>종류</strong></v-col>
              <v-col cols="3"><strong>차량번호</strong></v-col>

              <v-col cols="3"><strong>예약상태</strong></v-col>
              <v-col cols="2"><strong>예약자</strong></v-col>
            </v-row>

            <!-- 차량 리스트 -->
            <v-row v-for="vehicle in vehicles" :key="vehicle.carId" class="vehicle-row"
              :class="{ 'reserved-vehicle': vehicle.status === 'RESERVED' }" outlined
              style="border-bottom:1px solid #E7E4E4; padding:4px; font-weight:500;">

              <v-col cols="1" class="d-flex align-center justify-center" @click="openCarModal(vehicle)">{{ vehicle.carId
                }}
              </v-col>

              <!-- 차량 종류 -->
              <v-col cols="3" class="d-flex align-center justify-center">{{ vehicle.carType }}</v-col>

              <!-- 차량 번호 -->
              <v-col cols="3" class="d-flex align-center justify-center">{{ vehicle.carNum }}</v-col>

              <v-col cols="3">
                <v-btn v-if="vehicle.status === 'AVAILABLE'" color="green" @click="createReservation(vehicle.carId)"
                  class="btnNoOk">
                  예약 가능
                </v-btn>
                <v-btn variant="outlined" v-else style="background-color: #665f54" color="white" class="btnNoOk">
                  예약 불가
                </v-btn>
              </v-col>

              <v-col cols="2" class="d-flex align-center justify-center" style="position: relative;">
                <v-row class="d-flex align-center justify-center">
                  {{ vehicle.departmentName }} {{ vehicle.userName }}
                </v-row>
              </v-col>
            </v-row>


          </v-col>
        </v-row>

        <!-- 차량 상세 정보 모달창 -->
        <v-dialog v-model="isCarModalOpen" persistent max-width="400px">
          <v-card class="car-detail-card">
            <!-- 차량 이미지 최상단에 배치, 이미지 없을 때도 고정 크기 유지 -->
            <v-img :src="selectedCar.carImage || 'https://via.placeholder.com/600x200?text=No+Image+Available'"
              alt="차량 이미지" height="200px" max-height="200px" contain class="car-image"></v-img>

            <v-card-title class="text-center car-title">
              <span>{{ selectedCar.carType }} ({{ selectedCar.carNum }})</span>
            </v-card-title>

            <v-card-text class="car-details" style="align-align: center;">
              <v-row align="center" justify="center">
                <v-col class="d-flex align-center justify-center car-spec">
                  <v-icon left>mdi-seat</v-icon>
                  <span>{{ selectedCar.carSeat }} 인승</span>
                </v-col>
                <v-col class="d-flex align-center justify-center car-spec">
                  <v-icon left>mdi-engine-outline</v-icon>
                  <span>{{ selectedCar.carEngine }}L</span>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="car-actions">
              <v-spacer></v-spacer>
              <v-btn class="close-btn" text @click="isCarModalOpen = false">닫기</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>



        <!-- 차량 예약 모달창 -->
        <v-dialog v-model="isLongTermReservationModalOpen" persistent max-width="500px">
          <v-card>
            <v-card-title>
              <span>차량 예약</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form">
                <!-- 차량 선택 -->
                <v-select v-model="selectedVehicle"
                  :items="vehicles.map(vehicle => ({ title: `${vehicle.carType} (${vehicle.carNum})`, value: vehicle.carId }))"
                  label="차량 선택" required></v-select>


                <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="startDate" label="시작 일자" type="date" v-bind="attrs" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="startDate" @input="menuStart = false"></v-date-picker>
                </v-menu>

                <!-- 끝 날짜 선택 -->
                <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="endDate" label="종료 일자" type="date" v-bind="attrs" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="endDate" @input="menuEnd = false"></v-date-picker>
                </v-menu>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn class="custom-create-register-btn" text @click="submitLongTermReservation">예약</v-btn>
              <v-btn class="custom-write-btn" text @click="isLongTermReservationModalOpen = false">취소</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";

export default {
  data() {
    return {
      selectedTab: 1, // 탭 상태: 0이 차량 예약, 1이 회의실 예약
      selectedDate: new Date(), // 오늘 날 기본
      vehicles: [], // 차량 데이터

      isCarModalOpen: false,
      selectedCar: {}, // 선택된 차량 정보

      isLongTermReservationModalOpen: false, // 장기 예약 모달 상태
      startDate: null, // 장기 예약 시작 날짜
      endDate: null, // 장기 예약 끝 날짜
      selectedVehicle: null, // 선택된 차량
      menuStart: false,
      menuEnd: false,
      isFilterModalOpen: false, // 필터 모달 상태
      isInfoVisible: false, // 정보 표시 여부
      selectedVehicleInfo: null,
    };
  },
  computed: {
    reservedVehicles() {
      return this.vehicles.filter(vehicle => vehicle.status === 'RESERVED');
    },
    isHrAdmin() {
      const departmentId = localStorage.getItem('departmentId');
      return departmentId === "4";
    },
  },
  methods: {
    toggleVehicleInfo(vehicle) {
      if (this.isInfoVisible && this.selectedVehicleInfo?.carId === vehicle.carId) {
        // 이미 같은 차량 정보가 표시 중일 때는 숨김
        this.isInfoVisible = false;
        this.selectedVehicleInfo = null;
      } else {
        // 새로운 차량 정보 표시
        this.isInfoVisible = true;
        this.selectedVehicleInfo = vehicle;
      }
    },

    openFilterModal() {
      console.log("reservedVehicles:", this.reservedVehicles); // reservedVehicles 데이터 출력
      this.isFilterModalOpen = true;
    },

    ...mapActions(["setUserAllInfoActions"]), // 사용자 정보를 Vuex에 저장하는 액션 호출

    formattedDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      // const weekDay = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
      return `${year}-${month}-${day}`;
    },

    async fetchCarList() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/car/list`);
        console.log(response.data);
        this.vehicles = response.data;
      } catch (error) {
        console.error("Error fetching car list:", error);
      }
    },

    openCarModal(vehicle) {
      console.log("선택된 차량:", vehicle);
      this.selectedCar = vehicle;
      this.isCarModalOpen = true;
    },

    async fetchVehicleAvailability(date) {
      try {
        const token = localStorage.getItem("token");
        const formattedDate = date.toISOString().split("T")[0];
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
        console.error("차량 정보 파싱 중 오류 발생 :", error);
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
        const user = response.data;
        console.log('내이름은 :', user);
        this.userName = response.data.name;
        this.setUserAllInfoActions();
      } catch (error) {
        console.error("유저정보를 파싱 중 에러 발생 :", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        }
      }
    },
    // 차량 예약 메서드 추가
    async createReservation(carId) {
      const reservationData = {
        carId: carId,
        startDate: this.selectedDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
        endDate: this.selectedDate.toISOString().split('T')[0] // 같은 날짜로 설정
      };
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/reservation/car/create`,
          reservationData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert(`${this.userName} 님 차량 예약을 완료했습니다.`);
        this.fetchVehicleAvailability(this.selectedDate); // 예약 후 차량 상태 새로고침
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

    // 입력하는 예약을 위한 모달
    openLongTermReservationModal() {
      this.isLongTermReservationModalOpen = true;
    },

    // 입력하는 예약 제출
    async submitLongTermReservation() {
      if (!this.startDate || !this.endDate || !this.selectedVehicle) {
        alert("모든 필드를 선택해 주세요.");
        return;
      }

      // 예약 데이터를 서버로 전송
      const reservationData = {
        carId: this.selectedVehicle,
        startDate: this.startDate,
        endDate: this.endDate,
      };

      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/reservation/car/create`,
          reservationData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("예약이 완료되었습니다.");
        this.isLongTermReservationModalOpen = false;
      } catch (error) {
        console.error("Error creating reservation:", error);
        alert("예약 중 오류가 발생했습니다.");
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
    goToVehicleReservation() {
      this.selectedTab = 1;
    },
    goToMeetingRoomReservation() {
      this.$router.push("/reservation/meetReservationList"); // 회의실 예약 페이지로 라우팅
    },
    goToAdminPage() {
      this.$router.push("/reservation/adminCarResList"); // 관리자 페이지로 이동
    },
  },
  mounted() {
    this.fetchUserInfo(); // 컴포넌트가 마운트될 때 유저 정보를 가져옴
    this.fetchVehicleAvailability(new Date()); // 차량 예약 상태를 가져옴
    this.fetchCarList();
    document.addEventListener("click", this.hideVehicleInfo);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.hideVehicleInfo);
  }
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

}

.v-btn {
  margin: 0 10px;
}

.vehicle-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.vehicle-row:hover {
  background-color: #f0f0f0;
}

.mb-2 {
  margin-bottom: 20px;
}

.v-row {
  text-align: center;
}

.btnNoOk {
  padding: 10px 20px !important;
  text-align: center !important;
  cursor: pointer !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  font-size: 14px !important;
}

.reserved-vehicle {
  opacity: 0.5;
  /* 투명도 설정 */
}

.custom-create-register-btn {
  text-align: center !important;
  cursor: pointer !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  margin: 20px 0px !important;
  background-color: #a52403 !important;
  color: white !important;
  font-size: 14px !important;
  box-shadow: none !important;
  margin-left: 10px;
  font-weight: bold;
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


.car-detail-card {
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.car-image {
  border-radius: 12px;
  margin-bottom: 10px;
}

.car-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  margin-bottom: 15px;
}

.car-details {

  padding: 10px 0;
  font-size: 16px;
  color: #555;
}

.car-spec {
  font-weight: BOLD;
  color: #444;
  font-size: 15px;
}

.car-actions {
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.close-btn {
  background-color: #a52403 !important;
  color: white !important;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
}
</style>
