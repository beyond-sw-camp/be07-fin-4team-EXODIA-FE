<template>
  <v-container fluid>
    <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">
      <v-tab :to="'/mypage/vacation'">전사 근태 통계</v-tab>
      <v-tab :to="'/mypage/userProfile'">프로필</v-tab>
      <v-tab :to="'/mypage/evalutionList'">평가리스트</v-tab>
      <v-tab :to="'/mypage/spinWheel'">오늘의 점심</v-tab>
      <v-tab :to="'/mypage/evalutionFrame'">인사평가</v-tab>
      <v-tab :to="'/board/myCourseList'">나의강좌</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item :value="'/mypage/vacation'">
        <slot name="attendance"></slot>
      </v-tab-item>
      <v-tab-item :value="'/mypage/userProfile'">
        <slot name="profile"></slot>
      </v-tab-item>
      <v-tab-item :value="'/mypage/evalutionList'">
        <slot name="evaluationList"></slot>
      </v-tab-item>
      <v-tab-item :value="'/mypage/spinWheel'">
        <slot name="spinWheel"></slot>
      </v-tab-item>
      <v-tab-item :value="'/mypage/evalutionFrame'">
        <slot name="evaluation"></slot>
      </v-tab-item>
      <v-tab-item :value="'/board/myCourseList'">
        <slot name="myCourseList"></slot>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
export default {
  name: 'MypageTemplate',
  data() {
    return {
      activeTab: this.$route.path,
    };
  },
  watch: {
    '$route.path'(newPath) {
      this.activeTab = newPath;
    }
  }
};
</script>