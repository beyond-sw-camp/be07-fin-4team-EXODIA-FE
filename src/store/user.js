//src/store/user.js

function initState() {
    return {
        token: "", 
        userNum: "", 
        departmentId: "", 
        positionId: "", 
    };
}

const user = {
    state: initState(),
    mutations: {
        setUserAllInfo(state) {
            state.token = localStorage.getItem('token');
            state.role = localStorage.getItem('role');
            state.userNum = localStorage.getItem('userNum');
            state.departmentId = localStorage.getItem('departmentId');
            state.positionId = localStorage.getItem('positionId');
            state.userId = localStorage.getItem('userId'); 
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
        getUserNum: state => state.userNum,
        getDepartmentId: state => state.departmentId,
        getPositionId: state => state.positionId,
    }
};

export default user;
