<template>
  <v-row>
    <!-- 달력 -->
    <v-col cols="8">
      <v-card outlined>
        <v-card-text>달력(일정)</v-card-text>
      </v-card>
    </v-col>

    <!-- 알림과 프로필 -->
    <v-col cols="4">
      <v-row>
        <v-col cols="12">
          <v-card outlined>
            <v-card-text>알림</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="12" md="4" class="profile-content">
              <v-row class="profile-card">
                <v-img :src="userProfile?.profileImage || defaultProfileImage" aspect-ratio="1"
                  class="profile-img"></v-img>
                <v-card-title class="profile-name">{{ userProfile?.name || '이름' }}</v-card-title>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row>
    <!-- 공지사항 -->
    <v-col cols="6">
      <v-card outlined>
        <v-card-text>공지사항</v-card-text>
      </v-card>
    </v-col>

    <!-- 팀원들 출근현황 -->
    <v-col cols="6">
      <UserAttendance />
    </v-col>
  </v-row>
</template>

<script>
import axios from 'axios';
import UserAttendance from './mypage/userAttendance.vue';
export default {
  name: 'HomePage',
  components: {
    UserAttendance // 타임라인 컴포넌트 등록
  },
  data() {
    return {
      userProfile: {},
    }
  },
  mounted() {
    this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('token');
        const userNum = localStorage.getItem('userNum');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Received User Profile:', response.data);
        this.userProfile = response.data;

        console.log(this.userProfile);

        console.log('출근 시간 기록 :', this.userProfile.attendanceData?.clockInTime || '출근기록없');
        console.log('퇴근 시간 기록 :', this.userProfile.attendanceData?.clockOutTime || '퇴근기록없');
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
  }
};
</script>

<style scoped>
.profile-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  margin: 0;
}

.profile-img {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin: 0 auto;
}
</style>
