<template>
  <header class="header">
    <div class="icons">
      <div class="icon-item" @click="$router.push('/calendar/calendarList')"
        :class="{ 'active': $route.path.startsWith('/calendar') }">
        <v-icon class="icon">mdi-calendar</v-icon>
      </div>

      <!-- 알림 아이콘 클릭 시 알림 목록 토글 -->
      <div class="notification-icon" @click="toggleNotifications">
        <v-icon class="icon">mdi-bell</v-icon>

        <!-- 읽지 않은 알림 개수 표시 -->
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>

        <!-- 알림 목록 -->
        <div v-if="showNotifications" class="notification-dropdown">
          <ul>
            <li v-for="(notification, index) in notifications.slice(0, 4)" :key="index">
              <div class="notification-item">
                <span>{{ truncatedMessage(notification.message, 20) }}</span>
                <small>{{ formatDate(notification.createdAt) }}</small>
              </div>
            </li>
          </ul>
          <button @click="goToNotifications" class="view-more">더 보기</button>
        </div>
      </div>

      <!-- 채팅방리스트 -->
      <div class="icon-item">
        <v-icon class="icon" @click="showChatRoomList">mdi-chat</v-icon>
      </div>

      <v-avatar class="icon" @click="$router.push('/mypage/vacation')">
        <!-- <img src="@/assets/user.png" alt="User Avatar" class="user-avatar"
          style="width: 100%; height: 100%; object-fit: cover;" /> -->
        <v-img :src="userProfile?.profileImage || defaultProfileImage" aspect-ratio="1" class="profile-img"></v-img>
      </v-avatar>


      <!-- 로그인 연장 버튼과 토큰 유효시간 표시 -->
      <!-- <v-btn color="primary" class="mx-2" @click="extendSession">로그인 연장</v-btn> -->
      <v-btn class="mx-2" text style="background-color: transparent; color: blue;" @click="extendSession">로그인 연장</v-btn>


      <span v-if="timeRemaining > 0">남은 시간: {{ formattedTimeRemaining }}</span>

      <!-- 로그아웃 버튼 -->
      <v-btn color="error" @click="logout">로그아웃</v-btn>
    </div>
  </header>

</template>

<script>
import axios from "axios";
import { jwtDecode } from 'jwt-decode';

