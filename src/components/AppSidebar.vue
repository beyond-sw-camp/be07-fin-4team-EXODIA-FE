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
      <div class="menu-item" @click="$router.push('/mypage/userProfile')">
        <v-icon class="icon">mdi-account</v-icon>
        <span class="tooltip">마이페이지</span>
      </div>
      <div class="menu-item" @click="$router.push('/calendar/calendarList')">
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
      <div class="menu-item" @click="$router.push('/reservation/reservationList')">
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
      <div v-if="isHrDepartment" class="menu-item" @click="$router.push('/employee-management')">
        <v-icon class="icon">mdi-account-cog</v-icon>
        <span class="tooltip">직원 관리</span>
      </div>
      <aside v-if="isSubSidebarVisible" class="sub-sidebar">

        <!-- <aside v-if="isSubSidebarVisible || currentPage.includes('/employee-management') || currentPage.includes('/salary-management')" class="sub-sidebar"> -->
        <div v-if="currentPage.startsWith('/video')" class="subside-menu">
          <div class="menu-item">
            <span @click="$router.push('/video/create')">방 생성</span>
          </div>
          <div class="menu-item">
            <span @click="$router.push('/video/rooms')">방 목록</span>
          </div>
        </div>

        <div v-if="currentPage.startsWith('/document')" class="subside-menu">
          <div class="menu-item">
            <span style="font-size:20px; font-weight:800">팀 문서함</span>
            <v-btn class="createBtn" @click="$router.push('/document/create')">
              문서 등록
            </v-btn>
            <v-list>
              <v-list-item @click="$router.push('/document')">
                <v-list-item-title>전체 문서</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$router.push('/document/list/updated')">
                <v-list-item-title>최근 업데이트 문서</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$router.push('/document/list/viewed')">
                <v-list-item-title>최근 조회 문서</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <span>프로젝트</span>
                <v-icon @click="toggleProjectVisibility"> {{ showProject ? 'mdi-chevron-up' :
                  'mdi-chevron-down' }}</v-icon>
              </v-list-item>

              <div v-if="showProject">
                <v-list>
                  <v-list-item v-for="(type, index) in typeOptions" :key="index" @click="$router.push({
                    name: 'DocumentTypeList', state: {
                      id: index + 1
                    }
                  })">
                    <v-list-item-title>{{ type }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
            </v-list>
          </div>
        </div>

        <div v-if="currentPage.startsWith('/board')" class="subside-menu">
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

        <div
          v-if="currentPage.includes('/employee-management') || currentPage.includes('/salary-management') || currentPage.includes('/department-management')"
          class="menu">
          <div class="menu-item">
            <span>직원 관리</span>
            <ul>
              <li @click="$router.push('/employee-management')">직원 목록</li>
              <li @click="$router.push('/employee-management/create')">직원 등록</li>
            </ul>
          </div>
          <div class="menu-item">
            <span>급여 관리</span>
            <ul>
              <li @click="$router.push('/salary-management')">직원 급여 목록</li>
              <li @click="$router.push('/salary-management/manage')">급여일 관리</li>
            </ul>
          </div>
          <div class="menu-item">
            <span>부서 관리</span>
            <ul>
              <li @click="$router.push('/department-management')">부서 조회</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </aside>
</template>


<script>
import axios from 'axios';

export default {
  name: 'AppSidebar',
  data() {
    return {
      token: localStorage.getItem('token') || null,

      isSubSidebarVisible: false,
      currentPage: '',
      isHrDepartment: false,
      selectedType: '',
      showProject: false,
      typeOptions: [],

    };
  },
  methods: {
    toggleSubSidebar() {
      this.isSubSidebarVisible = !this.isSubSidebarVisible;
    },
    toggleProjectVisibility() {
      this.showProject = !this.showProject;
      if (this.showProject) {
        this.fetchTypes();

      }
    },
    async fetchTypes() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/types`, { headers: { Authorization: `Bearer ${this.token}` } });
        this.typeOptions = response.data.result;
        console.log(this.typeOptions)
      } catch (e) {
        console.error('문서 타입 가져오는 중 오류 발생:', e);
      }
    },
  },
  watch: {
    $route(to) {
      this.currentPage = to.path;
      if (this.currentPage.startsWith('/employee-management') || this.currentPage.startsWith('/salary-management')) {
        this.isSubSidebarVisible = true;
      }
    }
  },
  mounted() {
    this.currentPage = this.$route.path;
    const departmentId = localStorage.getItem('departmentId');
    if (departmentId === '4') {
      this.isHrDepartment = true;
    }
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
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-sidebar {
  width: var(--sub-sidebar-width);
  height: 100vh;
  background-color: #357a38;
  position: fixed;
  top: 8vh;
  left: var(--sidebar-width);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  z-index: 3000;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.menu-item:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.subside-menu {
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
}

.v-list {
  background-color: #357a38;
  color: #ffffff;
}

.createBtn {
  margin: 10px 0;
  width: 150px;
  border: none;


}
</style>
