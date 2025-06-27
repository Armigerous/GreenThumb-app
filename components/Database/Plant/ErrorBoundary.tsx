import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";
import { TitleText, BodyText } from "@/components/UI/Text";
import BrandedErrorPage from "@/components/UI/BrandedErrorPage";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <BrandedErrorPage
          message="We couldn't load the page. Please try again in a moment!"
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
