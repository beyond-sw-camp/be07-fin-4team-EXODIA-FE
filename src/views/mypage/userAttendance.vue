<template>
  <MypageTemplate>
    <template v-slot:attendance>
      <div class="userAttendance">
        <v-row>
          <v-col cols="4">
            <h3>출·퇴근 기록</h3>
          </v-col>
          <v-col cols="2">
            <!-- 출근 버튼 -->
            <v-btn style="background-color:#4caf50; color:#ffffff" @click="workIn">
              출근
            </v-btn>
          </v-col>
          <v-col cols="2">
            <!-- 퇴근 버튼 -->
            <v-btn style="background-color:#af2626; color:#ffffff" @click="workOut">
              퇴근
            </v-btn>
          </v-col>

          <!-- 상태 표시 -->
          <v-alert v-if="message" :type="alertType" dismissible>{{ message }}</v-alert>
        </v-row>

        <!-- 부서원 출근 정보 목록 -->
        <v-row class="container">
          <v-col cols="6" class="user-card" v-for="user in departmentUsers" :key="user.userNum">
            <v-row class="profile-container">
              <v-col class="profile-item">
                <!-- 프로필 이미지 -->
                <img :src="user.profileImage || defaultProfileImage" alt="프로필 이미지" class="profile-img" />
                <!-- 출근 여부 뱃지 -->
                <div class="badge" :class="user.isPresent ? 'badge-present' : 'badge-absent'"></div>
                <!-- 이름, 직책, 부서명 -->
              </v-col>

              <v-col>
                <div class="user-info">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-position">{{ user.positionName }}</div>
                  <div class="user-department">{{ user.departmentName }}</div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </template>
  </MypageTemplate>
</template>

<script>
import axios from "axios";
import MypageTemplate from './MypageTemplate.vue'; 

export default {
  name: "UserAttendance",
  components: {
    MypageTemplate
  },
  data() {
    return {
      isWorkIn: false,
      isWorkOut: false,
      message: "",
      alertType: "info",
      loggedUser: null,
      departmentUsers: [],
      defaultProfileImage: "https://via.placeholder.com/150",
      userNum: localStorage.getItem('userNum') || null,
    };
  },
  methods: {
    async workIn() {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/attendance/work-in`, {}, {
          headers: this.getAuthHeaders()
        });
        this.message = response.data.message;
        this.alertType = "success";
        this.isWorkIn = true;
        location.reload();
      } catch (error) {
        this.message = "출근 기록 중 오류 발생";
        this.alertType = "error";
        console.error(error);
      }
    },
    async workOut() {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/attendance/work-out`, {}, {
          headers: this.getAuthHeaders()
        });
        this.message = response.data.message;
        this.alertType = "success";
        this.isWorkOut = true;
        location.reload();
      } catch (error) {
        this.message = "퇴근 기록 중 오류 발생";
        this.alertType = "error";
        console.error(error);
      }
    },
    async fetchDepartmentUsersAttendance() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/attendance/department/status`,
          { headers: this.getAuthHeaders() }
        );
        const presentUser = response.data["출근한 사람들"];
        const absentUser = response.data["출근하지 않은 사람들"];
        if (presentUser.some((user) => user.userNum === this.userNum)) {
          this.loggedUser = {
            ...presentUser.find((user) => user.userNum === this.userNum),
            isPresent: true,
          };
        } else if (absentUser.some((user) => user.userNum === this.userNum)) {
          this.loggedUser = {
            ...absentUser.find((user) => user.userNum === this.userNum),
            isPresent: false,
          };
        }
        this.departmentUsers = [
          this.loggedUser,
          ...presentUser
            .filter((user) => user.userNum !== this.userNum)
            .map((user) => ({ ...user, isPresent: true })),
          ...absentUser
            .filter((user) => user.userNum !== this.userNum)
            .map((user) => ({ ...user, isPresent: false })),
        ];
      } catch (error) {
        console.error("부서 출근 정보를 가져오는 중 오류 발생:", error);
      }
    },
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
    this.fetchDepartmentUsersAttendance();
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

.userAttendance {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

/* 유저 카드 스타일 */
.user-card {
  display: flex;
  justify-content: center;
  align-content: center;
  text-align: start;
}

.profile-container {
  position: relative;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

/* 뱃지 스타일 */
.badge {
  position: absolute;
  top: 50px;
  left: 50px;
  width: 15px;
  height: 15px;
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

.profile-item {
  display: flex;
  justify-content: center;
}
</style>
