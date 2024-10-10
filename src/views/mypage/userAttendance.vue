<template>
    <v-container>
      <v-row>
        <v-col>
          <h2>출·퇴근 기록</h2>
  
          <!-- 출근 버튼 -->
          <v-btn
            color="primary"
            @click="workIn"
            :disabled="isWorkIn"
          >
            출근
          </v-btn>
  
          <!-- 퇴근 버튼 -->
          <v-btn
            color="error"
            @click="workOut"
            :disabled="!isWorkIn || isWorkOut"
          >
            퇴근
          </v-btn>
  
          <!-- 상태 표시 -->
          <v-alert v-if="message" :type="alertType" dismissible>{{ message }}</v-alert>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "userAttendance",
    data() {
      return {
        isWorkIn: false,  // 출근 여부
        isWorkOut: false, // 퇴근 여부
        message: "",      // 알림 메시지
        alertType: "info" // 알림 메시지 유형
      };
    },
    methods: {
      // 출근 API 호출
      async workIn() {
        try {
          const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/attendance/work-in`, {}, {
            headers: this.getAuthHeaders()
          });
          this.message = response.data.message;
          this.alertType = "success";
          this.isWorkIn = true;  // 출근 완료
        } catch (error) {
          this.message = "출근 기록 중 오류 발생";
          this.alertType = "error";
          console.error(error);
        }
      },
  
      // 퇴근 API 호출
      async workOut() {
        try {
          const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/attendance/work-out`, {}, {
            headers: this.getAuthHeaders()
          });
          this.message = response.data.message;
          this.alertType = "success";
          this.isWorkOut = true;  // 퇴근 완료
        } catch (error) {
          this.message = "퇴근 기록 중 오류 발생";
          this.alertType = "error";
          console.error(error);
        }
      },
  
      // JWT 인증 헤더 설정
      getAuthHeaders() {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("토큰이 없습니다. 로그인이 필요합니다.");
          return {};
        }
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    },
    created() {
      // 페이지 로딩 시 초기화 작업을 할 수 있음
    },
  };
  </script>
  
  <style scoped>
  h2 {
    margin-bottom: 20px;
  }
  
  v-btn {
    margin-right: 10px;
  }
  
  v-alert {
    margin-top: 20px;
  }
  </style>
  