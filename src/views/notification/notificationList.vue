<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>알림 리스트</h2>
        <div v-if="unreadCount > 0" class="unread-count">
          읽지 않은 알림: {{ unreadCount }}개
        </div>

        <!-- 알림 타입 필터 버튼 -->
        <v-btn-toggle v-model="selectedType" class="mb-4">
          <v-btn value="">전체</v-btn>
          <v-btn value="공지사항">공지사항</v-btn>
          <v-btn value="경조사">경조사</v-btn>
          <v-btn value="예약">예약</v-btn>
          <v-btn value="결재">결재</v-btn>
          <v-btn value="문서">문서</v-btn>
        </v-btn-toggle>

        <!-- 알림 리스트 -->
        <v-list>
          <v-list-item-group>
            <v-list-item
              v-for="notification in filteredNotifications"
              :key="notification.id"
              @click="markAsRead(notification.id)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  <strong v-if="!notification.isRead">[NEW]</strong>
                  {{ notification.message }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ notification.type }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "NotificationList",
  data() {
    return {
      notifications: [],
      unreadCount: 0,
      selectedType: "", // 선택된 알림 타입
    };
  },
  created() {
    this.fetchNotifications();
    this.fetchUnreadCount();
  },
  computed: {
    // 선택된 타입에 따른 알림 필터링
    filteredNotifications() {
      if (this.selectedType) {
        return this.notifications.filter(
          (notification) => notification.type === this.selectedType
        );
      }
      return this.notifications;
    },
  },
  methods: {
    // 전체 알림 리스트 가져오기
    async fetchNotifications() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/notifications/list`, {
          headers: this.getAuthHeaders(),
        });
        this.notifications = response.data;
      } catch (error) {
        console.error("알림 데이터를 가져오는 중 오류 발생:", error);
      }
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

    // 알림 읽음 처리
    async markAsRead(notificationId) {
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/notifications/mark-as-read/${notificationId}`, null, {
          headers: this.getAuthHeaders(),
        });
        this.fetchNotifications(); // 알림 리스트 다시 가져오기
        this.fetchUnreadCount(); // 읽지 않은 알림 개수 다시 가져오기
      } catch (error) {
        console.error("알림 읽음 처리 중 오류 발생:", error);
      }
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
.unread-count {
  margin-bottom: 20px;
  font-weight: bold;
  color: red;
}
</style>
