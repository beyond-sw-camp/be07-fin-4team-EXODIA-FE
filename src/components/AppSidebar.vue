<template>
  <aside class="sidebar">
    <div class="menu">
      <div class="menu-item" @click="toggleSubSidebar">
        <v-icon class="icon">mdi-menu</v-icon>
        <span class="tooltip">메뉴 더 보기</span>
      </div>

      <div class="menu-item" @click="$router.push('/')">
        <v-icon class="icon">mdi-home</v-icon>
        <span class="tooltip">홈</span>
      </div>
      <div class="menu-item" @click="$router.push('/mypage')">
        <v-icon class="icon">mdi-account</v-icon>
        <span class="tooltip">마이페이지</span>
      </div>
      <div class="menu-item" @click="$router.push('/calendar')">
        <v-icon class="icon">mdi-calendar</v-icon>
        <span class="tooltip">캘린더</span>
      </div>
      <div class="menu-item" @click="$router.push('/board')">
        <v-icon class="icon">mdi-book-open-variant</v-icon>
        <span class="tooltip">게시판</span>
      </div>
      <div class="menu-item" @click="$router.push('/document')">
        <v-icon class="icon">mdi-email</v-icon>
        <span class="tooltip">문서 관리</span>
      </div>
      <div class="menu-item" @click="$router.push('/reservation')">
        <v-icon class="icon">mdi-timer-sand</v-icon>
        <span class="tooltip">예약</span>
      </div>
      <div class="menu-item" @click="$router.push('/approval')">
        <v-icon class="icon">mdi-pencil-box</v-icon>
        <span class="tooltip">결재</span>
      </div>
      <div class="menu-item" @click="$router.push('/messenger')">
        <v-icon class="icon">mdi-message-text</v-icon>
        <span class="tooltip">메신저</span>
      </div>
      <div class="menu-item" @click="$router.push('/video/rooms')">
        <v-icon class="icon">mdi-video</v-icon>
        <span class="tooltip">화상회의</span>
      </div>
      <div class="menu-item" @click="$router.push('/organization')">
        <v-icon class="icon">mdi-account-group</v-icon>
        <span class="tooltip">조직도</span>
      </div>



      <aside v-if="isSubSidebarVisible" class="sub-sidebar">
        <div v-if="currentPage === '/video/rooms'" class="menu">
          <div class="menu-item">
            <span @click="$router.push('/video/create')">방 생성</span>
          </div>
          <div class="menu-item">
            <span @click="$router.push('/video/rooms')">방 목록</span>
          </div>
        </div>

        <div v-if="currentPage === '/document'" class="menu">
          <div class="menu-item">
            <span>팀 문서함</span>
            <ul>
              <li @click="$router.push('/document/team/all')">전체 문서</li>
              <li @click="$router.push('/document/team/updated')">최근 업데이트 문서</li>
              <li @click="$router.push('/document/team/viewed')">최근 조회 문서</li>
            </ul>
          </div>
          <div class="menu-item">
            <span @click="$router.push('/project')">프로젝트</span>
          </div>
        </div>

        <div v-if="currentPage === '/board'" class="menu">
          <div class="menu-item">
            <span>게시판</span>
            <ul>
              <li @click="$router.push('/board/write')">게시물 작성</li>
              <li @click="$router.push('/board/list')">게시물 목록</li>
            </ul>
          </div>
          <div class="menu-item">
            <span>Q&A</span>
            <ul>
              <li @click="$router.push('/qna/write')">질문 작성</li>
              <li @click="$router.push('/qna/list')">질문 목록</li>
            </ul>
          </div>
        </div>
      </aside>

    </div>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar',
  data() {
    return {
      isSubSidebarVisible: false,
      currentPage: '' 
    };
  },
  methods: {
    toggleSubSidebar() {
      this.isSubSidebarVisible = !this.isSubSidebarVisible;
    }
  },
  watch: {
    $route(to) {
      this.currentPage = to.path;
    }
  },
  mounted() {
    this.currentPage = this.$route.path;
  }
};
</script>

<style scoped>
:root {
  --sidebar-width: 4%;
  --sub-sidebar-width: 15%;
  --header-height: 60px;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: #4CAF50;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-sidebar {
  width: var(--sub-sidebar-width);
  height: 100vh;
  background-color: #357a38;
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
  padding: 20px;
}

.menu {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.menu-item .icon {
  font-size: 2vw;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
}

.tooltip {
  position: absolute;
  left: calc(100% + 10px);
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.menu-item:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