export default {
  name: 'HeaderComponent',
  data() {
    return {
      unreadCount: 0,  // 읽지 않은 알림 개수
      timeRemaining: 0,  // 토큰의 남은 유효기간
      showNotifications: false,  // 알림 드롭다운 상태
      notifications: [],  // 알림 목록
      eventSource: null,  // SSE 객체
      retryCount: 0, // 재연결 시도 횟수
      maxRetryCount: 5, // 최대 재연결 시도 횟수
      userProfile: {},
      defaultProfileImage: 'https://via.placeholder.com/150'

    };
  },
  created() {
    this.fetchUnreadCount();  // 읽지 않은 알림 개수 불러오기
    this.fetchNotifications();  // 최근 알림 불러오기
    this.calculateTokenTimeRemaining();  // 토큰 유효 시간 계산
    this.initSSE();
    this.fetchUserProfile();
  },
  methods: {
    // SSE 연결 설정
    initSSE() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("JWT 토큰이 없습니다.");
        return;
      }

      this.eventSource = new EventSource(`${process.env.VUE_APP_API_BASE_URL}/notifications/subscribe?token=${token}`);

      // 새로운 알림 수신 시 처리
      this.eventSource.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        this.notifications.unshift(newNotification);  // 새로운 알림을 맨 위에 추가
        this.unreadCount += 1;  // 읽지 않은 알림 개수 증가
      };

      // SSE 연결 오류 처리
      this.eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error);
        if (this.retryCount < this.maxRetryCount) {
          setTimeout(() => {
            this.retryCount++;
            this.initSSE(); // SSE 재연결 시도
          }, 3000); // 3초 후에 재연결 시도
        }
      };
    },

    // 알림 목록 가져오기 (최신 4개)
    async fetchNotifications() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/notifications/list`, {
          headers: this.getAuthHeaders(),
        });
        this.notifications = response.data;
        console.log("알림 데이터:", this.notifications);
      } catch (error) {
        console.error("알림을 가져오는 중 오류 발생:", error);
      }
    },

    // 알림 목록 토글
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },

    // 읽지 않은 알림 개수 가져오기
    async fetchUnreadCount() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/notifications/unread-count`, {
          headers: this.getAuthHeaders(),
        });
        this.unreadCount = response.data;
      } catch (error) {
        console.error("읽지 않은 알림 개수를 가져오는 중 오류 발생:", error);
      }
    },
    truncatedMessage(message, maxLength) {
      if (message.length > maxLength) {
        return message.slice(0, maxLength) + "...";
      }
      return message;
    },
    // 알림 페이지로 이동
    goToNotifications() {
      this.$router.push('/notification/notificationList');
    },

    // 인증 헤더 가져오기
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

    // 채팅룸 리스트 열기
    showChatRoomList() {
      window.open("/chatRoom/list", "_blank", "width=480, height=650")
    },

    // 로그인 연장
    async extendSession() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('로그인이 되어 있지 않습니다.');
          return;
        }

        const decodedToken = jwtDecode(token);
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/refresh-token`, {
          userNum: decodedToken.sub
        });

        const newToken = response.data.result;
        localStorage.setItem('token', newToken);
        alert('로그인 연장이 완료되었습니다.');
        this.calculateTokenTimeRemaining();  // 유효 시간 갱신
      } catch (error) {
        console.error('세션 연장 중 오류 발생:', error);
        alert('세션 연장 중 오류가 발생했습니다.');
      }
    },

    // 로그아웃
    logout() {
      localStorage.clear();
      alert('로그아웃 되었습니다.');
      this.$router.push('/login');
    },

    // 토큰 유효 시간 계산
    calculateTokenTimeRemaining() {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = decodedToken.exp;

      this.timeRemaining = expirationTime - currentTime;

      if (this.timeRemaining > 0) {
        setTimeout(() => this.calculateTokenTimeRemaining(), 1000);
      } else {
        this.logout();
      }
    },

    // 날짜 포맷팅
    formatDate(notificationTime) {
      const date = new Date(notificationTime);
      if (isNaN(date.getTime())) { // 날짜가 유효하지 않다면
        return "Invalid date"; // 오류 메시지 대신 기본값을 반환
      }
      return date.toLocaleDateString(); // 유효한 경우 날짜 포맷 반환
    },
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
        console.log(this.userProfile.profileImage);
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
  },
  computed: {
    formattedTimeRemaining() {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  },
  beforeUnmount() {
    if (this.eventSource) {
      this.eventSource.close();  // 컴포넌트가 파괴될 때 SSE 연결 종료
    }
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: end;
  align-items: center;
  height: 8vh;
  z-index: 1000;
  width: calc(100% - var(--sidebar-width));
  position: fixed;
  left: var(--sidebar-width);
  top: 0;
  background-color: #ffffff;
  box-shadow: 0 1px 0 0 #bcbcbc;
}

.icons {
  display: flex;
  align-items: center;
  color: #777777;
}

.icon {
  margin-left: 25px;
}

.icons>.icon {
  font-size: 4vh;
  cursor: pointer;
}

.icons>v-avatar {
  margin-left: 4vw;
  height: 5vh;
  width: 5vh;
}

.notification-icon {
  margin-right: 1vh;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -13px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 300px;
  background-color: white;
  border-radius: 10px;
  /* 동글동글하게 변경 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 그림자 수정으로 부드럽게 */
  z-index: 1001;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  /* 경계선 추가 */
}

.notification-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.2s ease-in-out;
  border-radius: 8px;
  /* 알림 항목도 동글동글하게 */
  margin: 5px;
  /* 간격 추가 */
  background-color: #f9f9f9;
  /* 배경색 부드럽게 */
}

.notification-item:hover {
  background-color: #f1f1f1;
  /* 마우스 호버 시 부드러운 색 변경 */
}

.notification-item small {
  display: block;
  color: #888;
  font-size: 0.8rem;
}

.view-more {
  display: block;
  width: 100%;
  background-color: #f0f0f0;
  border: none;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  color: #007bff;
  /* 파란색 강조 */
  border-radius: 0 0 10px 10px;
  /* 더보기 버튼도 동글동글 */
}

.view-more:hover {
  background-color: #e0e0e0;
  /* 호버 시 색상 */
}

.profile-img {
  border-radius: 50%;
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin: 0 auto;
}
</style>
