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
      <v-row>
        <h3>공지사항</h3>
      </v-row>

      <v-row class="mt-10">
        <v-row>
          <v-col cols="12">
            <v-row style="background-color:rgba(122, 86, 86, 0.2); color:#444444; font-weight:600;">
              <v-col cols="3"><strong>번호</strong></v-col>
              <v-col cols="5"><strong>제목</strong></v-col>
              <v-col cols="4"><strong>작성일</strong></v-col>
            </v-row>

            <!-- 게시글 정렬 -->
            <v-row v-for="(item, index) in boardItems" :key="item.id" class="board" @click="goToDetail(item.id)">
              <v-col cols="3">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</v-col>
              <v-col cols="5">{{ item.title }}</v-col>
              <v-col cols="4">{{ formatDate(item.createdAt) }}</v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-row>
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
      boardItems: [],
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
    }
  },
  mounted() {
    this.fetchUserProfile();
    this.fetchBoardItems();
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

        console.log('출근 시간 기록 :', this.userProfile.attendanceData?.clockInTime || '출근기록없');
        console.log('퇴근 시간 기록 :', this.userProfile.attendanceData?.clockOutTime || '퇴근기록없');
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
    async fetchBoardItems() {
      try {
        const params = {
          page: this.currentPage - 1,
          size: this.itemsPerPage,
          searchType: 'title + content',
          searchQuery: this.searchQuery || "",
        };
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/notice/list`;
        const response = await axios.get(apiUrl, { params });
        if (response.data && response.data.result) {
          const result = response.data.result;
          this.boardItems = result.content;
          this.totalPages = result.totalPages;
        }

        console.log("boardItem: " + this.boardItems)
      } catch (error) {
        console.error("목록을 가져오는 중 오류가 발생했습니다:", error);
      }
    },
    formatDate(date) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      return new Date(date).toLocaleDateString('ko-KR', options).replace(/\./g, '.');
    },
    goToDetail(id) {
      this.$router.push({ name: "BoardDetail", params: { id } });
    },
  }
}
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
}
</style>
