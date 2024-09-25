import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import vuetify from './plugins/vuetify';
import mitt from 'mitt';

import '@mdi/font/css/materialdesignicons.css';
import '@/assets/css/global.css';

const app = createApp(App);

const emitter = mitt();
app.config.globalProperties.emitter = emitter;

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8088';

axios.interceptors.request.use(
    async config => {
        const token = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('email');
        
        if (config.skipInterceptor) {
            console.log("인터셉터 건너뜀", config.skipInterceptor);
            return config;
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/current-user`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    skipInterceptor: true
                });

                const serverEmail = response.data.email;
                if (storedEmail && serverEmail && storedEmail !== serverEmail) {
                    console.warn('로컬 스토리지의 이메일과 서버 이메일이 일치하지 않음. 로그아웃 처리합니다.');
                    handleLogout();
                }
            } catch (error) {
                console.error('서버의 사용자 정보를 가져오는 중 오류 발생:', error);
                handleLogout();
            }
        }
        return config;
    },
    error => {
        console.error('요청 인터셉터 오류:', error);
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    localStorage.removeItem('token');
                    const response = await axios.post(
                        `${process.env.VUE_APP_API_BASE_URL}/member/refresh-token`,
                        { refreshToken }
                    );
                    localStorage.setItem('token', response.data.result.token);
                    window.location.reload();
                } catch (e) {
                    console.error('토큰 갱신 실패:', e);
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                console.warn('리프레시 토큰이 없습니다. 로그인 페이지로 이동합니다.');
                localStorage.clear();
                window.location.href = '/login';
            }
        } else {
            console.error('응답 인터셉터 오류:', error);
        }
        return Promise.reject(error);
    }
);

function handleLogout() {
    localStorage.clear();
    window.location.href = '/login';
}

app.use(router);
app.use(store);
app.use(vuetify);

app.mount('#app');
