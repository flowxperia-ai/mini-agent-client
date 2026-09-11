import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** Normalised API error used everywhere in the UI. */
export class ApiError extends Error {
  constructor({ code = 'UNKNOWN_ERROR', message = 'Something went wrong.', status = 0, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Map server validation details onto react-hook-form fields. */
  fieldErrors() {
    return Object.fromEntries((this.details ?? []).map((d) => [d.path, d.message]));
  }
}

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

const sessionListeners = new Set();
/** Subscribe to "session expired" events (used by the auth store). */
export function onSessionExpired(listener) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (!error.response) {
      const timeout = error.code === 'ECONNABORTED';
      return Promise.reject(
        new ApiError({
          code: timeout ? 'TIMEOUT' : 'NETWORK_ERROR',
          message: timeout ? 'The request took too long. Please try again.' : 'Cannot reach the server. Check your connection and try again.',
        }),
      );
    }
    const { status, data } = error.response;
    const apiError = new ApiError({
      status,
      code: data?.error?.code ?? `HTTP_${status}`,
      message: data?.error?.message ?? 'Something went wrong. Please try again.',
      details: data?.error?.details,
    });
    const isSessionCheck = error.config?.url?.includes('/auth/me') || error.config?.url?.includes('/auth/login');
    if (status === 401 && !isSessionCheck) sessionListeners.forEach((fn) => fn(apiError));
    return Promise.reject(apiError);
  },
);
