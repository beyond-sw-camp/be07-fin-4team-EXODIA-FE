<template>
  <aside class="sidebar">
    <div class="menu">

      <!-- 로고 -->
      <div class="logo" @click="$router.push('/')">
        <img :src="require('@/assets/exodia_new.png')" alt="Logo" />
      </div>

      <div class="subsidebarscroll">

        <!-- 사이드: 파일 관리 @click="toggleMenu('document')"-->
        <div @mouseleave="closeSubSideBar()">
          <div class="menu-item" :class="{ 'active': $route.path.startsWith('/document') }"
            @mouseover="showSubSidebar('document')">
            <v-icon class="icon">mdi-folder-file-outline</v-icon>
            <span>파일 관리</span>
          </div>
          <!-- <div class="menu-item" @click="toggleMenu('document')" :class="{ 'active': $route.path.startsWith('/document') }"
          @mouseover="showSubSidebar('document')">
          <v-icon class="icon">mdi-folder-file-outline</v-icon>
          <span>파일 관리</span>
          </div> -->

          <!-- 서브사이드: 파일 관리 -->
          <div v-show="expandedMenu === 'document' || hoveredMenu === 'document'" class="sub-side-menu">
            <v-row @click="$router.push('/document')">
              전체 파일
            </v-row>
            <v-row @click="$router.push('/document/list/updated')">
              최근 수정 파일
            </v-row>
            <v-row @click="$router.push('/document/list/viewed')">
              최근 조회 파일
            </v-row>
          </div>
        </div>

        <!-- 사이드: 결재 @click="toggleMenu('submit')"-->
        <div @mouseleave="closeSubSideBar()">
          <div class="menu-item" :class="{ 'active': $route.path.startsWith('/submit') }"
            @mouseover="showSubSidebar('submit')">
            <v-icon class="icon">mdi-pencil-box</v-icon>
            <span>전자 결재</span>
          </div>

          <!-- 서브사이드: 결재 -->
          <div v-show="expandedMenu === 'submit' || hoveredMenu === 'submit'" class="sub-side-menu">
            <v-row @click="$router.push('/submit/list')">
              결재 할 문서
            </v-row>
            <v-row @click="$router.push('/submit/list/my')">
              결재 요청 문서
            </v-row>
          </div>
        </div>

        <!-- 사이드: 예약 @click="toggleMenu('reservation')"-->
        <div @mouseleave="closeSubSideBar()">
          <div class="menu-item" :class="{ 'active': $route.path.startsWith('/reservation/reservationList') }"
            @mouseover="showSubSidebar('reservation')">
            <v-icon class="icon">mdi-timer-sand</v-icon>
            <span>예약</span>
          </div>

          <!-- 서브사이드: 예약 -->
          <div v-show="expandedMenu === 'reservation' || hoveredMenu === 'reservation'" class="sub-side-menu">
            <v-row @click="$router.push('/reservation/meetReservationList')">
              회의실 예약
            </v-row>
            <v-row @click="$router.push('/reservation/reservationList')">
              법인 차량 예약 </v-row>
          </div>
        </div>

        <!-- 사이드: 게시판 @click="toggleMenu('board')"  -->
        <div @mouseleave="closeSubSideBar()">
          <div class="menu-item" :class="{ 'active': $route.path.startsWith('/board') }"
            @mouseover="showSubSidebar('board')">
            <v-icon class="icon">mdi-format-list-bulleted</v-icon>
            <span>게시판</span>
          </div>

          <!-- 서브사이드: 게시판 -->
          <div v-show="expandedMenu === 'board' || hoveredMenu === 'board'" class="sub-side-menu">
            <v-row @click="$router.push('/board/notice/list')">공지사항</v-row>
            <v-row @click="$router.push('/board/familyevent/list')">경조사</v-row>
            <v-row @click="$router.push('/qna/list')">질의 응답 (Q&A)</v-row>
            <v-row @click="$router.push('/board/courseList')">이벤트</v-row>
          </div>
        </div>


        <!-- 사이드: 화상 회의  @click="toggleMenu('video')"-->
        <div @mouseleave="closeSubSideBar()">
          <div class="menu-item" :class="{ 'active': $route.path.startsWith('/video') }"
            @mouseover="showSubSidebar('video')">
            <v-icon class="icon">mdi-video</v-icon>
            <span>화상회의</span>
          </div>

          <!-- 서브사이드: 화상 회의 -->
          <div v-show="expandedMenu === 'video' || hoveredMenu === 'video'" class="sub-side-menu">
            <!-- 디자인 때문에 임의로 v-btn 제거 -->
            <v-row @click="$router.push('/video/create')">
              화상 회의 생성
            </v-row>
            <v-row @click="$router.push('/video/list')">
              화상 회의 목록
            </v-row>
          </div>
        </div>


        <!-- 사이드: 조직도 -->
        <div class="menu-item" @click="toggleOrganizationPanel">
          <v-icon class="icon">mdi-account-group</v-icon>
          <span>조직도</span>
        </div>

        <!-- 조직도 및 유저 정보 패널을 각각 독립적으로 위치 -->
        <div class="organization-container-wrapper">
          <!-- 조직도 패널 -->
          <v-card flat v-if="showOrganizationPanel" class="organization-panel">
            <v-card-title>
              <span>조직도</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="toggleOrganizationPanel" class="close-btn">
                <v-icon small class="close-icon">mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <OrganizationChart @user-selected="selectUser" />
            </v-card-text>
          </v-card>

          <!-- 유저 정보 패널이 조직도 옆에 독립적으로 나타남 -->
          <v-card v-if="selectedUser" flat class="user-profile-panel">
            <v-card-title>
              <span>{{ selectedUser.name }}</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="clearSelectedUser" class="close-btn">
                <v-icon small class="close-icon">mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-img :src="selectedUser.profileImage" class="profile-image"></v-img>
              <p>사번: {{ selectedUser.userNum }}</p>
              <p>부서: {{ selectedUser.departmentName }}</p>
              <p>직급: {{ selectedUser.positionName }}</p>
              <p>핸드폰 번호: {{ selectedUser.phone }}</p>
            </v-card-text>
          </v-card>
        </div>

        <!-- 사이드: 직원관리   @click="toggleMenu('employee-management')"-->
        <div @mouseleave="closeSubSideBar()">
          <div v-if="isHrDepartment" class="menu-item"
            :class="{ 'active': $route.path.startsWith('/employee-management') }"
            @mouseover="showSubSidebar('employee-management')">
            <v-icon class="icon">mdi-account-cog</v-icon>
            <span>직원 관리</span>
          </div>
          <!-- 서브사이드: 직원관리 -->
          <div
            v-show="expandedMenu === 'employee-management' || hoveredMenu === 'employee-management' || hoveredMenu === 'salary-management' || hoveredMenu === 'department-management' || hoveredMenu === 'eventList'"
            class="sub-side-menu">

            <v-row @click="$router.push('/employee-management')">직원 목록</v-row>
            <v-row @click="$router.push('/salary-management')">급여 관리</v-row>
            <v-row @click="$router.push('/eventList')">일정 관리</v-row>
            <v-row @click="$router.push('/department-management')">부서 관리</v-row>
            <!-- <v-row style="font-weight:700; font-size:16px;">
          직원 관리
        </v-row>
        <v-row>
          <v-btn style="color:#ffffff" @click="$router.push('/employee-management/create')">
            직원 등록
          </v-btn>
        </v-row>
        <v-row @click="$router.push('/employee-management')">
          직원 목록
        </v-row>
        <v-row style="font-weight:700; font-size:16px;" @click="$router.push('/salary-management')">
          급여 관리
        </v-row>
        <v-row @click="$router.push('/eventList')" style="font-weight:700; font-size:16px;">
          일정 관리
        </v-row>
        <v-row style="font-weight:700; font-size:16px;" @click="$router.push('/department-management')">
          부서 관리
        </v-row> -->
          </div>
        </div>
      </div>
    </div>
  </aside>

