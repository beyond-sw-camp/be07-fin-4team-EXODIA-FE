<template>
  <aside class="sidebar">
    <div class="menu">
      <div class="logo" @click="$router.push('/')">
        <img :src="require('@/assets/exodia.png')" alt="Logo" />
      </div>

      <!-- 메뉴를 헤더에 넣을지 사이드바에 넣을지 아니면 뺴버릴지 -->
      <div class="menu-item" @click="toggleSubSidebar">
        <v-icon class="icon">mdi-menu</v-icon>
        <span>메뉴</span>
      </div>

      <!-- 게시판 -->
      <div class="menu-item" @click="$router.push('/board/notice/List')"
        :class="{ 'active': $route.path.startsWith('/board') }">
        <v-icon class="icon">mdi-format-list-bulleted</v-icon>
        <span>게시판</span>
      </div>

      <!-- 문서 관리 -->
      <div class="menu-item" @click="$router.push('/document')"
        :class="{ 'active': $route.path.startsWith('/document') }">
        <v-icon class="icon">mdi-folder-file-outline</v-icon>
        <span>문서 관리</span>
      </div>

      <!-- 예약 -->
      <div class="menu-item" @click="$router.push('/reservation/reservationList')"
        :class="{ 'active': $route.path.startsWith('/reservation') }">
        <v-icon class="icon">mdi-timer-sand</v-icon>
        <span>예약</span>
      </div>

      <!-- 결재 -->
      <div class="menu-item" @click="$router.push('/submit')" :class="{ 'active': $route.path.startsWith('/submit') }">
        <v-icon class="icon">mdi-pencil-box</v-icon>
        <span>전자 결재</span>
      </div>


      <!-- 메신저 -->
      <div class="menu-item" @click="$router.push('/messenger')"
        :class="{ 'active': $route.path.startsWith('/messenger') }">
        <v-icon class="icon">mdi-forum-outline</v-icon>
        <span>메신저</span>
      </div>

      <!-- 화상회의 -->
      <div class="menu-item" @click="$router.push('/video/rooms')"
        :class="{ 'active': $route.path.startsWith('/video') }">
        <v-icon class="icon">mdi-video</v-icon>
        <span>화상회의</span>
      </div>

      <!-- 조직도 -->
      <div class="menu-item" @click="$router.push('/organization')"
        :class="{ 'active': $route.path.startsWith('/organization') }">
        <v-icon class="icon">mdi-account-group</v-icon>
        <span>조직도</span>
      </div>

      <!-- 직원관리 -->
      <div v-if="isHrDepartment" class="menu-item" @click="$router.push('/employee-management')"
        :class="{ 'active': $route.path.startsWith('/employee-management') }">
        <v-icon class="icon">mdi-account-cog</v-icon>
        <span>직원 관리</span>
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

        <div v-if="currentPage.startsWith('/board/') || currentPage.startsWith('/qna')" class="subside-menu">
          <!-- 공지사항 섹션 -->
          <div class="menu-item section-item" @click="$router.push('/board/notice/list')">
            <span style="font-size: 16px; font-weight: 700;">공지사항</span>
          </div>
        
          <!-- 경조사 섹션 -->
          <div class="menu-item section-item" @click="$router.push('/board/familyevent/list')">
            <span style="font-size: 16px; font-weight: 700;">경조사</span>
          </div>
        
          <!-- Q&A 섹션 -->
          <div class="menu-item section-item" @click="$router.push('/qna/list')">
            <span style="font-size: 16px; font-weight: 700;">Q&A</span>
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

        <div v-if="currentPage.startsWith('/mypage')" class="myp">
          <div class="menu-item" >
            <span style="font-size:20px; font-weight:800">마이페이지</span>
              <ul style="margin-bottom: 20px;">
                <li @click="$router.push('/mypage/userProfile')" class="mypage-item">프로필</li>
                <li @click="$router.push('/mypage/evalutionFrame')" class="mypage-item">평가리스트</li>
                <li @click="$router.push('/mypage/spinWheel')" class="mypage-item">오늘의점심</li>
                <li @click="$router.push('/mypage/evalutionList')" class="mypage-item">인사평가</li>
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

      isSubSidebarVisible: true,
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

.v-list {
  color: #444444;
}


.logo img {
  height: 6vh;
}

.menu-item.active {
  color: #7A5656;
  font-weight: 700;
  border-bottom: 1px solid #7A5656;

}

.menu-item.active>.icon {
  color: #7A5656;
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
  font-weight:700;
}
</style>

