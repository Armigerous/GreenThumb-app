import React from "react";
import { View } from "react-native";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";

/**
 * LoadingState component for displaying a loading spinner
 *
 * Shows a centered custom animated loading spinner with an optional message.
 *
 * @param message - Optional message to display below the spinner
 * @param backgroundColor - Background color class for the container
 */
interface LoadingStateProps {
  message?: string;
  backgroundColor?: string;
}

export default function LoadingState({
  message = "Loading...",
  backgroundColor = "bg-transparent",
}: LoadingStateProps) {
  return <LoadingSpinner message={message} backgroundColor={backgroundColor} />;
}
