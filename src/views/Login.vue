<template>
  <v-container class="login-container">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="6" md="4" class="text-center">
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Logo" class="logo"/>
        </div>
        <v-card elevation="2" class="login-card">
          <v-card-title class="headline">로그인</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="doLogin">
              <v-text-field
                v-model="userNum"
                label="아이디"
                prepend-inner-icon="mdi-account"
                required
                outlined
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="비밀번호"
                type="password"
                prepend-inner-icon="mdi-lock"
                required
                outlined
              ></v-text-field>
              <div class="remember-forgot">
                <v-checkbox
                  v-model="rememberUserNum"
                  label="사번 저장하기"
                  dense
                ></v-checkbox>
                <a href="#" class="forgot-password">비밀번호 찾기</a>
              </div>
              <v-btn type="submit" color="primary" block class="mt-3">
                로그인
              </v-btn>
              <v-btn block outlined class="mt-2">
                회원가입
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { jwtDecode } from 'jwt-decode'; 
import axios from 'axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      userNum: '',
      password: '',
      rememberUserNum: false,
    };
  },
  mounted() {
    const savedUserNum = localStorage.getItem('savedUserNum');
    if (savedUserNum) {
      this.userNum = savedUserNum;
      this.rememberUserNum = true;
    }
  },
  methods: {
    async doLogin() {
      try {
        const loginData = {
          userNum: this.userNum,
          password: this.password,
        };
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/login`, loginData);
        const token = response.data.result;

        if (!token || typeof token !== 'string') {
          throw new Error('토큰이 없습니다. 로그인에 실패했습니다.');
        }

        const decodedToken = jwtDecode(token);
        const userNum = decodedToken.sub;
        const departmentId = decodedToken.department_id;
        const positionId = decodedToken.position_id;

        localStorage.setItem('token', token);
        localStorage.setItem('userNum', userNum);
        localStorage.setItem('departmentId', departmentId);
        localStorage.setItem('positionId', positionId);

        if (this.rememberUserNum) {
          localStorage.setItem('savedUserNum', this.userNum);
        } else {
          localStorage.removeItem('savedUserNum');
        }

        alert('로그인 성공');
        this.$router.push('/');
      } catch (e) {
        const error_message = e.response?.data?.status_message || '로그인에 실패했습니다.';
        alert(error_message);
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #43cea2, #185a9d); /* 그라데이션 배경 */
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 100px;
}

.login-card {
  padding: 40px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.forgot-password {
  font-size: 14px;
  color: #757575;
  text-decoration: none;
}

.v-btn {
  font-weight: bold;
  font-size: 16px;
}
</style>
