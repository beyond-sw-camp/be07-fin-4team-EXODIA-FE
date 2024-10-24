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
                <v-text-field v-model="userNum" label="아이디" prepend-inner-icon="mdi-account" required outlined dense
                  class="input-field"></v-text-field>
                <v-text-field v-model="password" label="비밀번호" type="password" prepend-inner-icon="mdi-lock" required
                  outlined dense class="input-field"></v-text-field>
                <v-checkbox v-model="rememberUserNum" label="사번 저장하기" dense class="remember-checkbox"></v-checkbox>

                <!-- <v-btn
                  :class="{'gradient-animation': loginSuccessful}"
                  type="submit"
                  block large
                  class="mt-4 login-btn"
                >
                  로그인
                </v-btn> -->

                <v-btn :class="{ 'gradient-animation': loginSuccessful, 'is-loading': isLoading }" type="submit" block
                  large class="mt-4 login-btn" :disabled="isLoading">
                  <template v-if="!isLoading">로그인</template>
                  <template v-else>
                    <v-progress-circular indeterminate color="white" size="20"></v-progress-circular>
                  </template>
                </v-btn>
                <v-progress-linear v-if="isLoading" indeterminate color="primary" class="mt-4"></v-progress-linear>
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
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default {
  name: 'LoginPage',
  data() {
    return {
      userNum: '',
      password: '',
      rememberUserNum: false,
      loginSuccessful: false,
      isLoading: false,
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
        this.isLoading = true;
        const loginData = {
          userNum: this.userNum,
          password: this.password,
        };

        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/login`, loginData);

        const token = response.data.result;
        if (!token) {
          throw new Error('로그인 실패: 토큰이 없습니다.');
        }

        const decodedToken = jwtDecode(token);
        const departmentId = decodedToken.department_id;
        const positionId = decodedToken.position_id;

        localStorage.setItem('token', token);
        localStorage.setItem('positionId', positionId);
        localStorage.setItem('departmentId', departmentId);
        localStorage.setItem('userNum', this.userNum);

        if (this.rememberUserNum) {
          localStorage.setItem('savedUserNum', this.userNum);
        } else {
          localStorage.removeItem('savedUserNum');
        }

        this.loginSuccessful = true;
        setTimeout(() => {
          this.isLoading = false;
          this.$router.push('/');
        }, 1500);

      } catch (e) {
        this.isLoading = false;
        alert('로그인에 실패했습니다.');
        console.error(e);
      }
    },
  },
};
</script>


<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

.login-container {
  height: 100vh;
  background-color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wave-container {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 35vh;
  /* 높이를 더 올렸습니다 */
  overflow: hidden;
}

.wave {
  background: rgba(0, 150, 136, 0.25);
  border-radius: 1000% 1000% 0 0;
  position: absolute;
  width: 200%;
  height: 15em;
  /* 높이를 조금 더 키움 */
  animation: wave 10s -3s linear infinite;
  transform: translate3d(0, 0, 0);
  opacity: 0.8;
  bottom: 0;
  left: 0;
}

.wave:nth-of-type(2) {
  bottom: -1.25em;
  animation: wave 12s linear reverse infinite;
  opacity: 0.8;
}

.wave:nth-of-type(3) {
  bottom: -2.5em;
  animation: wave 17s -1s reverse infinite;
  opacity: 0.9;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(-50%);
  }

  100% {
    transform: translateX(0);
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
  color: #ffffff;
}

.login-btn:hover {
  background-color: #6f4833a4;
  animation: hoverGradient 1.5s forwards;
}

.gradient-animation {
  animation: gradient 1s ease-out forwards;
}

.login-btn.is-loading {
  background-color: rgba(0, 150, 136, 0.25);
}
</style>