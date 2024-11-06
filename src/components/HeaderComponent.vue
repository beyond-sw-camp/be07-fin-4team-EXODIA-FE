<template>
  <header class="header">
    <!-- 로그인 연장 버튼과 토큰 유효시간 표시 -->
    <!-- <v-btn color="primary" class="mx-2" @click="extendSession">로그인 연장</v-btn> -->
    <div>
      <v-icon class="icon" style="padding-right:8px;">mdi-clock-time-three-outline</v-icon>
      <span v-if="timeRemaining > 0" style="font-size:14px;">남은 시간:
      </span>
      <span class="remain-time"> {{ formattedTimeRemaining }} </span>
      <span style="font-size:14px"> | </span>

      <span @click="extendSession" style="font-size:14px" class="extend-session">
        연장
      </span>
    </div>

    <!-- 캘린더 -->
    <div class="icons">
      <div class="icon-item" @click="$router.push('/calendar/calendarList')"
        :class="{ 'active': $route.path.startsWith('/calendar') }">
        <v-icon class="icon">mdi-calendar</v-icon>
      </div>


      <!-- 알림 아이콘 클릭 시 알림 목록 토글 -->
      <div class="notification-icon" ref="notificationIcon" @click.stop="toggleNotifications">
        <!-- 읽지 않은 알림 개수 표시 -->
        <v-badge :content="unreadCount" color="red" v-if="unreadCount > 0" class="unread-badge"></v-badge>
        <v-icon class="icon">mdi-bell</v-icon>

        <!-- 알림 목록 -->
        <div v-if="showNotifications" class="notification-dropdown" ref="notificationDropdown">
          <ul @click.stop>
            <li v-for="(notification, index) in notifications.slice(0, 4)" :key="index">
              <div class="notification-item" @click="handleNotificationClick(notification)">
                <span>{{ truncatedMessage(notification.message, 25) }}</span>
                <small>{{ formatDate(notification.notificationTime) }}</small>
              </div>
            </li>
          </ul>
          <button @click="goToNotifications" class="view-more">더 보기</button>
        </div>
      </div>

      <!-- 채팅방리스트 -->
      <div class="chat-icon">
        <v-badge :content="unreadChatNum" color="red" v-if="unreadChatNum > 0" class="unread-badge"></v-badge>
        <v-icon class="icon" @click="showChatRoomList">mdi-chat</v-icon>
      </div>

      <!-- 마이페이지 -->
      <div class="icons" @click="toggleMyPage" ref="myPageIcon" style="height:100%">
        <v-avatar class="icon">
          <v-img :src="userProfile?.profileImage || defaultProfileImage" aspect-ratio="1"></v-img>
        </v-avatar>

        <!-- 로그아웃 버튼 -->
        <div v-if="showMyPage" class="mypage-dropdown" ref="myPageDropdown" @click.stop>
          <v-row justify="center">
            <v-avatar class="icon" size="80">
              <v-img :src="userProfile?.profileImage || defaultProfileImage" aspect-ratio="1"
                style="width: 100%; height: 100%;"></v-img>
            </v-avatar>
          </v-row>
          <v-row justify="center">
            <div class="user-department">{{ this.userProfile.departmentName }} {{ this.userProfile.positionName }}</div>
          </v-row>
          <v-row @click="goToVacationPage" justify="center" class="toggle-btn">
            <v-icon style="padding-right:5px; font-size:20px; align">mdi-account</v-icon>
            <button>마이페이지</button>
          </v-row>
          <v-row @click="logout" justify="center" class="toggle-btn">
            <v-icon style="padding-right:5px; font-size:20px">mdi-logout</v-icon>
            <button>
              로그아웃
            </button>
          </v-row>
        </div>
      </div>

    </div>
  </header>

</template>

