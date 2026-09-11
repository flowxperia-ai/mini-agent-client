import { useEffect } from 'react';
import { API_ORIGIN } from '../services/api.js';

const PING_INTERVAL_MS = 10 * 60 * 1000; // Render free tier sleeps after ~15 min idle — ping well under that.

/**
 * Pings the API's health endpoint on an interval so a Render free-tier instance doesn't spin
 * down while someone has the app open. Only helps while at least one tab is open and visible —
 * it can't prevent a cold start if nobody is around, that's a hosting-plan tradeoff, not a bug.
 */
export function useKeepAlive() {
  useEffect(() => {
    if (!API_ORIGIN) return undefined; // local dev proxies to localhost — nothing to keep warm

    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      fetch(`${API_ORIGIN}/health`, { cache: 'no-store' }).catch(() => {});
    };

    const timer = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
}
