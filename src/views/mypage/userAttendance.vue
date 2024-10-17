<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>출·퇴근 기록</h2>

        <v-btn
          color="primary"
            @click="workIn"
            :disabled="isWorkIn"
            style="height: 55px;"
          >
          출근
          </v-btn>
      
          <!-- 퇴근 버튼 -->
          <v-btn
            color="error"
            @click="workOut"
          
            style="margin-left: 10px; height:55px"
          >
            퇴근
          </v-btn>

        <!-- 상태 표시 -->
        <v-alert v-if="message" :type="alertType" dismissible>{{ message }}</v-alert>
      </v-col>
    </v-row>
  </v-container>
      
  <!-- 부서원 출근 정보 목록 -->
  <div class="container">
    <div class="user-card" v-for="user in departmentUsers" :key="user.userNum">
      <div class="profile-container">
        <!-- 프로필 이미지 -->
        <img :src="user.profileImage || defaultProfileImage" alt="프로필 이미지" class="profile-img" />

        <!-- 출근 여부 뱃지 -->
        <div class="badge" :class="user.isPresent ? 'badge-present' : 'badge-absent'"></div>
      </div>

      <!-- 이름, 직책, 부서명 -->
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-position">{{ user.positionName }}</div>
        <div class="user-department">{{ user.departmentName }}</div>
      </div>
    </div>
  </div>

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
      alertType: "info", // 알림 메시지 유형

      departmentUsers: [], // 부서원들의 출근 정보
      defaultProfileImage: "https://via.placeholder.com/150", // 기본 프로필 이미지


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
        location.reload();
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
        location.reload();
      } catch (error) {
        this.message = "퇴근 기록 중 오류 발생";
        this.alertType = "error";
        console.error(error);
      }
    },

    // 부서원 출근 정보 가져오기
    async fetchDepartmentUsersAttendance() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/attendance/department/status`,
          {
            headers: this.getAuthHeaders(),
          }
        );
        this.departmentUsers = [
          ...response.data["출근한 사람들"].map((user) => ({
            ...user,
            isPresent: true, // 출근한 사람
          })),
          ...response.data["출근하지 않은 사람들"].map((user) => ({
            ...user,
            isPresent: false, // 출근하지 않은 사람
          })),
        ];
      } catch (error) {
        console.error("부서 출근 정보를 가져오는 중 오류 발생:", error);
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
  mounted() {
    this.fetchDepartmentUsersAttendance(); // 컴포넌트가 마운트되면 부서 출근 정보 가져오기
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

/* 유저 카드 스타일 */
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.user-card {
  width: 200px;
  padding: 20px;
  margin: 15px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.profile-container {
  position: relative;
}

.profile-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

/* 뱃지 스타일 */
.badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 3px solid #f44336;
}

.badge-present {
  background-color: #4caf50;
  /* 출근한 사람은 초록색 뱃지 */
}

.badge-absent {
  background-color: #f44336;
  /* 출근하지 않은 사람은 빨간색 뱃지 */
}

.user-info {
  margin-top: 10px;
}

.user-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 5px;
}

.user-position,
.user-department {
  font-size: 14px;
  color: #808080;
}
</style>
