import { ReactNode } from "react";
import { useRouter } from "expo-router";

interface NavigationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * NavigationGuard component that safely renders children only when navigation context is available.
 * This prevents "Couldn't find a navigation context" errors when components using useRouter
 * are rendered before the navigation context is fully established.
 */
export function NavigationGuard({
  children,
  fallback = null,
}: NavigationGuardProps) {
  try {
    // Try to access the router - if it fails, we know navigation context isn't ready
    const router = useRouter();

    // If we get here, navigation context is available
    return <>{children}</>;
  } catch (error) {
    // Navigation context not available yet, render fallback
    console.log(
      "NavigationGuard: Navigation context not ready, rendering fallback"
    );
    return <>{fallback}</>;
  }
}
