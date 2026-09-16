import { api } from './api.js';

/** Thin, typed-by-convention wrappers around the REST API. Components never call axios directly. */

export const configService = {
  get: () => api.get('/config'),
};

export const authService = {
  me: () => api.get('/auth/me'),
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  logout: () => api.post('/auth/logout'),
};

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (body) => api.patch('/users/me', body),
  dashboard: () => api.get('/dashboard'),
};

export const avatarService = {
  list: (params) => api.get('/avatars', { params }),
  get: (id) => api.get(`/avatars/${id}`),
  consentStatus: (id) => api.get(`/avatars/${id}/consent-status`),
  startConsent: (id) => api.post(`/avatars/${id}/consent`),
  importable: () => api.get('/avatars/importable'),
  import: (providerAvatarId) => api.post('/avatars/import', { providerAvatarId }),
  createCustom: ({ name, file }, onUploadProgress) => {
    const form = new FormData();
    form.append('name', name);
    form.append('footage', file);
    return api.post('/avatars/custom', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 10 * 60_000,
      onUploadProgress,
    });
  },
  generateLook: (id, { name, outfit }) => api.post(`/avatars/${id}/looks`, { name, outfit }),
  createPhoto: ({ name, file }, onUploadProgress) => {
    const form = new FormData();
    form.append('name', name);
    form.append('photo', file);
    return api.post('/avatars/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 2 * 60_000,
      onUploadProgress,
    });
  },
};

export const videoService = {
  list: (params) => api.get('/videos', { params }),
  get: (id) => api.get(`/videos/${id}`),
  generate: (body, idempotencyKey) => api.post('/videos/generate', body, { headers: { 'Idempotency-Key': idempotencyKey } }),
  remove: (id) => api.delete(`/videos/${id}`),
  makePrimary: (id) => api.post(`/videos/${id}/primary`),
};

export const widgetService = {
  list: () => api.get('/widgets'),
  get: (id) => api.get(`/widgets/${id}`),
  create: (body) => api.post('/widgets', body),
  update: (id, body) => api.patch(`/widgets/${id}`, body),
  remove: (id) => api.delete(`/widgets/${id}`),
};

export const creditService = {
  summary: () => api.get('/credits'),
  ledger: (params) => api.get('/credits/ledger', { params }),
};

export const billingService = {
  packages: () => api.get('/billing/packages'),
  checkout: (packageId) => api.post('/billing/checkout', { packageId }),
  transactions: (params) => api.get('/billing/transactions', { params }),
};

export const adminService = {
  overview: () => api.get('/admin/overview'),
  users: (params) => api.get('/admin/users', { params }),
  userLedger: (id, params) => api.get(`/admin/users/${id}/ledger`, { params }),
  adjustCredits: (id, body) => api.post(`/admin/users/${id}/credits`, body),
  generations: (params) => api.get('/admin/generations', { params }),
  cancelGeneration: (id) => api.post(`/admin/generations/${id}/cancel`),
  resyncGeneration: (id) => api.post(`/admin/generations/${id}/resync`),
  webhookEvents: (params) => api.get('/admin/webhook-events', { params }),
  payments: (params) => api.get('/admin/payments', { params }),
  avatars: (params) => api.get('/admin/avatars', { params }),
  syncStock: () => api.post('/admin/avatars/sync-stock'),
  suspendUser: (id, body) => api.post(`/admin/users/${id}/suspend`, body),
  unsuspendUser: (id) => api.post(`/admin/users/${id}/unsuspend`),
  forceLogoutUser: (id) => api.post(`/admin/users/${id}/force-logout`),
  changeUserPlan: (id, body) => api.post(`/admin/users/${id}/plan`, body),
  changeAvatarSlots: (id, body) => api.post(`/admin/users/${id}/avatar-slots`, body),
};

/** Development-only endpoints standing in for vendor-hosted pages (mock mode). */
export const devService = {
  getMockCheckout: (sessionId) => api.get(`/dev/mock-payments/${sessionId}`),
  completeMockCheckout: (sessionId, outcome) => api.post(`/dev/mock-payments/${sessionId}/complete`, { outcome }),
  getMockConsent: (groupId) => api.get(`/dev/mock-heygen/consent/${groupId}`),
  decideMockConsent: (groupId, decision) => api.post(`/dev/mock-heygen/consent/${groupId}`, { decision }),
};
