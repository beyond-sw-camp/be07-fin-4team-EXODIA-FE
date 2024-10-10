<template>
  <v-app>
    <div class="app-container">
      <AppSidebar />
      <div class="main-layout">
        <HeaderComponent />
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </v-app>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue';
import AppSidebar from './components/AppSidebar.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    AppSidebar,
  },
};
</script>

<style>
:root {
  --sidebar-width: 13%;
  --header-height: 60px;
}

.app-container {
  display: flex;
  height: 100vh;
}

.main-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: var(--sidebar-width);
}

.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 20px;
  width: calc(100% - var(--sidebar-width));
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  z-index: 500;
}

.main-content {
  flex: 1;
  margin-top: var(--header-height);
  padding: 50px 200px;
  margin-right: 40px;
  background-color: #f5f5f5;
  border-radius: 25px;
  overflow-y: auto;
}
</style>
