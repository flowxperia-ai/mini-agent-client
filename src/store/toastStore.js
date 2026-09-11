import { create } from 'zustand';

let nextId = 1;

export const useToastStore = create((set, get) => ({
  toasts: [],
  push(toast) {
    const id = nextId++;
    const entry = { id, tone: 'info', duration: 4500, ...toast };
    set({ toasts: [...get().toasts, entry].slice(-4) });
    if (entry.duration) setTimeout(() => get().dismiss(id), entry.duration);
    return id;
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

const push = (tone) => (message, options = {}) => useToastStore.getState().push({ tone, message, ...options });

/** Imperative toast API usable outside React components. */
export const toast = {
  success: push('success'),
  error: push('error'),
  info: push('info'),
  /** Show an ApiError (or any error) with a sensible fallback. */
  fromError(error, fallback = 'Something went wrong.') {
    return push('error')(error?.message || fallback);
  },
};
