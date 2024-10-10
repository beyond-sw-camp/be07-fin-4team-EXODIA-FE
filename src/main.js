import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
<<<<<<< HEAD
import { createVuetify } from 'vuetify'; // Vuetify 가져오기
import * as components from 'vuetify/components'; // 모든 Vuetify 컴포넌트 가져오기
import * as directives from 'vuetify/directives'; // 모든 Vuetify 디렉티브 가져오기
import 'vuetify/styles'; // Vuetify 스타일 가져오기
import '@mdi/font/css/materialdesignicons.css'; // Vuetify 아이콘 가져오기
import adapter from 'webrtc-adapter'; // WebRTC adapter 가져오기
=======
import vuetify from './plugins/vuetify';
import adapter from 'webrtc-adapter';
>>>>>>> 047dd701b26383b2365906cda60914526b093de2


// 전역으로 adapter 사용 설정
window.adapter = adapter;

// Axios 기본 설정
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8087';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

<<<<<<< HEAD
// Vuetify 설정
const vuetify = createVuetify({
  components, // 모든 컴포넌트 등록
  directives, // 모든 디렉티브 등록
});

// Vue 애플리케이션 생성
=======
>>>>>>> 047dd701b26383b2365906cda60914526b093de2
const app = createApp(App);

// Axios 전역 속성 설정
app.config.globalProperties.$axios = axios;

// Vue 플러그인 사용 설정
app.use(router);
app.use(store);
app.use(vuetify); // Vuetify 플러그인 사용 설정

// 애플리케이션 마운트
app.mount('#app');
