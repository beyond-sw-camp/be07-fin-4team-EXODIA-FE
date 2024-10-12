<template>
  <v-app>
    <div v-if="!isLoginPage" class="app-container">
      <AppSidebar />
      <div class="main-layout">
        <HeaderComponent />
        <div class="main-content">
          <v-card style="padding:70px; border-radius:10px">
            <router-view />
          </v-card>
        </div>
      </div>
    </div>
    <div v-else>
      <router-view />
    </div>
  </v-app>
</template>

<script>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import AppSidebar from './components/AppSidebar.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    AppSidebar,
  },
  setup() {
    const route = useRoute();

    const isLoginPage = computed(() => route.path === '/login');

    return {
      isLoginPage,
    };
  },
};
</script>

<style>
:root {
  --sidebar-width: 20%;
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
  padding: 70px 160px;
  background-color: #f5f5f5;
  border-radius: 25px;
  overflow-y: auto;
}
</style>
