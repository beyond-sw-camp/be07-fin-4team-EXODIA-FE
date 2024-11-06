<template>
  <v-container fluid>
    <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">
      <v-tab :to="'/mypage/vacation'">전사/근태 통계</v-tab>
      <v-tab :to="'/mypage/userProfile'">프로필</v-tab>

      <v-tab :to="{ path: '/mypage/evalutionList', query: { isEvaluationPeriod: isEvaluationPeriod } }">
        인사평가
      </v-tab> <v-tab :to="'/mypage/evalutionFrame'">평가리스트</v-tab>


      <v-tab :to="'/mypage/spinWheel'">오늘의 점심</v-tab>

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
    </v-tabs-items>
  </v-container>
</template>

<script>
import axios from 'axios';
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
  },
  mounted() {
    this.fetchEvaluationPeriod();
  },
  methods: {
    async fetchEvaluationPeriod() {
      try {
        const response = await axios.get('/eventDate/getEventId/인사평가');
        const { startDate, endDate } = response.data;

        // 현재 날짜
        const currentDate = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        this.isEvaluationPeriod = currentDate >= start && currentDate <= end;
      } catch (error) {
        console.error('Failed to fetch evaluation period:', error);
      }
    },
    checkEvaluationPeriod() {
      if (!this.isEvaluationPeriod) {
        alert('현재는 인사평가 기간이 아닙니다.');
      }
    }
  }

};
</script>


<style coped>
.header-tabs {
  box-shadow: 0px 4px 4px -2px #F2F2F2;
}
</style>