</template>


<script>
// import axios from 'axios';
import OrganizationChart from '@/views/organization/OrganizationChart.vue';

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
      expandedMenu: null,

      showOrganizationPanel: false,
      selectedUser: null,
    };
  },
  components: {
    OrganizationChart,
  },
  methods: {
    toggleOrganizationPanel() {
      this.showOrganizationPanel = !this.showOrganizationPanel;
    },
    selectUser(user) {
      this.selectedUser = user;
      console.log(user);
      console.log(this.selectedUser);

    },
    clearSelectedUser() {
      this.selectedUser = null;
    },
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

      this.expandedMenu = this.expandedMenu === menu ? null : menu;
    },
    closeSubSideBar() {
      this.hoveredMenu = '';
      this.isSubSidebarVisible = false;
      this.isHoveringSidebar = false;

      this.expandedMenu = null;
    },
    // toggleMenu(menu) {
    //   this.expandedMenu = this.expandedMenu === menu ? null : menu;
    //   console.log(this.expandedMenu);
    // },
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
  --sidebar-width: 7%;
  --sub-sidebar-width: 15%;
  --header-height: 60px;
}

*:not(.menu-itm):not(.organization-panel):not(.organization-panel *):not(.user-profile-panel):not(.user-profile-panel *) {
  background-color: #7A5656;
}


