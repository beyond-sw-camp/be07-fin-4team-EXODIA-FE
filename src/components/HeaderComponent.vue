<template>
  <header class="header">
    <div class="logo">
      <img :src="require('@/assets/exodia.png')" alt="Logo" />
    </div>
    <div class="icons">
      <v-icon class="icon">mdi-help-circle-outline</v-icon>
      <v-icon class="icon">mdi-email</v-icon>
      <v-icon class="icon">mdi-message</v-icon>
      <v-icon class="icon">mdi-bell</v-icon>
      <v-avatar>
        <img src="@/assets/user.png" alt="User Avatar" class="user-avatar" />
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
  justify-content: space-between;
  align-items: center;
  background-color: #e6f1e3;
  border-bottom: 1px solid #d9e5d6;
  height: 8vh;
  z-index: 1000;
  width: calc(100% - var(--sidebar-width));
  position: fixed;
  left: var(--sidebar-width);
  top: 0;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 6vh; 
  margin-right: 2vw; 
}

.icons {
  display: flex;
  align-items: center;
}

.icons > .icon {
  font-size: 4vh; 
  margin-left: 4vw; 
  cursor: pointer;
}

.icons > v-avatar {
  margin-left: 4vw;
  height: 5vh;
  width: 5vh; 
}


</style>


