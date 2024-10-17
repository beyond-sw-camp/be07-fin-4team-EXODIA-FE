<template>
  <v-container>
    <v-row>
      <v-col>
        <div v-if="unreadCount > 0" class="unread-count">
          읽지 않은 알림: {{ unreadCount }}개
        </div>

        <!-- 알림 타입 필터 버튼 -->
        <v-btn-toggle v-model="selectedType" class="mb-4 custom-btn-toggle">
          <v-btn
            v-for="(label, value) in notificationTypes"
            :key="value"
            :value="value"
            class="custom-btn"
            :class="{ active: selectedType === value }"
          >
            {{ label }}
          </v-btn>
        </v-btn-toggle>

        <!-- 알림 리스트 -->
        <v-list style="background-color: #ffffff;">
          <v-list-item-group>
            <v-list-item
              v-for="notification in filteredNotifications"
              :key="notification.id"
              @click="markAsRead(notification.id)"
              class="notification-item"
            >
              <v-list-item-content>
                <v-list-item-subtitle><strong>{{ notification.type }}</strong> &nbsp;&nbsp;&nbsp; {{ formatDate(notification.notificationTime) }}</v-list-item-subtitle>
                <br>
                <v-list-item-title>
                  <strong v-if="!notification.isRead">[NEW]</strong>
                  {{ notification.message }}
                </v-list-item-title>
                <br>
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
      eventSource: null,
      retryCount: 0,
      maxRetryCount: 5,
      notifications: [],
      unreadCount: 0,
      selectedType: "", // 선택된 알림 타입
      notificationTypes: {
        "": "전체",
        공지사항: "공지사항",
        경조사: "경조사",
        예약: "예약",
        결재: "결재",
        문서: "문서",
      },
    };
  },
  created() {
    this.fetchNotifications();
    this.fetchUnreadCount();
    this.initSSE();  // SSE 초기화
  },
  computed: {
    // 선택된 타입에 따른 알림 필터링
    filteredNotifications() {
      let filtered = this.notifications;
      if (this.selectedType) {
        filtered = filtered.filter(
          (notification) => notification.type === this.selectedType
        );
      }
      return filtered.sort((a, b) => new Date(b.notificationTime) - new Date(a.notificationTime));
    },
  },
  methods: {
    // JWT 토큰을 URL의 쿼리 파라미터로 포함한 SSE 연결
    initSSE() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("JWT 토큰이 없습니다.");
        return;
      }

      try {
        // EventSource 객체 생성
        this.eventSource = new EventSource(`${process.env.VUE_APP_API_BASE_URL}/notifications/subscribe?token=${token}`);

        // EventSource 객체가 정상적으로 생성되었는지 확인
        if (!this.eventSource) {
          console.error("SSE 연결에 실패했습니다.");
          return;
        }

        // 메시지 수신 처리
        this.eventSource.onmessage = (event) => {
          const newNotification = JSON.parse(event.data);
          this.notifications.unshift(newNotification); // 새로운 알림을 맨 위에 추가
        };

        // 오류 처리 및 재연결
        this.eventSource.onerror = (error) => {
          console.error("SSE 연결 오류 발생:", error);

          // 재연결 로직 추가 (필요할 경우)
          if (this.retryCount < this.maxRetryCount) {
            setTimeout(() => {
              this.retryCount++;
              this.initSSE(); // 재연결
            }, this.getRetryInterval());
          } else {
            console.error("최대 재연결 시도 횟수에 도달했습니다.");
          }
        };

      } catch (error) {
        console.error("SSE 연결 중 예외가 발생했습니다.", error);
      }
    },
    getRetryInterval() {
      return Math.min(1000 * Math.pow(2, this.retryCount), 30000); // 최대 30초까지 증가
    },

    formatDate(notificationTime) {
      const date = new Date(notificationTime);
      return date.toLocaleDateString();
    },
    
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
.custom-btn-toggle {
  display: flex;
  gap: 10px;
}

.custom-btn {
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.custom-btn.active {
  background-color: #3f51b5;
  color: white;
  border: none;
}

.custom-btn:hover {
  background-color: #ddd;
}
.notification-item {
  margin-bottom: 15px !important;
  padding: 0px 40px;
  border-radius: 10px !important;
  background-color: #f9f9f9 !important;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1) !important;
}
</style>
