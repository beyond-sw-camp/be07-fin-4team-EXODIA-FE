// src/store/index.js
import { createStore } from 'vuex';
import authService from '../services/auth'; 

export default createStore({
  state: {
    user: authService.getCurrentUser() || null,
  },
  mutations: {
    loginSuccess(state, user) {
      state.user = user;
    },
    logout(state) {
      state.user = null;
    }
  },
  actions: {
    login({ commit }, user) {
      commit('loginSuccess', user);
    },
    logout({ commit }) {
      authService.logout();
      commit('logout');
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    user: state => state.user
  }
});
