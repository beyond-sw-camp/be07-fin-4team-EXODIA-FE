<template>

  <v-row>
    <v-col cols="6">
      <MainCalendarList style="font-size:12px; background-color:#ffffff;" />
    </v-col>

    <v-col cols="6" class="right-dashboard">
      <v-row justify="space-between">
        <!-- 공지사항 -->
        <v-col cols="12" class="board">
          <v-row>
            <v-col cols="10">
              <h3 class="mb-4">공지사항</h3>
            </v-col>
            <v-col cols="auto">
              <span style="font-size:12px;  padding-left:25px; cursor:pointer"
                @click="$router.push('/board/notice/list')">더보기</span>
            </v-col>
          </v-row>

          <v-row>
            <!-- 게시글 목록 -->
            <v-row v-for="item in boardItems" :key="item.id" class="board-item" @click="goToDetail(item.id)">
              <v-col cols="9" class="ellipsis-text"> {{ item.title }}</v-col>
              <v-col cols="3" style="color:#808080; padding-left:40px; ">{{ formatDate(item.createdAt) }}</v-col>
            </v-row>
          </v-row>
        </v-col>

      </v-row>

      <!-- 팀원 출근 현황 -->
      <v-row class="mt-10">
        <keep-alive>
          <UserAttendance />
        </keep-alive>
      </v-row>
    </v-col>
  </v-row>


</template>

<script>
import axios from 'axios';
import UserAttendance from './mypage/userAttendance.vue';
import MainCalendarList from './calendar/mainCalendarList.vue';

export default {
  name: 'HomePage',
  components: {
    UserAttendance, // 타임라인 컴포넌트 등록
    MainCalendarList,
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

        this.userProfile = response.data;

        // console.log('출근 시간 기록 :', this.userProfile.attendanceData?.clockInTime || '출근기록없');
        // console.log('퇴근 시간 기록 :', this.userProfile.attendanceData?.clockOutTime || '퇴근기록없');
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
          this.boardItems = result.content.slice(0, 5);
          this.totalPages = result.totalPages;
        }

      } catch (error) {
        console.error("목록을 가져오는 중 오류가 발생했습니다:", error);
      }
    },
    formatDate(date) {
      return new Date(date)
        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
        .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
    },
    goToDetail(id) {
      this.$router.push({ name: "BoardDetail", params: { id } });
    },
  }
}
</script>

<style scoped>
.right-dashboard {
  margin-top: 12px;
}

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
  width: 50px;
  height: 50px;
  object-fit: cover;
}

.ellipsis-text {
  /* 말줄임 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis !important;
  max-width: 360px;
  width: 360px;
  font-weight: 600;
}

.board {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  height: 100%;
  flex-wrap: wrap;
}

.board-item {
  font-size: 14px;
  padding: 3px 30px;
  display: flex;
  justify-content: space-around;
  align-content: center;
}

.board-item:last-child {
  padding-bottom: 20px;
}

.board-item>.v-col {
  padding: 10px 0;
}
</style>
