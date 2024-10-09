<template>
  <v-container class="login-container">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <div class="logo-container">
          <img src="@/assets/exodia.png" alt="Logo" class="logo"/>
        </div>
        <v-card elevation="4" class="login-card">
          <v-card-title class="headline">로그인</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="doLogin">
              <v-text-field
                v-model="userNum"
                label="아이디"
                prepend-inner-icon="mdi-account"
                required
                outlined
                dense
                class="input-field"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="비밀번호"
                type="password"
                prepend-inner-icon="mdi-lock"
                required
                outlined
                dense
                class="input-field"
              ></v-text-field>
              <v-checkbox
                v-model="rememberUserNum"
                label="사번 저장하기"
                dense
                class="remember-checkbox"
              ></v-checkbox>
              <v-btn type="submit" color="primary" block large class="mt-4 login-btn">
                로그인
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
  background: linear-gradient(135deg, #b8e994, #78e08f); 
}

.logo-container {
  margin-bottom: 30px;
}

.logo {
  width: 120px;
}

.login-card {
  padding: 40px;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.95); 
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
}

.headline {
  font-size: 24px;
  color: #2d3436;
  font-weight: 600;
}

.input-field {
  font-size: 18px;
  margin-bottom: 20px;
}

.remember-checkbox {
  margin-top: 10px;
}

.login-btn {
  background-color: #6ab04c;
  font-weight: bold;
  font-size: 18px;
}

.login-btn:hover {
  background-color: #45a049;
}

.v-text-field input {
  font-size: 16px;
}

.v-btn {
  font-size: 16px;
}
</style>
