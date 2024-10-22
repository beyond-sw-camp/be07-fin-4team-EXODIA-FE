<!-- src/views/mypage/mypagetemplate.vue -->
<template>
    <v-container fluid>
      <v-tabs v-model="$route.path" background-color="green lighten-5" centered class="header-tabs">
        <v-tab to="/mypage/attendance">전사 근태 통계</v-tab>
        <v-tab to="/mypage/userProfile">프로필</v-tab>
        <v-tab to="/mypage/evaluationList">평가리스트</v-tab>
        <v-tab to="/mypage/lunch">오늘의 점심</v-tab>
        <v-tab to="/mypage/evaluationFrame">인사평가</v-tab>
      </v-tabs>
  
      <v-tabs-items v-model="$route.path">
        <v-tab-item value="/mypage/attendance">
          <slot name="attendance"></slot>
        </v-tab-item>
        <v-tab-item value="/mypage/userProfile">
          <slot name="profile"></slot>
        </v-tab-item>
        <v-tab-item value="/mypage/evaluationList">
          <slot name="evaluationList"></slot>
        </v-tab-item>
        <v-tab-item value="/mypage/lunch">
          <slot name="lunch"></slot>
        </v-tab-item>
        <v-tab-item value="/mypage/evaluationFrame">
          <slot name="evaluation"></slot>
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </template>
  
  <script>
  export default {
  };
  </script>
  