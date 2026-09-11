import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Minimal data-fetching hook: loading / error / data, refetch, optional polling.
 *
 *   const { data, loading, error, refetch } = useApi(() => videoService.get(id), [id], {
 *     poll: (data) => (data?.video.status === 'PROCESSING' ? 3000 : null),
 *   });
 */
export function useApi(fetcher, deps = [], { poll, enabled = true } = {}) {
  const [state, setState] = useState({ data: undefined, error: null, loading: enabled });
  const requestId = useRef(0);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refetch = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current;
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await fetcherRef.current();
        if (mounted.current && id === requestId.current) setState({ data, error: null, loading: false });
        return data;
      } catch (error) {
        if (mounted.current && id === requestId.current) setState((s) => ({ ...s, error, loading: false }));
        return undefined;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  );

  useEffect(() => {
    if (enabled) refetch();
  }, [refetch, enabled]);

  const interval = typeof poll === 'function' ? poll(state.data) : poll;
  useEffect(() => {
    if (!interval || !enabled) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refetch({ silent: true });
    }, interval);
    return () => clearInterval(timer);
  }, [interval, enabled, refetch]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, refetch, setData };
}
