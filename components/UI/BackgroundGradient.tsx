import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * BackgroundGradient component
 *
 * Provides a consistent background gradient for all screens in the app.
 * Default is a green to amber gradient that matches the tailwind classes:
 * "from-green-50 to-amber-50"
 *
 * This component ensures a consistent visual appearance across the application
 * by applying the same gradient background to all screens wrapped with it.
 *
 * @param children - Components to render within the gradient background
 * @param style - Optional additional styles to apply to the container
 * @param customColors - Optional custom gradient colors (defaults to green-amber)
 * @param start - Optional custom gradient start point (defaults to top)
 * @param end - Optional custom gradient end point (defaults to bottom)
 * @param containerStyle - Optional styles to apply to the inner container
 */
interface BackgroundGradientProps {
  children: ReactNode;
  style?: ViewStyle;
  // For Expo's LinearGradient, we need at least two colors
  customColors?: [string, string] | [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  containerStyle?: ViewStyle;
}

export function BackgroundGradient({
  children,
  style,
  customColors,
  start,
  end,
  containerStyle,
}: BackgroundGradientProps) {
  // Default colors for the gradient (green-50 to amber-50 in tailwind)
  const defaultColors: [string, string] = ["#ECF4E7", "#fffaef"];

  // Use provided start/end points or fall back to defaults (top to bottom)
  const gradientStart = start || { x: 0, y: 0 };
  const gradientEnd = end || { x: 0, y: 1 };

  return (
    <LinearGradient
      colors={customColors || defaultColors}
      style={[styles.gradient, style]}
      start={gradientStart}
      end={gradientEnd}
    >
      <View style={[styles.container, containerStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
});
