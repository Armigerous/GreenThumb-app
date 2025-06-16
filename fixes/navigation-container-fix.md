# Navigation Container Error Fix

## Problem
The app was crashing with the error: "Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?"

## Root Cause
The issue was caused by mixing **React Navigation** components with **Expo Router**, which creates incompatible navigation contexts:

1. **Main Issue**: The `CustomTabBar` component in `app/(home)/_layout.tsx` was importing `BottomTabBarProps` from `@react-navigation/bottom-tabs` and using React Navigation methods (`navigation.emit`, `navigation.reset`, `navigation.navigate`) inside an Expo Router `<Tabs>` component.

2. **Secondary Issue**: Missing `SafeAreaProvider` wrapper in the main layout.

3. **Dependency Conflict**: Both `@react-navigation/native` and `@react-navigation/bottom-tabs` were installed alongside `expo-router`.

## Solution Applied

### 1. Fixed CustomTabBar Component
- Removed `BottomTabBarProps` import from `@react-navigation/bottom-tabs`
- Replaced React Navigation methods with Expo Router's `useRouter` hook
- Created custom interface `CustomTabBarProps` compatible with Expo Router
- Simplified navigation logic to use `router.push()` instead of React Navigation methods

### 2. Added SafeAreaProvider
- Wrapped the entire app in `SafeAreaProvider` in `app/_layout.tsx`
- This provides proper context for safe area handling and navigation

### 3. Removed Conflicting Dependencies
- Removed `@react-navigation/bottom-tabs`
- Removed `@react-navigation/native`
- These packages are not needed when using Expo Router

## Code Changes

### Before (app/(home)/_layout.tsx):
```typescript
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Used navigation.emit, navigation.reset, navigation.navigate
}
```

### After (app/(home)/_layout.tsx):
```typescript
import { useRouter } from "expo-router";

interface CustomTabBarProps {
  state: { index: number; routes: Array<{ key: string; name: string; }>; };
  descriptors: Record<string, { options: { title?: string; tabBarIcon?: Function; }; }>;
}

function CustomTabBar({ state, descriptors }: CustomTabBarProps) {
  const router = useRouter();
  // Uses router.push() for navigation
}
```

### Before (app/_layout.tsx):
```typescript
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ClerkProvider>
      // ... app content
    </ClerkProvider>
  </GestureHandlerRootView>
);
```

### After (app/_layout.tsx):
```typescript
return (
  <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider>
        // ... app content
      </ClerkProvider>
    </GestureHandlerRootView>
  </SafeAreaProvider>
);
```

## Best Practices for Expo Router

1. **Use Expo Router exclusively**: Don't mix React Navigation with Expo Router
2. **Navigation methods**: Use `useRouter()` hook for programmatic navigation
3. **Tab bars**: Use Expo Router's built-in `<Tabs>` component or create custom components that work with Expo Router
4. **Wrap with providers**: Always wrap your app with `SafeAreaProvider`

## Testing
After applying these fixes:
1. Clear Metro cache: `npx expo start --clear`
2. Test on both iOS and Android
3. Verify navigation between tabs works correctly
4. Ensure no more NavigationContainer errors

## Prevention
- Never install React Navigation packages when using Expo Router
- Use TypeScript to catch incompatible prop types
- Always check Expo Router documentation for navigation patterns
- Use `router.push()`, `router.replace()`, `router.back()` for navigation