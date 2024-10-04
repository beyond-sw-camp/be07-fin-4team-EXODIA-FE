// src/services/auth.js
import axios from 'axios';

const API_URL = '/user';

export default {
  login(credentials) {
    return axios.post(`${API_URL}/login`, credentials)
      .then(response => {
        if (response.data && response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data)); 
        }
        return response.data;
      });
  },
  logout() {
    localStorage.removeItem('user');
  },
  getToken() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.token : null;
  },
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
};
