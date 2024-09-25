import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import vuetify from './plugins/vuetify';

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8088';

const app = createApp(App);

app.config.globalProperties.$axios = axios;

app.use(router);
app.use(store);
app.use(vuetify);

app.mount('#app');
