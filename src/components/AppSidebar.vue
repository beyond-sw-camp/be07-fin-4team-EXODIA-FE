<template>
    <aside class="sidebar">
      <div class="menu">
        <div class="menu-item">
          <v-icon class="icon">mdi-home</v-icon>
          <span class="tooltip">홈</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-calendar</v-icon>
          <span class="tooltip">캘린더</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-book-open-variant</v-icon>
          <span class="tooltip">공지사항</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-email</v-icon>
          <span class="tooltip">메일</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-timer-sand</v-icon>
          <span class="tooltip">근무시간</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-pencil-box</v-icon>
          <span class="tooltip">기록</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-message-text</v-icon>
          <span class="tooltip">채팅</span>
        </div>
        <div class="menu-item">
          <v-icon class="icon">mdi-account-group</v-icon>
          <span class="tooltip">팀</span>
        </div>
      </div>
    </aside>
  </template>
  
  <script>
  export default {
    name: 'AppSidebar',
  };
  </script>
  
  <style scoped>
  :root {
    --sidebar-width: 7%; /* 사이드바 너비 */
    --header-height: 60px; /* 헤더 높이 */
  }
  
  .sidebar {
    width: var(--sidebar-width); /* 사이드바 너비 */
    height: 100vh; /* 전체 높이 사용 */
    background-color: #5fde63; /* 사이드바 배경색 */
    position: fixed; /* 화면 왼쪽에 고정 */
    top: 0;
    left: 0;
    z-index: 1000; /* 다른 요소보다 앞에 위치 */
    display: flex; /* Flexbox 레이아웃 */
    align-items: center; /* 수직 가운데 정렬 */
    justify-content: center; /* 가로 가운데 정렬 */
  }
  
  .menu {
    display: flex;
    flex-direction: column; /* 메뉴 아이템들을 세로로 정렬 */
    justify-content: space-evenly; /* 사이드바 높이를 기준으로 균등한 간격 배치 */
    align-items: center; /* 가로 중앙 정렬 */
    height: 100%; /* 전체 높이 기준으로 정렬 */
    overflow: hidden; /* 스크롤을 제거 */
  }
  
  .menu-item {
    display: flex;
    flex-direction: column; /* 아이콘과 툴팁을 세로로 정렬 */
    align-items: center; /* 아이콘과 툴팁을 가로 중앙 정렬 */
    justify-content: center; /* 세로 중앙 정렬 */
    color: #ffffff;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%; /* 메뉴 아이템 너비 */
  }
  
  .menu-item .icon {
    font-size: 2vw; /* 아이콘 크기를 뷰포트 너비의 2%로 설정 */
    display: flex; /* Flexbox 사용 */
    justify-content: center; /* 아이콘 가로 중앙 정렬 */
    align-items: center; /* 아이콘 세로 중앙 정렬 */
    color: #ffffff; /* 아이콘 색상 */
  }
  
  .tooltip {
    position: absolute; /* 상대적인 위치 설정 */
    top: 50%; /* 아이콘의 수직 중앙에 위치 */
    left: calc(100% + 10px); /* 사이드바 너비에 비율로 위치 설정 */
    transform: translateY(-50%); /* 툴팁을 수직 중앙 정렬 */
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 5px 10px; 
    border-radius: 4px; 
    white-space: nowrap;
    opacity: 0; 
    visibility: hidden; 
    transition: opacity 0.3s ease, visibility 0.3s ease; 
  }
  
  /* 툴팁이 보이도록 설정 */
  .menu-item:hover .tooltip {
    opacity: 1; /* 툴팁을 보이게 설정 */
    visibility: visible; /* 툴팁을 보이게 설정 */
  }
  
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1); /* hover 시 배경색 */
  }
  </style>
  