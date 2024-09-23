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
  --sidebar-width: 5%; 
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
  background-color: #e6f1e3;
  display: flex; 
  align-items: center;
  padding: 0 20px; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: calc(100% - var(--sidebar-width));
  position: fixed; 
  top: 0;
  left: var(--sidebar-width); 
  z-index: 1000; 
}

.main-content {
  flex: 1;
  margin-top: var(--header-height); 
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto; 
}
</style>
