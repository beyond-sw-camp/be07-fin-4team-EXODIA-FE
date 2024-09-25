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
        <span class="tooltip">게시판</span>
      </div>
      <div class="menu-item">
        <v-icon class="icon">mdi-email</v-icon>
        <span class="tooltip">문서 관리</span>
      </div>
      <div class="menu-item">
        <v-icon class="icon">mdi-timer-sand</v-icon>
        <span class="tooltip">예약</span>
      </div>
      <div class="menu-item">
        <v-icon class="icon">mdi-pencil-box</v-icon>
        <span class="tooltip">결재</span>
      </div>
      <div class="menu-item">
        <v-icon class="icon">mdi-message-text</v-icon>
        <span class="tooltip">메신저</span>
      </div>
      <div class="menu-item">
        <v-icon class="icon">mdi-video</v-icon>
        <span class="tooltip">화상회의</span>
      </div>
      <div class="menu-item">
        <v-icon class="icon">mdi-account-group</v-icon>
        <span class="tooltip">조직도</span>
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
  --sidebar-width: 4%;
  --header-height: 60px;
}

.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: #5fde63;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
  overflow: hidden;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
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
