# Navigation Persistence & App State Management

## Problem

Users were experiencing issues where:

1. Creating a garden and then switching to another app (backgrounding) would exit the garden creation process
2. Granting location permission ("Allow Once") would cause the user to be taken back to the gardens index page
3. The entire app would reload when returning from the background

## Root Cause

The issue was caused by the `useNavigationReady` hook resetting navigation state when the app became active:

```typescript
// PROBLEMATIC CODE (FIXED)
const handleAppStateChange = (nextState: AppStateStatus) => {
  if (nextState === "active") {
    // This was causing navigation stack resets!
    setIsReady(false);
    scheduleReadyCheck();
  }
};
```

When the app went to the background and came back:

1. The `useNavigationReady` hook would reset to `false`
2. Components using this hook (like `TabsLayout`) would show loading spinners
3. This effectively unmounted the entire navigation stack
4. Users would lose their current screen and be taken back to the default route

## Solution

### 1. Fixed `useNavigationReady` Hook

Modified the hook to NOT reset when the app becomes active:

```typescript
// FIXED CODE
const handleAppStateChange = (nextState: AppStateStatus) => {
  // REMOVED: Do not reset navigation readiness when app becomes active
  // The navigation context persists across app state changes, and resetting
  // causes the entire navigation stack to remount, losing user's current screen

  // Only log for debugging purposes
  if (nextState === "active" && hasInitialized.current) {
    console.log("🔄 App became active - navigation context preserved");
  }
};
```

### 2. Enhanced Form State Persistence

Added comprehensive form caching to the garden creation form:

- **Automatic saving**: Form data is saved to AsyncStorage on every change (debounced)
- **Step persistence**: Current step is saved and restored
- **Background handling**: Form state is saved when app goes to background
- **Cache restoration**: Form state is restored when component mounts
- **Cache expiration**: Cached data expires after 24 hours

### 3. Navigation State Utilities

Created `NavigationPersistence` utility class for future use:

```typescript
export class NavigationPersistence {
  static async saveNavigationState(state: any): Promise<void>;
  static async restoreNavigationState(): Promise<any | null>;
  static async clearNavigationState(): Promise<void>;
  static shouldRestoreState(): boolean;
}
```

## Implementation Details

### Form Caching

The garden creation form now includes:

```typescript
// Cache key for user-specific storage
const cacheKey = `garden_form_${user?.id || "anonymous"}`;

// Automatic saving with debouncing
const updateFormValues = useCallback(
  (field: string, value: any) => {
    setFormValues((prev) => {
      const newFormValues = { ...prev, [field]: value };

      // Debounced save to cache
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveFormDataToCache(newFormValues, currentStep);
      }, 500);

      return newFormValues;
    });
  },
  [currentStep, saveFormDataToCache]
);

// App state handling for persistence
useEffect(
  () => {
    const handleFormPersistence = async (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // Save current form state when app goes to background
        if (user?.id) {
          await saveFormDataToCache(formValues, currentStep);
          console.log("Saved garden form data to cache before backgrounding");
        }
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleFormPersistence
    );
    return () => subscription?.remove();
  },
  [
    /* dependencies */
  ]
);
```

### Cache Management

- **Storage**: Uses AsyncStorage with user-specific keys
- **Expiration**: 24-hour cache expiration to prevent stale data
- **Cleanup**: Cache is cleared on successful submission or cancellation
- **UI Feedback**: Shows "Continuing from where you left off" notification

## Testing

To verify the fixes work:

1. **Background Test**: Start creating a garden, switch to another app, return - form should be preserved
2. **Location Permission Test**: Request location permission, grant "Allow Once" - should stay in garden creation
3. **Step Navigation Test**: Navigate between steps, background the app, return - should maintain current step
4. **Cache Expiration Test**: Start form, wait 24+ hours, return - should start fresh

## Key Files Modified

- `lib/hooks/useNavigationReady.ts` - Fixed app state reset issue
- `components/Gardens/NewGardenForm.tsx` - Added comprehensive form caching
- `lib/navigationPersistence.ts` - Added navigation state utilities (for future use)

## Best Practices

1. **Never reset navigation state** on app state changes unless absolutely necessary
2. **Persist critical user data** (like form state) across app state changes
3. **Use debounced saving** to avoid excessive storage writes
4. **Provide user feedback** when restoring cached data
5. **Set reasonable cache expiration** to prevent stale data issues

## Prevention

To prevent similar issues in the future:

1. Always consider app state changes when implementing navigation logic
2. Test backgrounding/foregrounding scenarios during development
3. Use persistent storage for important user input
4. Avoid resetting navigation state unless the navigation context is actually destroyed
5. Log navigation state changes for debugging purposes
