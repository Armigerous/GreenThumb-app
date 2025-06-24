import { ReactNode, Component, ErrorInfo } from "react";

interface NavigationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface NavigationGuardState {
  hasNavigationError: boolean;
}

/**
 * NavigationGuard component that safely renders children only when navigation context is available.
 * This prevents "Couldn't find a navigation context" errors when components using useRouter
 * are rendered before the navigation context is fully established.
 */
export class NavigationGuard extends Component<
  NavigationGuardProps,
  NavigationGuardState
> {
  constructor(props: NavigationGuardProps) {
    super(props);
    this.state = { hasNavigationError: false };
  }

  static getDerivedStateFromError(error: Error): NavigationGuardState | null {
    // Check if this is a navigation context error
    if (error.message.includes("Couldn't find a navigation context")) {
      return { hasNavigationError: true };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error.message.includes("Couldn't find a navigation context")) {
      console.log(
        "NavigationGuard: Navigation context not ready, rendering fallback"
      );
    }
  }

  render() {
    if (this.state.hasNavigationError) {
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
