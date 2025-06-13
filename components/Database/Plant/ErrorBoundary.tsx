import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";
import { TitleText, BodyText } from "@/components/UI/Text";

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
        <View className="flex-1 justify-center items-center bg-cream-50 p-5">
          <TitleText className="text-xl text-red-500 mb-4">
            Oops! Something went wrong
          </TitleText>
          <BodyText className="text-sm text-cream-500 text-center mb-6">
            {this.state.error?.message || "An unexpected error occurred"}
          </BodyText>
          <TouchableOpacity
            className="py-2.5 px-5 bg-brand-600 rounded-lg"
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <BodyText className="text-white font-semibold">Try Again</BodyText>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
