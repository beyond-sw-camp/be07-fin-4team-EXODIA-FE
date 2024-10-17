<template>
  <header class="header">
    <div class="icons">
      <div class="icon-item" @click="$router.push('/calendar/calendarList')" :class="{ 'active': $route.path.startsWith('/calendar') }">
        <v-icon class="icon">mdi-calendar</v-icon>
      </div>

      <!-- 알림 아이콘 클릭 시 알림 페이지로 이동 -->
      <div class="notification-icon" @click="goToNotifications">
        <v-icon class="icon">mdi-bell</v-icon>

        <!-- 읽지 않은 알림 개수 표시 -->
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </div>

      <!-- 채팅방리스트 -->
      <div class="icon-item">
        <v-icon class="icon" @click="showChatRoomList">mdi-chat</v-icon>
      </div>

      <v-avatar class="icon" @click="$router.push('/mypage/userProfile')">
        <img src="@/assets/user.png" alt="User Avatar" class="user-avatar" style="width: 100%; height: 100%; object-fit: cover;" />
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
      unreadCount: 0, // 읽지 않은 알림 개수
      timeRemaining: 0, // 토큰의 남은 유효기간
    };
  },
  created() {
    // 컴포넌트 생성 시 읽지 않은 알림 개수를 가져옴
    this.fetchUnreadCount();
    this.calculateTokenTimeRemaining();
  },
  methods: {
    // 읽지 않은 알림 개수를 가져오는 메서드
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
        this.calculateTokenTimeRemaining(); // 유효시간 갱신
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

    // 토큰 유효시간 계산
    calculateTokenTimeRemaining() {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)
      const expirationTime = decodedToken.exp; // 토큰 만료 시간 (초 단위)

      this.timeRemaining = expirationTime - currentTime;

      // 남은 시간 갱신
      if (this.timeRemaining > 0) {
        setTimeout(() => this.calculateTokenTimeRemaining(), 1000); // 매 초마다 업데이트
      } else {
        this.logout(); // 토큰이 만료되면 로그아웃
      }
    },
  },
  computed: {
    // 남은 시간을 "분:초" 형식으로 변환
    formattedTimeRemaining() {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
  font-size: 20px;
  background-color: #ffffff;
  box-shadow: 0 1px 0 0 #bcbcbc;
  color: #ffffff;
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
  font-size: 25px;
}

.icons>v-avatar {
  margin-left: 4vw;
  height: 5vh;
  width: 5vh;
}

.icon:hover {
  opacity: 0.5;
  visibility: visible;
}

.icon-item.active {
  color: #7A5656;
  font-weight: 700;
  background-color: rgba(122, 86, 86, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-content: center;
}

.icon-item.active>.icon {
  color: #7A5656;
  left: -20px;
}

.notification-icon {
  font-size: 2vh;
  margin-right: 1vh;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -13px;
  /* top: 16px; */
  /* right: 8px; */
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.8rem;
}

.v-btn {
  margin-left: 10px;
  
}

</style>
