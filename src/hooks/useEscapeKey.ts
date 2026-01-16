import { useEffect, useCallback } from 'react';

export function useEscapeKey(onEscape: () => void, enabled = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    },
    [onEscape]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

export default useEscapeKey;
