import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE_V1';

/**
 * Navigation persistence utility to maintain navigation state across app restarts
 * and background/foreground transitions.
 */
export class NavigationPersistence {
  /**
   * Save the current navigation state to persistent storage
   */
  static async saveNavigationState(state: any): Promise<void> {
    try {
      const stateString = JSON.stringify(state);
      await AsyncStorage.setItem(NAVIGATION_STATE_KEY, stateString);
      console.log('📱 Navigation state saved');
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }

  /**
   * Restore navigation state from persistent storage
   */
  static async restoreNavigationState(): Promise<any | null> {
    try {
      const stateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
      if (stateString) {
        const state = JSON.parse(stateString);
        console.log('📱 Navigation state restored');
        return state;
      }
    } catch (error) {
      console.error('Failed to restore navigation state:', error);
    }
    return null;
  }

  /**
   * Clear saved navigation state (useful when user logs out)
   */
  static async clearNavigationState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NAVIGATION_STATE_KEY);
      console.log('📱 Navigation state cleared');
    } catch (error) {
      console.error('Failed to clear navigation state:', error);
    }
  }

  /**
   * Check if navigation state should be restored based on app state
   */
  static shouldRestoreState(): boolean {
    // Always try to restore state for better UX
    // Expo Router will handle invalid states gracefully
    return true;
  }
} 