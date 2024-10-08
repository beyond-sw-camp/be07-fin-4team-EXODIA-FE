<template>
    <v-container fluid>
      <v-row>
        <!-- 알림 리스트 -->
        <v-col cols="12" md="8" class="notification-list">
          <h3>알림</h3>
          <v-list dense>
            <v-list-item-group>
              <v-list-item
                v-for="notification in notifications"
                :key="notification.id"
                @click="markAsRead(notification.id)"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ notification.message }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    유형: {{ getNotificationType(notification.type) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip
                    color="blue"
                    v-if="!notification.isRead"
                  >
                    읽지 않음
                  </v-chip>
                  <v-chip
                    color="grey"
                    v-else
                  >
                    읽음
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
  
        <!-- 읽지 않은 알림 수 -->
        <v-col cols="12" md="4">
          <v-card class="ma-5 pa-5">
            <v-card-title>읽지 않은 알림 수</v-card-title>
            <v-card-text>
              <h2>{{ unreadCount }} 개</h2>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
  data() {
    return {
      notifications: [], // 알림 리스트
      unreadCount: 0, // 읽지 않은 알림 수
    };
  },
  mounted() {
    this.connectToSSE(); // SSE 연결
    this.fetchUnreadCount(); // 읽지 않은 알림 수 가져오기
    this.fetchNotifications(); // 알림 리스트 가져오기
  },
  methods: {
    // Authorization 헤더를 설정하는 함수
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

    // SSE 연결
    connectToSSE() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("SSE 연결을 위해 토큰이 필요합니다.");
        return;
      }
      
      const eventSource = new EventSource(`/notifications/subscribe?token=${token}`);

      eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        console.log("새로운 알림:", notification);
        this.notifications.unshift(notification); // 새 알림 추가
      };

      eventSource.onerror = (error) => {
        console.error("SSE 연결 오류:", error);
      };
    },

    // 읽지 않은 알림 수 가져오기
    fetchUnreadCount() {
      axios
        .get("/notifications/unread-count", { headers: this.getAuthHeaders() })
        .then((response) => {
          this.unreadCount = response.data;
        })
        .catch((error) => {
          console.error("읽지 않은 알림 수 가져오기 실패:", error);
        });
    },

    // 알림 리스트 가져오기
    fetchNotifications() {
      axios
        .get("/notifications/list", { headers: this.getAuthHeaders() }) // 인증 헤더 추가
        .then((response) => {
          this.notifications = response.data;
        })
        .catch((error) => {
          console.error("알림 리스트 가져오기 실패:", error);
        });
    },

    // 알림 읽음 처리
    markAsRead(id) {
      axios
        .post(`/notifications/mark-as-read/${id}`, null, { headers: this.getAuthHeaders() }) // 인증 헤더 추가
        .then(() => {
          const notification = this.notifications.find((n) => n.id === id);
          if (notification) {
            notification.isRead = true; // 읽음 상태로 변경
          }
          this.fetchUnreadCount(); // 읽지 않은 알림 수 업데이트
        })
        .catch((error) => {
          console.error("알림 읽음 처리 실패:", error);
        });
    },

    // 알림 유형을 텍스트로 반환
    getNotificationType(type) {
      const types = {
        공지사항: "공지사항",
        경조사: "경조사",
        예약: "예약",
        차량예약승인: "차량 예약 승인",
        차량예약거절: "차량 예약 거절",
        회의실예약: "회의실 예약",
        문서: "문서 업데이트",
        결재: "결재",
      };
      return types[type] || "알 수 없는 유형";
    },
  },
};

  </script>
  
  <style scoped>
  .notification-list {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .v-chip {
    margin-left: 10px;
  }
  </style>
  