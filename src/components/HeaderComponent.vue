<template>
  <header class="header">
    <div class="icons">
      <div class="icon-item" @click="$router.push('/calendar/calendarList')"
        :class="{ 'active': $route.path.startsWith('/calendar') }">
        <v-icon class="icon">mdi-calendar</v-icon>
      </div>
      <v-icon class="icon">mdi-bell</v-icon>
      <v-avatar class="icon" @click="$router.push('/mypage/userProfile')">
        <img src="@/assets/sh.png" alt="User Avatar" class="user-avatar"
          style="width: 100%; height: 100%; object-fit: cover;" />
      </v-avatar>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
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
  font-size: 14px;
}

.icons {
  display: flex;
  align-items: center;
  color: #444444;
}

.icon {
  margin-left: 20px;
  cursor: pointer;
  font-size: 25px;
}

.icons>v-avatar {
  margin-left: 4vw;
  height: 5vh;
  width: 5vh;
}

.icon:hover {
  opacity: 0.5;
  visibility: visible;
}

.icon-item.active {
  color: #7A5656;
  font-weight: 700;
  background-color: rgba(122, 86, 86, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-content: center;
}

.icon-item.active>.icon {
  color: #7A5656;
}
</style>
