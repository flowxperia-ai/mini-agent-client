import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Website Mini Agent` : 'Website Mini Agent';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
