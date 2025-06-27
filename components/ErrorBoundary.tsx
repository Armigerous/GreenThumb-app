import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { captureException, addBreadcrumb } from "@/lib/sentry";
import BrandedErrorPage from "@/components/UI/BrandedErrorPage";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to Sentry
    addBreadcrumb("Error boundary caught error", "error");

    captureException(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo,
    });

    console.error("Error caught by boundary:", error);
    console.error("Error info:", errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    addBreadcrumb("User retried after error", "user");
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Branded fallback UI
      return (
        <BrandedErrorPage
          message="We couldn't load the page. Please try again in a moment!"
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  errorDetails: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#7f1d1d",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