<script>
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { formatDistanceToNow, addHours } from 'date-fns';
import { ko } from 'date-fns/locale';

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
      defaultProfileImage: 'https://via.placeholder.com/150',

      unreadChatNum: 0,

      showMyPage: false,
    };
  },
  created() {
    this.fetchUnreadCount();  // 읽지 않은 알림 개수 불러오기
    this.fetchNotifications();  // 최근 알림 불러오기
    this.calculateTokenTimeRemaining();  // 토큰 유효 시간 계산
    this.initSSE();
    this.fetchUserProfile();
    this.fetchChatAlarmNum();
  },
  methods: {

    formatDate(notificationTime) {
      const dateInKST = addHours(new Date(notificationTime), 9);

      return formatDistanceToNow(dateInKST, { addSuffix: true, locale: ko });
      
    },
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
        if (!newNotification.notificationTime) {
          newNotification.notificationTime = new Date().toISOString();
        }

        if (newNotification.type == '채팅알림') {
          this.unreadChatNum = newNotification.alarmNum;
          console.log(newNotification);//
          return;
        } else if (newNotification.type == '채팅입장') {
          return;
        } else if (newNotification.type == '채팅목록') {
          return;
        }
        console.log(newNotification);
        this.notifications.unshift(newNotification);  // 새로운 알림을 맨 위에 추가
        this.unreadCount += 1;  // 읽지 않은 알림 개수 증가
      };

      // SSE 연결 오류 처리
      this.eventSource.onerror = (error) => {
        this.eventSource.close();
        console.error('SSE 연결 오류:', error);
        if (this.retryCount < this.maxRetryCount) {
          setTimeout(() => {
            this.retryCount++;
            this.initSSE(); // SSE 재연결 시도
          }, 3000); // 3초 후에 재연결 시도
        }
      };
    },
    async markNotificationAsRead(notificationId) {
      const userNum = localStorage.getItem("userNum");
      try {
        await axios.put(`${process.env.VUE_APP_API_BASE_URL}/notifications/${userNum}/read/${notificationId}`, {}, {
          headers: this.getAuthHeaders(),
        });

        console.log(`알림 ${notificationId} 읽음 처리 완료`);
      } catch (error) {
        console.error("알림 읽음 처리 중 오류 발생:", error);
      }
    },


    async fetchChatAlarmNum(){
      try{
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/chatRoom/alarm`);
        this.unreadChatNum = response.data.result;
        console.log(response);
      } catch (error) {
        console.error("오류발생");
      }
    },

    // 알림 목록 가져오기 (최신 4개)
    async fetchNotifications() {
      try {
        const userNum = localStorage.getItem("userNum");
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/notifications/${userNum}`, {
          headers: this.getAuthHeaders(),
        });

        // 전체 알림 목록 가져오기
        this.notifications = response.data;

        this.notifications.sort((a, b) => new Date(b.notificationTime) - new Date(a.notificationTime));

        // 읽지 않은 알림 개수 업데이트
        this.unreadCount = this.notifications.filter(n => !n.read).length;

        this.notifications = this.notifications.slice(0, 4);

      } catch (error) {
        console.error("알림을 가져오는 중 오류 발생:", error);
      }
    },

    // 알림 목록 토글
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    clickNotificationOutside(event) {
      const notificationDropdown = this.$refs.notificationDropdown;
      const notificationIcon = this.$refs.notificationIcon;

      // 클릭한 곳이 알림 드롭다운이나 아이콘이 아니면 드롭다운을 닫음
      if (this.showNotifications && notificationDropdown && !notificationDropdown.contains(event.target) && notificationIcon && !notificationIcon.contains(event.target)) {
        this.showNotifications = false;
      }
    },
    clickOutside(event) {
      const myPageDropdown = this.$refs.myPageDropdown;
      const myPageIcon = this.$refs.myPageIcon;

      // 클릭한 곳이 드롭다운이나 마이페이지 아이콘이 아니면 드롭다운을 닫음
      if (this.showMyPage && myPageDropdown && !myPageDropdown.contains(event.target) && myPageIcon && !myPageIcon.contains(event.target)) {
        this.showMyPage = false;
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
    async handleNotificationClick(notification) {
      // 알림을 읽음 처리합니다
      if (!notification.read) {
        await this.markNotificationAsRead(notification.id);
        // 읽지 않은 알림 개수 줄이기
        this.unreadCount -= 1;
        notification.read = true;  // 상태 업데이트
      }
      // 알림 클릭 시 알림 유형에 따라 경로 이동
      this.redirectToNotification(notification);
    },
    redirectToNotification(notification) {
      const message = notification.message;

      // [ 이벤트 ]나 [ EVENT ]가 포함된 경우 라우팅을 무시
      if (message.includes("[ 이벤트 ]") || message.includes("[ EVENT ]")) {
        console.log("이벤트 알림이므로 라우팅을 건너뜁니다.");
        return; // 라우팅을 수행하지 않고 종료
      }
      if (message.includes("인사평가 기간입니다")) {
        console.log("인사평가 알림이므로 라우팅을 건너뜁니다.");
        return; // 라우팅을 수행하지 않고 종료
      }
      // 공지사항 (게시판) 알림인 경우
      if (notification.type === '공지사항' && notification.targetId) {
        this.$router.push(`/board/detail/${notification.targetId}`);
      } 
      // 문의 알림인 경우
      else if (notification.type === '문의') {
        this.$router.push(`/qna/detail/${notification.targetId}`);
      } 
      // 예약 알림인 경우
      else if (notification.type === '예약') {
        if (notification.status === 'RESERVED') {
          window.location.href = '/reservation/adminCarResList';
        } else {
          window.location.href = '/reservation/reservationList';
        }
      } 
      // 결재 알림인 경우
      else if (notification.type === '결재' && notification.targetId) {
        const isMySubmitReq = notification.status === '승인';
        this.$router.push(`/submit/detail/${notification.targetId}?isMySubmitReq=${isMySubmitReq}`);
      } 
      // 문서 알림인 경우
      else if (notification.type === '문서') {
        window.location.href = '/document';
      } 
      // 기타 알림 처리
      else {
        console.warn("처리되지 않은 알림 유형:", notification.type);
        
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

    // 채팅룸 리스트 열기
    showChatRoomList() {
      var status = "toolbar=no,scrollbars=no,resizable=no,status=no,menubar=no,width=460, height=600, top=100,left=1000"
      window.open("/chatRoom/list", "chatRoomList", status);
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
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    },
    goToVacationPage(event) {
      event.preventDefault(); // 기본 동작 방지
      this.$router.push('/mypage/vacation');
    },
    // 날짜 포맷팅
    // formatDate(notificationTime) {
    //   const date = new Date(notificationTime);
    //   if (isNaN(date.getTime())) { // 날짜가 유효하지 않다면
    //     return "Invalid date"; // 오류 메시지 대신 기본값을 반환
    //   }
    //   return date.toLocaleDateString(); // 유효한 경우 날짜 포맷 반환
    // },
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
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
    toggleMyPage() {
      this.showMyPage = !this.showMyPage;
    }
  },
  computed: {
    formattedTimeRemaining() {
      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    // 남은 시간이 10분 이하일 경우 클래스 적용
    ,
    timeClass() {
      return this.timeRemaining <= 600 ? 'time-critical' : ''; // 600초 = 10분
    }

  },
  mounted() {
    window.parentVueInstance = this;
    document.addEventListener("click", this.handleClickOutside);
    document.addEventListener('click', this.clickOutside);
    document.addEventListener('click', this.clickNotificationOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener('click', this.clickOutside);
    document.addEventListener('click', this.clickNotificationOutside);
    if (this.eventSource) {
      this.eventSource.close();  // 컴포넌트가 파괴될 때 SSE 연결 종료
      document.removeEventListener("click", this.handleClickOutside);
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
  top: -12px;
  background-color: red;
  color: white;
  border-radius: 50%;
  width: 23px;
  height: 23px;
  justify-content: center;
  align-items: center;
  padding: 3px 8px;
  font-size: 0.8rem;
}

.notification-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 350px;
  background-color: white;
  border-radius: 10px;
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
  color: #722121;
  font-weight: 800;
  border-radius: 0 0 10px 10px;
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

.unread-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 1;
  margin-right: 16px;
}

.chat-icon {
  position: relative;
}

.mypage-dropdown {
  position: absolute;
  top: 8vh;
  right: 20px;
  width: 340px;

  margin-top: 2px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 그림자 수정으로 부드럽게 */
  z-index: 1001;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  /* 경계선 추가 */
  padding: 40px;

}

.profile-icon {
  height: 300px;
  width: 300px;
}

.user-department {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin-top: 10px;
  margin-bottom: 25px;
}

.toggle-btn {
  text-align: center;
  padding-top: 15px;
  padding-bottom: 15px;
  font-weight: 600;
  color: #722121;
  background-color: #ffffff;
  border: 1px solid #777777;
  border-radius: 40px;
  margin: 20px;
  cursor: pointer;
}

.remain-time {
  display: inline-block;
  width: 35px;
  font-size: 14px;
}

.extend-session {
  cursor: pointer;
}

.extend-session:hover {
  cursor: pointer;
  color: #9a2f2f;
  font-weight: 800;
}

/* 시간이 10분 이하일 때 빨간색 텍스트 */
.time-critical {
  color: red;
}
</style>