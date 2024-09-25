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
                label="사번 저장하기"
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
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/login`, loginData);
        console.log('로그인 성공');
        console.log('Received Response:', response);

        const token = response.data.result; 
        console.log('Received Token:', token);

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
        console.error('로그인 에러:', e.message);
        const error_message = e.response?.data?.status_message || "로그인에 실패했습니다.";
        alert(error_message);
      }
    }

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
