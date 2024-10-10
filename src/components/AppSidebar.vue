<template>
  <aside class="sidebar">
    <div class="menu">
      <div class="logo" @click="$router.push('/')">
        <img :src="require('@/assets/exodia.png')" alt="Logo" />
      </div>

      <!-- 사이드: 게시판 -->
      <div class="menu-item" @click="$router.push('/board/notice/List')"
        :class="{ 'active': $route.path.startsWith('/board') }" @mouseover="showSubSidebar('board')">
        <v-icon class="icon">mdi-format-list-bulleted</v-icon>
        <span>게시판</span>
      </div>

      <!-- 사이드: 문서 관리 -->
      <div class="menu-item" @click="$router.push('/document')"
        :class="{ 'active': $route.path.startsWith('/document') }" @mouseover="showSubSidebar('document')">
        <v-icon class="icon">mdi-folder-file-outline</v-icon>
        <span>문서 관리</span>
      </div>

      <!-- 사이드: 예약 -->
      <div class="menu-item" @click="$router.push('/reservation/meetReservationList')"
        :class="{ 'active': $route.path.startsWith('/reservation') }" @mouseover="showSubSidebar('reservation')">
        <v-icon class="icon">mdi-timer-sand</v-icon>
        <span>예약</span>
      </div>

      <!-- 사이드: 결재 -->
      <div class="menu-item" @click="$router.push('/submit')" :class="{ 'active': $route.path.startsWith('/submit') }"
        @mouseover="showSubSidebar('submit')">
        <v-icon class="icon">mdi-pencil-box</v-icon>
        <span>전자 결재</span>
      </div>

      <!-- 사이드: 메신저 -->
      <div class="menu-item" @click="$router.push('/messenger')"
        :class="{ 'active': $route.path.startsWith('/messenger') }" @mouseover="showSubSidebar('messenger')">
        <v-icon class="icon">mdi-forum-outline</v-icon>
        <span>메신저</span>
      </div>

      <!-- 사이드: 화상회의 -->
      <div class="menu-item" @click="$router.push('/video/rooms')"
        :class="{ 'active': $route.path.startsWith('/video') }" @mouseover="showSubSidebar('video')">
        <v-icon class="icon">mdi-video</v-icon>
        <span>화상회의</span>
      </div>

      <!-- 사이드: 조직도 -->
      <div class="menu-item" @click="$router.push('/organization')"
        :class="{ 'active': $route.path.startsWith('/organization') }" @mouseover="showSubSidebar('borganizationoard')">
        <v-icon class="icon">mdi-account-group</v-icon>
        <span>조직도</span>
      </div>

      <!-- 사이드: 직원관리 -->
      <div v-if="isHrDepartment" class="menu-item" @click="$router.push('/employee-management')"
        :class="{ 'active': $route.path.startsWith('/employee-management') }"
        @mouseover="showSubSidebar('employee-management')">
        <v-icon class="icon">mdi-account-cog</v-icon>
        <span>직원 관리</span>
      </div>
    </div>
  </aside>


  <aside v-show="isSubSidebarVisible" class=" sub-sidebar" @mouseover="keepSubSidebarVisible"
    @mouseleave="hideSubSidebar">

    <!-- 서브사이드: 게시판 -->
    <div v-if="hoveredMenu === 'board'">
      <v-row @click="$router.push('/board/list')">
        공지사항
      </v-row>
      <v-row @click="$router.push('/board/list')">
        경조사
      </v-row>
      <v-row @click="$router.push('/qna/list')">
        Q&A
      </v-row>
    </div>

    <!-- 서브사이드: 문서 관리 -->
    <div v-if="hoveredMenu === 'document'">
      <v-row>
        팀 문서함
      </v-row>
      <v-row>
        <v-btn class="createBtn" @click="$router.push('/document/create')">
          문서 등록
        </v-btn>
      </v-row>

      <v-row @click="$router.push('/document')">
        전체 문서함
      </v-row>
      <v-row @click="$router.push('/document/list/updated')">
        최근 업데이트 문서함
      </v-row>
      <v-row @click="$router.push('/document/list/viewed')">
        최근 조회 문서함
      </v-row>
    </div>

    <!-- 서브사이드: 예약 -->
    <div v-if="hoveredMenu === 'reservation'">
      <v-row @click="$router.push('/reservation/meetReservationList')">
        회의실 예약
      </v-row>
      <v-row @click="$router.push('/reservation/reservationList')">
        법인 차량 예약 </v-row>
    </div>

    <!-- 서브사이드: 결재 -->
    <div v-if="hoveredMenu === 'submit'">
      <v-row>
        <v-btn class="createBtn" @click="$router.push('/submit')">
          결재 생성
        </v-btn>
      </v-row>
      <v-row @click="$router.push('/submit/list')">
        결재 할 문서
      </v-row>
      <v-row @click="$router.push('/submit/list/my')">
        결재 요청 문서
      </v-row>

    </div>

    <!-- 서브사이드: 메신저-->
    <div v-if="hoveredMenu === 'messenger'">
      매신저 서브사이드바
    </div>

    <!-- 서브사이드: 화상 회의 -->
    <div v-if="hoveredMenu === 'video'">
      화상회의 서브사이드바
    </div>

    <!-- 서브사이드: 직원관리 -->
    <div v-if="hoveredMenu === 'employee-management'">
      직원관리 서브사이드바
    </div>
  </aside>
