import { jwtDecode } from 'jwt-decode';
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
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

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

axios.interceptors.request.use(config => {
  if (config.url.includes("amazonaws.com")) {
    delete config.headers['Authorization'];
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          localStorage.clear();
          alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
          router.push('/login'); 
        }
      }
    }
    return Promise.reject(error);
  }
);

const app = createApp(App);

app.component('VueDatePicker', VueDatePicker);

app.config.globalProperties.$axios = axios;

app.use(router);
app.use(store);

app.use(vuetifyInstance);


app.mount('#app');
