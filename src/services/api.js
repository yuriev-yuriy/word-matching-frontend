import axios from 'axios';
import { clearAuthState } from '../state/auth';

const api = axios.create({
  baseURL: '/',  // relative URL (important)
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

let isSessionRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const skipAuthRedirect = error?.config?.skipAuthRedirect;

    if (!skipAuthRedirect && (status === 401 || status === 419)) {
      clearAuthState();
      window.dispatchEvent(new Event('app:session-expired'));

      if (!isSessionRedirecting) {
        isSessionRedirecting = true;
        window.dispatchEvent(new Event('app:redirect-login'));
      }

      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default api;
