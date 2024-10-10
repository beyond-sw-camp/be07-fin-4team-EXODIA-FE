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
import vuetify from './plugins/vuetify';
import adapter from 'webrtc-adapter';

window.adapter = adapter;


axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8087';
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


const vuetify = createVuetify({
  components, 
  directives, 
});


const app = createApp(App);


app.config.globalProperties.$axios = axios;

app.use(router);
app.use(store);
app.use(vuetify);



app.mount('#app');
