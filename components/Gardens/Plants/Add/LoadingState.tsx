import React from "react";
import { View } from "react-native";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

/**
 * LoadingState component for displaying a loading spinner
 *
 * Shows a centered custom animated loading spinner with an optional message.
 *
 * @param message - Optional message to display below the spinner
 */
interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return <LoadingSpinner message={message} />;
}
