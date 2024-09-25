<template>
  <v-container class="login-container">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="headline">로그인</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="doLogin">
              <v-text-field
                v-model="userNum"
                label="아이디"
                required
                outlined
                dense
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="비밀번호"
                type="password"
                required
                outlined
                dense
              ></v-text-field>
              <v-checkbox
                v-model="rememberUserNum"
                label="아이디 기억하기"
              ></v-checkbox>
              <v-btn type="submit" color="primary" class="mt-3">로그인</v-btn>
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

        // API 요청
        const response = await axios.post('/user/login', loginData);

        // 로그인 성공 시 받은 토큰 처리
        console.log('로그인 성공');
        const token = response.data.data; 

        // jwtDecode 함수 호출 시 .default 사용 여부 확인
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role;
        const userId = decodedToken.userId;

        // localStorage에 데이터 저장
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', userId);  
        localStorage.setItem('userNum', this.userNum);

        if (this.rememberUserNum) {
          localStorage.setItem('savedUserNum', this.userNum);  
        } else {
          localStorage.removeItem('savedUserNum'); 
        }

        alert('로그인 성공! 홈으로 이동합니다.');
        this.$router.push('/');
      } catch (e) {
        console.error(e);
        const error_message = e.response?.data?.status_message || "로그인에 실패했습니다.";
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
  align-items: center;
  justify-content: center;
}
</style>
