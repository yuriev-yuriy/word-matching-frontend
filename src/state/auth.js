import { reactive } from 'vue';
import api from '../services/api';
import { clearWordLists } from './wordLists';

export const authState = reactive({
  user: null,
  isAuthenticated: false,
  loading: false,
});

export function clearAuthState() {
  authState.user = null;
  authState.isAuthenticated = false;
  authState.loading = false;
  clearWordLists();
}

export async function checkAuth() {
  authState.loading = true;

  try {
    const response = await api.get('/api/me', { skipAuthRedirect: true });
    authState.user = response.data;
    authState.isAuthenticated = true;
  } catch (error) {
    if (error?.response?.status === 401) {
      clearAuthState();
    }
    this.dueCount = 0;
  } finally {
    authState.loading = false;
  }
}
