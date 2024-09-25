import Login from '@/views/Login.vue';
import {jwtdecode} from "jwt-decode";

export const userRouter = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/loginSuccess',
    component: Login,
    beforeEnter: (to, from, next) => {
      const accessToken = to.query.token;
      const refreshToken = to.query.refreshToken;
      if (accessToken) {
        try {
          const decoded = jwtdecode(accessToken);
          localStorage.setItem("token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
          localStorage.setItem("userId", decoded.userId);
          localStorage.setItem("email", decoded.sub);
          localStorage.setItem("role", decoded.role);

          window.location.href = "/";
        } catch (error) {
          console.error("Invalid token", error);
          next('/login');
        }
      } else {
        next('/login');
      }
    }
  }
];
