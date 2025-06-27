import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook to check if navigation context is ready.
 * Uses a progressive delay approach to ensure navigation is available before components try to use it.
 * 
 * IMPORTANT: This hook does NOT reset when the app becomes active, as the navigation context
 * persists across app state changes. Resetting would cause navigation stack resets.
 */
export function useNavigationReady(): boolean {
  const [isReady, setIsReady] = useState(false);

  // Hold the current timeout so we can clear it when necessary
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we've already initialized to prevent resets
  const hasInitialized = useRef(false);

  /**
   * Helper that (re)sets a timer which flips `isReady` to true after the given delay.
   * It always clears any existing timer to avoid overlaps.
   */
  const scheduleReadyCheck = (delay = 600) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsReady(true);
      hasInitialized.current = true;
    }, delay);
  };

  useEffect(() => {
    // Initial check when the hook mounts (only if not already initialized)
    if (!hasInitialized.current) {
      scheduleReadyCheck();
    }

    // Listener for when the app returns to the foreground
    const handleAppStateChange = (nextState: AppStateStatus) => {
      // REMOVED: Do not reset navigation readiness when app becomes active
      // The navigation context persists across app state changes, and resetting
      // causes the entire navigation stack to remount, losing user's current screen
      
      // Only log for debugging purposes
      if (nextState === 'active' && hasInitialized.current) {
        console.log('🔄 App became active - navigation context preserved');
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