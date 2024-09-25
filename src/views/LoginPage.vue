<template>
    <div class="login-container">
      <v-card>
        <v-card-title>로그인</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="userNum"
              label="아이디"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              label="비밀번호"
              type="password"
              required
            ></v-text-field>
            <v-btn type="submit" color="primary">로그인</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </template>
  
  <script>
  import authService from '@/services/auth';
  
  export default {
    name: 'LoginPage',
    data() {
      return {
        userNum: '',
        password: ''
      };
    },
    methods: {
      async login() {
        try {
          const response = await authService.login({ userNum: this.userNum, password: this.password });
          if (response.data) {
            this.$store.dispatch('login', response.data);
            this.$router.push('/');
          }
        } catch (error) {
          console.error(error);
          alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f5f5f5;
  }
  </style>
  