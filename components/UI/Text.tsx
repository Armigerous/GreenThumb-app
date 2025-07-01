import React from "react";
import { Text as RNText, TextProps, StyleSheet } from "react-native";
import { FONTS } from "@/constants/fonts";

interface EnhancedTextProps extends TextProps {
  className?: string;
  numberOfLines?: number;
}

/**
 * Title Text component with Mali font and bold styling
 */
export function TitleText({
  children,
  className = "",
  style,
  numberOfLines,
  ...props
}: EnhancedTextProps) {
  return (
    <RNText
      className={`font-title-bold ${className}`}
      style={[
        styles.title,
        {
          fontFamily: FONTS.TITLE.BOLD,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Subtitle Text component with Mali font and semibold styling
 */
export function SubtitleText({
  children,
  className = "",
  style,
  ...props
}: EnhancedTextProps) {
  return (
    <RNText
      className={`font-title-semibold ${className}`}
      style={[
        styles.subtitle,
        {
          fontFamily: FONTS.TITLE.SEMIBOLD,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Body Text component with Nunito font
 */
export function BodyText({
  children,
  className = "",
  style,
  numberOfLines,
  ...props
}: EnhancedTextProps) {
  return (
    <RNText
      className={`font-paragraph-medium ${className}`}
      style={[
        styles.body,
        {
          fontFamily: FONTS.PARAGRAPH.MEDIUM,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Regular Text component with default styling
 */
export function Text({
  children,
  className = "",
  style,
  ...props
}: EnhancedTextProps) {
  return (
    <RNText
      className={`font-paragraph ${className}`}
      style={[
        {
          fontFamily: FONTS.PARAGRAPH.REGULAR,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  title: {
    // Additional styles to make text bolder beyond what CSS can provide
    textShadowOffset: { width: 0.3, height: 0 },
    textShadowRadius: 0.1,
    textShadowColor: "#000",
    fontWeight: "900",
  },
  subtitle: {
    // Subtle shadow for semibold text
    textShadowOffset: { width: 0.2, height: 0 },
    textShadowRadius: 0.1,
    textShadowColor: "#000",
    fontWeight: "700",
  },
  body: {
    // Optional slight enhancement for body text
    fontWeight: "500",
  },
});
