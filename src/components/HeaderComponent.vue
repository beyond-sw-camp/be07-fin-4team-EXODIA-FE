<template>
  <header class="header">
    <div class="logo">
      <img :src="require('@/assets/exodia.png')" alt="Logo" />
    </div>
    <div class="icons">
      <v-icon class="icon">mdi-help-circle-outline</v-icon>
      <v-icon class="icon">mdi-email</v-icon>
      <v-icon class="icon">mdi-message</v-icon>

      <!-- 알림 아이콘 클릭 시 알림 페이지로 이동 -->
      <div class="notification-icon" @click="goToNotifications">
        <v-icon class="icon">mdi-bell</v-icon>

        <!-- 읽지 않은 알림 개수 표시 -->
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </div>

      <v-avatar>
        <img src="@/assets/user.png" alt="User Avatar" class="user-avatar" />
      </v-avatar>
    </div>
  </header>
</template>

<script>
import axios from "axios";

export default {
  name: 'HeaderComponent',
  data() {
    return {
      unreadCount: 0, // 읽지 않은 알림 개수
    };
  },
  created() {
    // 컴포넌트 생성 시 읽지 않은 알림 개수를 가져옴
    this.fetchUnreadCount();
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
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e6f1e3;
  border-bottom: 1px solid #d9e5d6;
  height: 8vh;
  z-index: 1000;
  width: calc(100% - var(--sidebar-width));
  position: fixed;
  left: var(--sidebar-width);
  top: 0;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 6vh; 
  /* margin-right: 2vw;  */
}

.icons {
  display: flex;
  align-items: center;
  margin: 30px;
}

.icons > .icon {
  font-size: 4vh; 
  margin-left: 3vw; 
  cursor: pointer;
}

.icons > v-avatar {
  /* margin-left: 4vw; */
  height: 5vh;
  width: 5vh; 
}

.notification-icon {
  font-size: 2vh; 
  margin-right: 1vh;
  position: relative;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.8rem;
}
</style>
