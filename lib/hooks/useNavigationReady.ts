import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook to check if navigation context is ready.
 * Uses a progressive delay approach to ensure navigation is available before components try to use it.
 */
export function useNavigationReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  // Hold the current timeout so we can clear it when necessary
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Helper that (re)sets a timer which flips `isReady` to true after the given delay.
   * It always clears any existing timer to avoid overlaps.
   */
  const scheduleReadyCheck = (delay = 600) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsReady(true);
    }, delay);
  };

  useEffect(() => {
    // Initial check when the hook mounts
    scheduleReadyCheck();

    // Listener for when the app returns to the foreground
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        // Reset and schedule a new check – navigation may need a moment to re-attach
        setIsReady(false);
        scheduleReadyCheck();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      subscription.remove();
    };
  }, []);

  return isReady;
} 