.v-row {
  cursor: pointer;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  /* min-height: 100vh; */
  position: fixed;
  top: 15vh;
  left: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-content: center;
  /* overflow-y: auto; */
}

.subsidebarscroll{
  height: 550px;
  overflow-y: auto;
  overflow-x: hidden;

}

.subsidebarscroll::-webkit-scrollbar {
  width: 6px;
}
.subsidebarscroll::-webkit-scrollbar-thumb {
  background-color: #888888;
  border-radius: 10px;
}
.subsidebarscroll::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 10px;
}

.menu {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-content: center;
  height: 100%;
  padding-top: 20px;
}

.menu-item {
  color: #ffffff;
  transition: background-color 0.3s;
  width: 100%;
  padding: 20px;
  position: relative;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
}

.menu-item .icon {
  font-size: 20px;
  color: #ffffff;
  padding-right: 15px;
}


.menu-item.active {
  font-weight: 700;
}

.sub-side-menu {
  padding-left: 36px;
  padding-right: 3px;
}

.sub-side-menu>.v-row {
  font-size: 14px;
  padding: 10px;
  color: #ffffff;
}

.logo img {
  height: 15vh;
}

.myp {
  width: 150px;
}

.mypage-item {
  margin: 20px;
  list-style-type: none;
  cursor: pointer;
  transition: margin 0.3s ease;
}

.mypage-item:hover {
  margin: 30px;
  margin-left: 40px;
  font-weight: 700;
}

.logo {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #7A5656;
  z-index: 100;
  cursor: pointer;
}

.v-dialog {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 350px;
  background-color: white;
  z-index: 2000;
}

.organization-container-wrapper {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}

.organization-panel {
  position: fixed;
  top: calc(100vh - 90vh);
  left: calc(var(--sidebar-width) + 10px);
  width: 300px;
  height: 70vh;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1100;
  border-radius: 8px;
  overflow: auto;
  -ms-overflow-style: none;
  /* 인터넷 익스플로러 */
  scrollbar-width: none;
  /* 파이어폭스 */
}

/* scroll 숨김 */
.organization-panel::-webkit-scrollbar {
  display: none;
}

.organization-panel-wide {
  position: fixed;
  top: calc(100vh - 50vh);
  left: calc(var(--sidebar-width) + 10px);
  width: 500px;
  height: 40vh;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1100;
  border-radius: 8px;
  overflow: auto;
}

.user-profile-panel {
  position: fixed;
  top: calc(100vh - 90vh);
  left: calc(var(--sidebar-width) * 2.5);
  width: 300px;
  height: 40vh;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1100;
  border-radius: 8px;
  overflow: auto;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 15px;
}

.v-btn.close-btn {
  position: absolute;
  top: 15px;
  right: 10px; 
  margin: 0;
  padding: 0;
  border: none;
  background-color: transparent;
  size: 5px;
  min-width: 0;
  width: 20px;  
  height: 20px; 
  box-shadow: none;
}

.v-btn.close-btn v-icon {
  font-size: 10px; 
  color: #333;
}

.close-icon {
  font-size: 20px; 
}

.v-card-title {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
}

.v-card-text {
  padding: 10px;
  flex-grow: 1; /* 스크롤 가능 영역을 확장 */
  overflow-y: auto
}

.v-card {
  background-color: white; 
}

</style>