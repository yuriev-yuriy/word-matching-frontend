import axios from 'axios';

const api = axios.create({
  baseURL: '/',  // relative URL (important)
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default api;
