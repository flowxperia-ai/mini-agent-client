import { create } from 'zustand';
import { SCRIPT_LIMITS } from '#shared/constants';
import { configService } from '../services/index.js';

const FALLBACK = {
  appName: 'Website Mini Agent',
  mockMode: false,
  mockProviders: { heygen: false, payment: false, storage: false },
  mockFailToken: null,
  plans: [],
  script: {
    maxChars: SCRIPT_LIMITS.MAX_CHARS,
    wordsPerMinute: SCRIPT_LIMITS.WORDS_PER_MINUTE,
    minSeconds: SCRIPT_LIMITS.MIN_SECONDS,
    maxSeconds: SCRIPT_LIMITS.MAX_SECONDS,
  },
  credits: { minPerVideo: 1, currency: 'usd' },
  uploads: { maxBytes: 200 * 1024 * 1024 },
  widget: { scriptUrl: '/widget.js', apiUrl: '' },
};

/** Runtime configuration from GET /api/config (plans, limits, mock mode). */
export const useConfigStore = create((set, get) => ({
  config: FALLBACK,
  loaded: false,
  async load() {
    if (get().loaded) return;
    try {
      const config = await configService.get();
      set({ config: { ...FALLBACK, ...config }, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));

export const useAppConfig = () => useConfigStore((s) => s.config);

export function usePlanConfig(planId) {
  return useConfigStore((s) => s.config.plans.find((p) => p.id === planId));
}
