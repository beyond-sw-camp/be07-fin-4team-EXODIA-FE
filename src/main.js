import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import { createVuetify } from 'vuetify'; 
import * as components from 'vuetify/components'; 
import * as directives from 'vuetify/directives'; 
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; 
import adapter from 'webrtc-adapter'; 


window.adapter = adapter;

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8087';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const vuetifyInstance = createVuetify({
  components, 
  directives, 
});

// Axios 인터셉터 설정 (Presigned URL 요청 시 Authorization 헤더 제거)
axios.interceptors.request.use(config => {
  // 요청 URL에 "amazonaws.com"이 포함되어 있으면 Authorization 헤더 제거
  if (config.url.includes("amazonaws.com")) {
    delete config.headers['Authorization'];
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const app = createApp(App);

app.config.globalProperties.$axios = axios;

app.use(router);
app.use(store);
app.use(vuetifyInstance);

app.mount('#app');
