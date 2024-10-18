<template>
  <div class="login-container">
    <v-container class="login-content">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" class="text-center">
          <v-card elevation="4" class="login-card">
            <div class="logo-container">
              <img src="@/assets/exodia.png" alt="Logo" class="logo" />
            </div>
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
                <v-btn
                  :class="{'gradient-animation': loginSuccessful}"
                  type="submit"
                  block large
                  class="mt-4 login-btn"
                >
                  로그인
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 물결 애니메이션 -->
    <div>
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default {
  name: 'LoginPage',
  data() {
    return {
      userNum: '',
      password: '',
      rememberUserNum: false,
      loginSuccessful: false,
    };
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
        if (!token) throw new Error('로그인 실패');
        this.loginSuccessful = true;
        setTimeout(() => {
          this.$router.push('/');
        }, 1500);
      } catch (e) {
        alert('로그인에 실패했습니다.');
      }
    },
  },
};
</script>

<style scoped>
html, body, #app {
  height: 100%;
  margin: 0;
}

.login-container {
  height: 100vh;
  background: linear-gradient(315deg, rgba(101,0,94,1) 3%, rgba(60,132,206,1) 38%, rgba(48,238,226,1) 68%, rgba(255,25,25,1) 98%);
  animation: gradient 15s ease infinite;
  background-size: 400% 400%;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
}

@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.wave {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 1000% 1000% 0 0;
  position: fixed;
  width: 200%;
  height: 12em;
  animation: wave 10s -3s linear infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.8;
  bottom: 0;
  left: 0;
  z-index: -1;
}

.wave:nth-of-type(2) {
  bottom: -1.25em;
  animation: wave 18s linear reverse infinite;
  opacity: 0.8;
}

.wave:nth-of-type(3) {
  bottom: -2.5em;
  animation: wave 20s -1s reverse infinite;
  opacity: 0.9;
}

@keyframes wave {
  2% {
    transform: translateX(1%);
  }
  25% {
    transform: translateX(-25%);
  }
  50% {
    transform: translateX(-50%);
  }
  75% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(1%);
  }
}

.login-content {
  z-index: 2;
  position: relative;
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

.input-field {
  font-size: 18px;
  margin-bottom: 20px;
}

.remember-checkbox {
  margin-top: 10px;
}

.login-btn {
  background-color: #6f4833a4;
  font-weight: bold;
  font-size: 18px;
}

.login-btn:hover {
  background-color: #6f4833a4;
  animation: hoverGradient 1.5s forwards;
}

.gradient-animation {
  animation: gradient 1s ease-out forwards;
}
</style>
