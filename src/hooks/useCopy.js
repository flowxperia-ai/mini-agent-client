import { useCallback, useState } from 'react';
import { toast } from '../store/toastStore.js';

/** Copy text to the clipboard with a transient "copied" flag. */
export function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(
    async (text, message = 'Copied to clipboard') => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout],
  );
  return { copied, copy };
}
