import { create } from 'zustand';
import { onSessionExpired } from '../services/api.js';
import { authService } from '../services/index.js';
import { toast } from './toastStore.js';

/**
 * Session state. The JWT lives in an HTTP-only cookie, so the browser never sees it;
 * the store only mirrors the current user returned by the API.
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | authenticated | guest

  async init() {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const { user } = await authService.me();
      set({ user, status: 'authenticated' });
    } catch {
      set({ user: null, status: 'guest' });
    }
  },

  async login(credentials) {
    const { user } = await authService.login(credentials);
    set({ user, status: 'authenticated' });
    return user;
  },

  async register(payload) {
    const { user } = await authService.register(payload);
    set({ user, status: 'authenticated' });
    return user;
  },

  async logout() {
    try {
      await authService.logout();
    } finally {
      set({ user: null, status: 'guest' });
    }
  },

  async refreshUser() {
    try {
      const { user } = await authService.me();
      set({ user, status: 'authenticated' });
      return user;
    } catch {
      return null;
    }
  },

  setUser(user) {
    set({ user });
  },

  patchUser(patch) {
    const user = get().user;
    if (user) set({ user: { ...user, ...patch } });
  },
}));

onSessionExpired((error) => {
  const { status } = useAuthStore.getState();
  if (status !== 'authenticated') return;
  useAuthStore.setState({ user: null, status: 'guest' });
  toast.error(error.code === 'SESSION_EXPIRED' ? 'Your session expired. Please sign in again.' : 'Please sign in to continue.');
});
