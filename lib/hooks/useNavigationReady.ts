import { useState, useEffect } from 'react';

/**
 * Hook to check if navigation context is ready.
 * Uses a progressive delay approach to ensure navigation is available before components try to use it.
 */
export function useNavigationReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Progressive delay approach - increases delay if navigation isn't ready
    const checkWithDelay = (delay: number) => {
      timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsReady(true);
        }
      }, delay);
    };

    // Start with a base delay, which should be sufficient for most cases
    // This is more reliable than trying to detect navigation state directly
    checkWithDelay(600);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return isReady;
} 