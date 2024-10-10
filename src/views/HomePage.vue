<template>
  <v-row>
    <!-- 달력 -->
    <v-col cols="8">
      <v-card outlined>
        <v-card-text>달력(일정)</v-card-text>
      </v-card>
    </v-col>

    <!-- 알림과 프로필 -->
    <v-col cols="4">
      <v-row>
        <v-col cols="12">
          <v-card outlined>
            <v-card-text>알림</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card outlined class="blue--text">
            <v-card-text>프로필</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row>
    <!-- 공지사항 -->
    <v-col cols="6">
      <v-card outlined>
        <v-card-text>공지사항</v-card-text>
      </v-card>
    </v-col>

    <!-- 팀원들 출근현황 -->
    <v-col cols="6">
      <v-card outlined>
        <v-card-text>팀원들 출근현황</v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'HomePage',
};
</script>

<style scoped></style>
