<template>
  <v-container fluid>

    <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">
      <v-tab @click="navigateTab(0)">출/퇴근</v-tab>
      <v-tab @click="navigateTab(1)">프로필</v-tab>
      <v-tab @click="navigateTab(2)">인사 평가</v-tab>
      <v-tab @click="navigateTab(3)">오늘의 점심</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item v-if="activeTab === 0">
        <h3>출/퇴근 정보</h3>
      </v-tab-item>

      <!-- 프로필 -->
      <v-tab-item v-if="activeTab === 1">
        <v-row no-gutters class="profile-content">
          <v-col cols="12" md="3">
            <v-card class="profile-card">
              <v-img 
                :src="userProfile?.profileImage || defaultProfileImage" 
                aspect-ratio="1" 
                class="profile-img"
              ></v-img>
              <v-card-title class="profile-name">{{ userProfile?.name || '이름' }}</v-card-title>
            </v-card>
          </v-col>

          <v-col cols="12" md="8" class="profile-info">
            <v-card class="info-card">
              <v-card-text>
                <v-simple-table>
                  <thead>
                    <tr>
                      <th style="width: 30%;">항목</th>
                      <th style="width: 70%;">세부 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>사번</td>
                      <td>{{ userProfile?.userNum || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>부서명</td>
                      <td>{{ userProfile?.departmentName || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>직책</td>
                      <td>{{ userProfile?.positionName || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>전화번호</td>
                      <td>{{ userProfile?.phone || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td>입사일</td>
                      <td>{{ userProfile?.joinDate || 'N/A' }}</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <!-- 인사 평가 -->
      <v-tab-item v-if="activeTab === 2">
        <h3>인사 평가</h3>
        <!-- 인사 평가 정보를 여기에 표시 -->
      </v-tab-item>

      <!-- 오늘의 점심 -->
      <v-tab-item v-if="activeTab === 3">
        <h3>오늘의 점심 추천</h3>
        <!-- 오늘의 점심 추천 관련 정보를 여기에 표시 -->
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: "UserProfile",
  data() {
    return {
      activeTab: 1,
      userProfile: {},
      tabs: [
        { label: "출/퇴근" },
        { label: "프로필" },
        { label: "인사 평가" },
        { label: "오늘의 점심" }
      ],
      defaultProfileImage: 'https://via.placeholder.com/150'
    };
  },
  mounted() {
    this.fetchUserProfile();
  },
  
  methods: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('token');
        const userNum = localStorage.getItem('userNum');
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Received User Profile:', response.data);
        this.userProfile = response.data;
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
    navigateTab(index) {
      if (index === 0) {
        this.$router.push('/mypage/attendance');
      } else if (index === 3) {
        this.$router.push('/mypage/spinWheel');
      } else {
        this.activeTab = index;
      }
    }
  }
};
</script>

<style scoped>
/* 헤더 탭 여백 */
.header-tabs {
  margin-bottom: 30px;
}

.tab-item {
  font-weight: bold;
  font-size: 16px;
  color: #4CAF50;
}
.v-tabs--density-default {
    --v-tabs-height: 48px;
}
.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.v-tab {
  font-weight: bold;
}

/* 프로필(이미지) 컨텐츠 */
.profile-content {
  margin-top: 30px;
}

.profile-card {
  text-align: center;
  padding: 20px;
  margin: 0;
}

.profile-img {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin: 0 auto;
}

.profile-name {
  font-size: 24px;
  font-weight: bold;
  margin-top: 20px;
}

/* 테이블(유저 정보) */
.profile-info {
  margin-left: 30px;
}

.info-card {
  padding: 20px;
}

.v-simple-table {
  width: 100%;
}

thead th {
  background-color: #f0f0f0;
  font-weight: bold;
  text-align: left;
  padding: 10px;
}

tbody td {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

td:first-child {
  font-weight: bold;
  color: #666;
}
</style>
