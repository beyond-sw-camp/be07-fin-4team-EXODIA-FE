<template>
  <v-container fluid class="timeline-container">
    <!-- 상단에 탭을 추가하여 차량 예약과 회의실 예약을 구분 -->
    <v-row justify="space-between">
      <v-tabs v-model="selectedTab" align-with-title background-color="grey lighten-3" style="margin-top: 12px;">
        <!-- 차량 예약 탭 -->
        <v-tab @click="goToVehicleReservation" class="text-body-1">
          법인차량예약
        </v-tab>

        <!-- 회의실 예약 탭 -->
        <v-tab @click="goToMeetingRoomReservation" class="text-body-1" style="margin-left: -9px;">
          회의실예약
        </v-tab>
      </v-tabs>

      <!-- 오른쪽 상단에 관리자 전용 아이콘 추가 (인사팀인 경우에만 표시) -->
      <v-btn v-if="isHrDepartment" icon @click="goToAdminPage" style="margin-top: 10px;">
        <v-icon>mdi-cog</v-icon> <!-- 톱니바퀴 아이콘 -->
      </v-btn>
    </v-row>

    <v-row class="my-3 align-center" >
      <v-col cols="4">
        <!-- 어제 버튼 -->
        <v-btn @click="prevDay" icon style="box-shadow: none; ">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <!-- 내일 버튼 -->
        <v-btn @click="nextDay" icon style="box-shadow: none; margin-left: -10px;">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <!-- 오늘 버튼 -->
        <v-btn @click="setToday" style="box-shadow: none; font-weight: bold; letter-spacing: -1px; margin-left: -10px;">Today</v-btn>
        <!-- 장기 예약  -->
        <v-btn @click="openLongTermReservationModal" style="box-shadow: none;  margin-left: -10px;">
          <v-icon right style="margin-top: 5px">mdi-calendar-plus</v-icon>
        </v-btn>
      </v-col>
      
      <v-col cols="6" class="text-center">
        <h2 style="font-size: 30px; margin-left: -40%; letter-spacing: -0.5px;">{{ formattedDate(selectedDate) }}</h2>
      </v-col>
      <!-- 장기 예약 버튼 -->
      <!-- <v-btn class="ml-2" @click="openLongTermReservationModal" color="primary" outlined>장기 예약</v-btn> -->
    </v-row>


    <!-- 현재 탭에 대한 내용 -->
    <v-tabs-items v-model="selectedTab">
      <!-- 차량 예약 탭 내용 -->
      <v-tab-item>

        <v-row>
          <v-col>
            <h3 style="margin: 10px;">차량 예약 내역</h3>
            <br>

            <!-- 테이블 헤더 -->
            <v-row class="mb-2" style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:400;">
              <v-col cols="1"><strong></strong></v-col>
              <v-col cols="3"><strong>종류</strong></v-col>
              <v-col cols="3"><strong>차량번호</strong></v-col>
            
              <v-col cols="3"><strong>예약상태</strong></v-col>
              <v-col cols="1"></v-col>
            </v-row>

            <!-- 차량 리스트 -->
            <v-row v-for="vehicle in vehicles" :key="vehicle.carId" class="vehicle-row" outlined style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:300;">
              <v-col cols="1">
                <v-btn @click="openCarModal(vehicle)" icon color="none" style="box-shadow: none;">
                  <v-icon>mdi-car</v-icon> <!-- 차량 아이콘 -->
                </v-btn>
              </v-col>
              
              <!-- 차량 종류 -->
              <v-col cols="3" class="d-flex align-center justify-center">{{ vehicle.carType }}</v-col>

              <!-- 차량 번호 -->
              <v-col cols="3" class="d-flex align-center justify-center">{{ vehicle.carNum }}</v-col>

            
              <v-col cols="3">
                <v-btn v-if="vehicle.status === 'AVAILABLE'" color="green" @click="createReservation(vehicle.carId)">
                  예약 가능
                </v-btn>
                <v-btn v-else color="red">
                  예약 불가
                </v-btn>
              </v-col>

              <v-col cols="1">
                <!-- 예약 불가일 때만 아이콘 표시 -->
                <v-hover v-if="vehicle.status === 'RESERVED'">
                  <template v-slot:default="{ isHovering, props }">
                    <div style="position: relative;">
                      <v-btn v-bind="props" icon style="box-shadow: none;">
                        <v-icon>mdi-account</v-icon>
                      </v-btn>

                      <!-- 호버 시 아이콘 오른쪽에 텍스트 표시 -->
                      <v-row v-if="isHovering" style="position: absolute; top: 20; left: 5px; width: 130px; background-color: white; padding: 2px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
                        <v-col>{{ vehicle.departmentName }}  {{ vehicle.userName }}</v-col>
                      </v-row>
                    </div>
                  </template>
                </v-hover>


              </v-col>

            </v-row>

          </v-col>
        </v-row>

        <!-- 차량 상세 정보 모달창 -->
        <v-dialog v-model="isCarModalOpen" persistent max-width="400px">
          <v-card>
            <!-- 차량 이미지 최상단에 배치, 이미지 없을 때도 고정 크기 유지 -->
            <v-img 
              :src="selectedCar.carImage || 'https://via.placeholder.com/600x200?text=No+Image+Available'" 
              alt="차량 이미지"
              height="200px"
              max-height="200px"
              contain
              class="d-flex align-center justify-center"
            ></v-img>

            <v-card-title class="text-center">
              <span>{{ selectedCar.carType }} ({{ selectedCar.carNum }})</span>
            </v-card-title>

            <v-card-text>
              <v-row align="center" justify="space-between">
                <v-col class="d-flex align-center">
                  <v-icon left>mdi-seat</v-icon> <!-- 사람 인승 아이콘 -->
                  <span>{{ selectedCar.seatingCapacity }} 인승</span> <!-- 인승 바인딩 -->
                </v-col>
                <v-col class="d-flex align-center">
                  <span>배기량: {{ selectedCar.engineDisplacement }}L</span> <!-- 배기량 바인딩 -->
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="isCarModalOpen = false">닫기</v-btn>
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
                  <v-select
                    v-model="selectedVehicle"
                    :items="vehicles.map(vehicle => ({ title: vehicle.carNum, value: vehicle.carId }))"
                    label="차량 선택"
                    required
                  ></v-select>

                  <!-- 시작 날짜 선택 -->
                  <v-menu v-model="menuStart" :close-on-content-click="false" transition="scale-transition" offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="startDate"
                        label="시작 날짜"
                        
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="startDate" @input="menuStart = false"></v-date-picker>
                  </v-menu>

                  <!-- 끝 날짜 선택 -->
                  <v-menu v-model="menuEnd" :close-on-content-click="false" transition="scale-transition" offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="endDate"
                        label="끝 날짜"
                        
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="endDate" @input="menuEnd = false"></v-date-picker>
                  </v-menu>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="submitLongTermReservation">예약</v-btn>
                <v-btn color="red darken-1" text @click="isLongTermReservationModalOpen = false">취소</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

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

      isCarModalOpen: false, 
      selectedCar: {}, // 선택된 차량 정보

      isLongTermReservationModalOpen: false, // 장기 예약 모달 상태
      startDate: null, // 장기 예약 시작 날짜
      endDate: null, // 장기 예약 끝 날짜
      selectedVehicle: null, // 선택된 차량
      menuStart: false,
      menuEnd: false,
    };
  },
  computed: {
    ...mapGetters({
      departmentId: "getDepartmentId", // Vuex에서 departmentId 가져오기
    }),
    isHrDepartment() {
      // 인사팀이면 true를 반환
      return this.departmentId === "4";
    }
  },
  methods: {
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
      console.log(vehicle);
      this.selectedCar = vehicle;
      this.isCarModalOpen = true;
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
        this.userName = response.data.name;
        this.setUserAllInfoActions();
      } catch (error) {
        console.error("Error fetching user info:", error);
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
      try {
        const token = localStorage.getItem("token");

        if (!this.startDate || !this.endDate || !this.selectedVehicle) {
          alert("모든 필드를 선택해 주세요.");
          return;
        }

        const reservationData = {
          carId: this.selectedVehicle,
          startDate: this.startDate,
          endDate: this.endDate,
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

        // 예약 성공 시 알림
        alert("장기 예약이 완료되었습니다.");

        // 차량 상태 업데이트
        this.fetchVehicleAvailability(this.selectedDate);

        // 모달 닫기
        this.isLongTermReservationModalOpen = false;
      } catch (error) {
        console.error("Error during long-term reservation:", error);
        if (error.response?.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
          this.$router.push("/login");
        } else {
          alert("장기 예약 중 오류가 발생했습니다. 다시 시도해 주세요.");
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
    goToVehicleReservation() {
      this.selectedTab = 0;
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

</style>
