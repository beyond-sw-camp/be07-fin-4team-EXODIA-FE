import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import { createVuetify } from 'vuetify'; 
import 'vuetify/styles';
import * as components from 'vuetify/components'; 
import * as directives from 'vuetify/directives'; 
import { aliases, mdi } from 'vuetify/iconsets/mdi'; 

import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
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

axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080/api';

const app = createApp(App);
app.config.globalProperties.$axios = axios;

app.use(router)
   .use(store)
   .use(vuetify)
   .mount('#app');