</template>


<script>
// import axios from 'axios';

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
      hoveredMenu: '',
      isHoveringSidebar: false,
    };
  },
  methods: {
    toggleProjectVisibility() {
      this.showProject = !this.showProject;
      if (this.showProject) {
        this.fetchTypes();

      }
    },
    async fetchTypes() {
      try {
        // const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/types`, { headers: { Authorization: `Bearer ${this.token}` } });
        // this.typeOptions = response.data.result;
        // console.log(this.typeOptions)
        console.log("타입 리스트 수정필요");
      } catch (e) {
        console.error('문서 타입 가져오는 중 오류 발생:', e);
      }
    },
    // 처음 사이드바 나타냄
    showSubSidebar(menu) {
      this.hoveredMenu = menu;
      this.isSubSidebarVisible = true;
      this.isHoveringSidebar = true;
    },
    // 사이드바 사라짐
    hideSubSidebar() {
      this.hoveredMenu = '';
      this.isSubSidebarVisible = false;
      this.isHoveringSidebar = false;
    },
    // 사이드바 유지
    keepSubSidebarVisible() {
      this.isSubSidebarVisible = true;
      this.isHoveringSidebar = true;
    }
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
  --sidebar-width: 13%;
  --sub-sidebar-width: 15%;
  --header-height: 60px;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  align-items: start;
  justify-content: center;
  font-size: 14px;
}

.sub-sidebar {
  background-color: rgba(122, 86, 86, 0.2);
  width: var(--sub-sidebar-width);
  height: 100vh;
  position: fixed;
  top: 8vh;
  left: var(--sidebar-width);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 25px;
  padding: 25px;
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
  align-items: center;
  justify-content: start;
  color: #444444;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  padding: 10px;
  position: relative;
}

.menu-item .icon {
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #444444;
  padding-right: 13px;
}

.menu-item:hover {
  opacity: 0.5;
  visibility: visible;
}

.menu-item.active {
  color: #7A5656;
  font-weight: 700;
  border-bottom: 1px solid #7A5656;
}

.menu-item.active>.icon {
  color: #7A5656;
}

.v-list {
  color: #444444;
}

.logo img {
  height: 6vh;
}

.subside-menu {
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
}


.myp {
  width: 150px;
}

.mypage-item {
  margin: 20px;
  list-style-type: none;
  cursor: none;
  transition: margin 0.3s ease;
}

.mypage-item:hover {
  margin: 30px;
  margin-left: 40px;
  font-weight: 700;
}
</style>
