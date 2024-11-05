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
import '@vuepic/vue-datepicker/dist/main.css';
import { createPinia } from 'pinia';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import Stomp from 'webstomp-client';
import SockJS from 'sockjs-client';

window.adapter = adapter;

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8087';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const vuetifyInstance = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
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
          router.push('/login').then(() => {
            window.location.reload();
          });
        } else {
          localStorage.clear();
          alert('중복 로그인이 감지되었습니다. 강제 로그아웃 됩니다.');
          router.push('/login').then(() => {
            window.location.reload();
          });
        }
      } else {
        router.push('/login').then(() => {
          window.location.reload();
        });
      }
    }
    return Promise.reject(error);
  }
);

// WebSocket Clients
const openviduSocket = new SockJS(`${process.env.VUE_APP_OPENVIDU_BASE_URL}/ws`);
const openviduClient = Stomp.over(openviduSocket);



const app = createApp(App);
const pinia = createPinia();
app.component('VueDatePicker', VueDatePicker);

app.config.globalProperties.$axios = axios;
app.config.globalProperties.$openviduClient = openviduClient;


app.config.globalProperties.$axios = axios;
app.use(pinia); +
  app.use(router);
app.use(store);
app.use(vuetifyInstance);


app.mount('#app');


app.directive('create', {
  mounted(el) {
    if (el.textContent.includes('작성') || el.textContent.includes('생성') || el.textContent.includes('수정') ||
      el.textContent.includes('등록') || el.textContent.includes('저장') || el.textContent.includes('답변') ||
      el.textContent.includes('업데이트') || el.textContent.includes('퇴근') || el.textContent.includes('변경') ||
      el.textContent.includes('추가') || el.textContent.includes('승인') || el.textContent.includes('확인')
      || el.textContent.includes('설정') || el.textContent.includes('초대') || el.textContent.includes('예약') || el.textContent.includes('승인')) {
      el.style.backgroundColor = '#9a2f2f'; // 배경색 - 붉은색
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('update', {
  mounted(el) {
    if (el.textContent.includes('수정') || el.textContent.includes('업데이트')) {
      el.style.backgroundColor = '#ffffff'; // 배경색 - 흰색
      el.style.borderColor = '#9a2f2f';
      el.style.color = '#9a2f2f';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('delete', {
  mounted(el) {
    // 텍스트가 "생성"을 포함하는지 확인
    if (el.textContent.includes('닫기') || el.textContent.includes('취소') || el.textContent.includes('삭제') || el.textContent.includes('반려')) {
      el.style.backgroundColor = '#949494'; // 배경색 - 회색
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('list', {
  mounted(el) {
    if (el.textContent.includes('목록') || el.textContent.includes('보기') || el.textContent.includes('출근')
      || el.textContent.includes('시작') || el.textContent.includes('조회') || el.textContent.includes('편집')
      || el.textContent.includes('다음') || el.textContent.includes('돌아가기')) {
      el.style.backgroundColor = '#1867c0'; // 배경색 - 파란색
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('approve', {
  mounted(el) {
    if (el.textContent.includes('출근') || el.textContent.includes('승인')) {
      el.style.backgroundColor = '#4caf50'; // 배경색 - 초록색
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});

app.directive('reject', {
  mounted(el) {
    if (el.textContent.includes('거절') || el.textContent.includes('반려')) {
      el.style.backgroundColor = '#44336'; // 배경색 - 빨간색거절
      el.style.fontWeight = 'bold';
      el.style.fontSize = '14px';
      el.style.borderRadius = '10px';
    }
  }
});



router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); 
  
  if (!token && to.path !== '/login') { 
    next('/login');  
  } else {
    next(); 
  }
});


// F12 키 비활성화
document.addEventListener('keydown', (e) => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// 우클릭 비활성화
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

