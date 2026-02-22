import { reactive } from 'vue';
import api from '../services/api';

export const authState = reactive({
  user: null,
  isAuthenticated: false,
  loading: false,
});

export async function checkAuth() {
  authState.loading = true;

  try {
    const response = await api.get('/api/me');
    authState.user = response.data;
    authState.isAuthenticated = true;
  } catch (error) {
    if (error?.response?.status === 401) {
      authState.user = null;
      authState.isAuthenticated = false;
    }
  } finally {
    authState.loading = false;
  }
}
