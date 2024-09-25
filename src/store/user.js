
function initState() {
    return {
      token: "",
      role: "", 
      userNum: "", 
      email: ""
    };
  }
  
  const user = {
    state: initState(),
    mutations: {
      setUserAllInfo(state) {
        state.token = localStorage.getItem('token');
        state.role = localStorage.getItem('role');
        state.userNum = localStorage.getItem('userNum');
        console.log('User Info set in Vuex:', state);
      },
      resetUserState(state) {
        Object.assign(state, initState());
      }
    },
    actions: {
      setUserAllInfoActions({ commit }) {
        commit('setUserAllInfo');
      },
      logout({ commit }) {
        localStorage.clear();
        commit('resetUserState');
      }
    },
    getters: {
      getUserObj: state => state,
      getUserToken: state => state.token,
      getUserRole: state => state.role,
      getUserNum: state => state.userNum,
    }
  };
  
  export default user;
  