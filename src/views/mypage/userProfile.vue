<template>
  <MypageTemplate>
    <template #profile>
      <v-container fluid>
        <v-row no-gutters>
          <v-col cols="12" md="4" class="profile-content">
            <v-row class="profile-card" style="margin-top: 40px;">
              <img :src="userProfile?.profileImage || defaultProfileImage" class="profile-img">
            </v-row>
          </v-col>

          <v-col cols="12" md="7" class="profile-info">
            <v-row class="info-card">
              <v-card-text>
                <table class="custom-table">
                  <tbody>
                    <tr>
                      <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center;">이름</td>
                      <td style="width:70%;">{{ userProfile?.name || ' ' }}</td>
                    </tr>
                    <tr>
                      <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center;">사번</td>
                      <td style="width:70%;">{{ userProfile?.userNum || ' ' }}</td>
                    </tr>
                    <tr>
                      <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">부서명</td>
                      <td style="width:70%;">{{ userProfile?.departmentName || ' ' }}</td>
                    </tr>
                    <tr>
                      <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">직책</td>
                      <td style="width:70%;">{{ userProfile?.positionName || ' ' }}</td>
                    </tr>
                    <tr>
                      <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">전화번호</td>
                      <td style="width:70%;">{{ userProfile?.phone || ' ' }}</td>
                    </tr>
                    <tr>
                      <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">입사일</td>
                      <td style="width:70%;">{{ userProfile?.joinDate || ' ' }}</td>
                    </tr>
                  </tbody>
                </table>
              </v-card-text>
            </v-row>
          </v-col>
        </v-row>

        <v-row justify="end">
          <v-btn v-create @click="openPasswordChangeModal">비밀번호 변경</v-btn>
        </v-row>

        <v-dialog v-model="passwordChangeDialog" persistent max-width="500px">
          <v-card>
            <v-card-title class="headline">비밀번호 변경</v-card-title>

            <v-card-text>
              <v-form ref="passwordForm" v-model="valid">
                <v-text-field v-model="passwordData.currentPassword" label="현재 비밀번호" type="password"
                  required></v-text-field>
                <v-text-field v-model="passwordData.newPassword" label="새 비밀번호" type="password" required></v-text-field>
                <v-text-field v-model="passwordData.confirmNewPassword" label="새 비밀번호 확인" type="password"
                  required></v-text-field>

                <v-alert v-if="passwordError" type="error" border="top" elevation="2" dense>
                  {{ passwordError }}
                </v-alert>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn v-create @click="changePassword">저장</v-btn>
              <v-btn v-delete @click="closePasswordChangeModal">취소</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </template>
  </MypageTemplate>
</template>

<script>
import axios from 'axios';
import MypageTemplate from './MypageTemplate.vue';

export default {
  name: "UserProfile",
  components: {
    MypageTemplate
  },
  data() {
    return {
      userProfile: {},
      passwordChangeDialog: false,
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      },
      valid: false,
      passwordError: '',
      defaultProfileImage: 'https://via.placeholder.com/150',
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
        this.userProfile = response.data;
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    },
    openPasswordChangeModal() {
      this.passwordChangeDialog = true;
    },
    closePasswordChangeModal() {
      this.passwordChangeDialog = false;
      this.passwordError = '';
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      };
    },
    async changePassword() {
      if (this.passwordData.newPassword !== this.passwordData.confirmNewPassword) {
        this.passwordError = '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.';
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${process.env.VUE_APP_API_BASE_URL}/user/change-password`, {
          currentPassword: this.passwordData.currentPassword,
          newPassword: this.passwordData.newPassword
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          this.$toast.success('비밀번호가 성공적으로 변경되었습니다.');
          this.closePasswordChangeModal();
        } else {
          this.passwordError = '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
        }
      } catch (error) {
        console.error(error);
        this.passwordError = error.response?.data?.message || '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.';
      }
    }
  }
};
</script>

<style scoped>
.main-view {
  padding: -50px;
}

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  margin: 0;

}

.profile-img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}


.profile-name {
  font-size: 24px;
  font-weight: bold;
  margin-top: 20px;
}

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
  background-color: rgba(122, 86, 86, 0.2);
  font-weight: bold;
  text-align: left;
  padding: 10px;

}

tbody td {
  padding: 10px;
  border-bottom: 2px solid rgba(122, 86, 86, 0.2);
}

td:first-child {
  font-weight: bold;
  border-right: 2px solid rgba(122, 86, 86, 0.2);
}

.leave-info-table {
  margin-top: 20px;
  box-shadow: none;
}

.timeline-container {
  /* background-color: white; */
  /* padding: 20px; */
  /* border: solid 1px; */
}

.timeline-bar {
  width: calc(100% / 36);
  padding: 0;
  height: 50px;
}

.v-progress-linear {
  height: 30px;
}


.custom-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.custom-table th,
.custom-table td {
  padding: 20px;
}

.custom-table th {
  background-color: rgba(122, 86, 86, 0.2);
  font-weight: bold;
  text-align: left;
  border: 1px solid rgba(122, 86, 86, 0.2);
}

.custom-table td:first-child {
  font-weight: bold;
}

.custom-leave-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  background-color: #ffffff;
}

.custom-leave-table th,
.custom-leave-table td {
  padding: 20px;
}

.custom-leave-table th {
  background-color: rgba(122, 86, 86, 0.2);
  font-weight: bold;
  text-align: center;
}

.custom-attendance-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
}


.custom-attendance-table td {
  padding: 20px;
}

.custom-attendance-table th {
  background-color: rgba(122, 86, 86, 0.2);
  font-weight: bold;
  text-align: center;
  padding: 20px;
}
</style>